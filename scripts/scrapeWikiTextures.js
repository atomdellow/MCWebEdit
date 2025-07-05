#!/usr/bin/env node

/**
 * MCWebEdit Wiki Texture Scraper
 * Intelligently scrapes texture URLs from the Minecraft Wiki gallery structure
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Target directory for textures
const TEXTURES_DIR = path.join(__dirname, '..', 'client', 'public', 'assets', 'textures', 'blocks');

/**
 * Fetch content from a URL with retries
 */
function fetchContent(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        fetchContent(response.headers.location, retries).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });

    request.on('error', (error) => {
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => {
          fetchContent(url, retries - 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(error);
      }
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract image URLs from gallery structure
 */
function extractGalleryImageUrls(html) {
  const galleryUrls = new Map();
  
  // Look for images with data-image-name attribute (lazy loaded images)
  const lazyImageRegex = /<img[^>]*data-image-name="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi;
  const lazyMatches = html.matchAll(lazyImageRegex);
  
  for (const match of lazyMatches) {
    const imageName = match[1];
    const altText = match[2];
    
    // Skip non-texture images
    if (!imageName.includes('texture') && !isKnownBlockTexture(altText)) {
      continue;
    }
    
    // Construct the image URL from the data-image-name
    const imageUrl = constructImageUrl(imageName);
    const blockName = extractBlockName(altText, imageName);
    
    if (blockName && imageUrl) {
      galleryUrls.set(blockName, {
        url: imageUrl,
        altText: altText,
        imageName: imageName,
        minecraftId: `minecraft:${blockName}`
      });
    }
  }
  
  // Also look for direct image URLs in the content
  const directImageRegex = /<img[^>]*src="(https:\/\/static\.wikia\.nocookie\.net\/minecraft_gamepedia\/images\/[^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi;
  const directMatches = html.matchAll(directImageRegex);
  
  for (const match of directMatches) {
    let imageUrl = match[1];
    const altText = match[2];
    
    // Skip non-texture images
    if (!imageUrl.includes('texture') && !isKnownBlockTexture(altText)) {
      continue;
    }
    
    // Clean up the URL
    const pngIndex = imageUrl.indexOf('.png');
    if (pngIndex !== -1) {
      imageUrl = imageUrl.substring(0, pngIndex + 4);
    }
    
    const blockName = extractBlockName(altText, imageUrl);
    if (blockName && !galleryUrls.has(blockName)) {
      galleryUrls.set(blockName, {
        url: imageUrl,
        altText: altText,
        minecraftId: `minecraft:${blockName}`
      });
    }
  }
  
  return galleryUrls;
}

/**
 * Construct image URL from data-image-name
 */
function constructImageUrl(imageName) {
  // The wiki uses this pattern for image URLs
  const encodedName = encodeURIComponent(imageName);
  return `https://static.wikia.nocookie.net/minecraft_gamepedia/images/${getImagePath(imageName)}`;
}

/**
 * Get the full path for an image based on the wiki's naming convention
 */
function getImagePath(imageName) {
  // The wiki organizes images by first character and first two characters
  const name = imageName.replace(/\s+/g, '_');
  const firstChar = name.charAt(0).toLowerCase();
  const firstTwo = name.substring(0, 2).toLowerCase();
  
  // Most texture images follow this pattern
  const encodedName = encodeURIComponent(imageName);
  return `${firstChar}/${firstTwo}/${encodedName}/revision/latest`;
}

/**
 * Check if this is a known block texture based on alt text
 */
function isKnownBlockTexture(altText) {
  const blockKeywords = [
    'stone', 'cobblestone', 'granite', 'diorite', 'andesite',
    'dirt', 'grass', 'sand', 'gravel', 'clay',
    'oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark oak',
    'planks', 'log', 'wood',
    'wool', 'concrete', 'terracotta', 'glass',
    'ore', 'diamond', 'gold', 'iron', 'coal', 'redstone', 'emerald', 'lapis',
    'block', 'bricks', 'obsidian', 'netherrack', 'endstone',
    'prismarine', 'quartz', 'sandstone'
  ];
  
  const altLower = altText.toLowerCase();
  return blockKeywords.some(keyword => altLower.includes(keyword));
}

/**
 * Extract meaningful block name from alt text or URL
 */
function extractBlockName(altText, imageUrlOrName) {
  // Common block name mappings and patterns
  const blockMappings = {
    // Basic blocks
    'Stone': 'stone',
    'Cobblestone': 'cobblestone',
    'Mossy Cobblestone': 'mossy_cobblestone',
    'Granite': 'granite',
    'Polished Granite': 'polished_granite',
    'Diorite': 'diorite',
    'Polished Diorite': 'polished_diorite',
    'Andesite': 'andesite',
    'Polished Andesite': 'polished_andesite',
    
    // Natural blocks
    'Grass Block top': 'grass_block_top',
    'Grass Block side': 'grass_block',
    'Dirt': 'dirt',
    'Coarse Dirt': 'coarse_dirt',
    'Podzol top': 'podzol_top',
    'Podzol side': 'podzol',
    'Sand': 'sand',
    'Red Sand': 'red_sand',
    'Gravel': 'gravel',
    'Clay': 'clay',
    
    // Wood blocks
    'Oak Planks': 'oak_planks',
    'Spruce Planks': 'spruce_planks',
    'Birch Planks': 'birch_planks',
    'Jungle Planks': 'jungle_planks',
    'Acacia Planks': 'acacia_planks',
    'Dark Oak Planks': 'dark_oak_planks',
    'Mangrove Planks': 'mangrove_planks',
    'Cherry Planks': 'cherry_planks',
    'Bamboo Planks': 'bamboo_planks',
    
    'Oak Log side': 'oak_log',
    'Spruce Log side': 'spruce_log', 
    'Birch Log side': 'birch_log',
    'Jungle Log side': 'jungle_log',
    'Acacia Log side': 'acacia_log',
    'Dark Oak Log side': 'dark_oak_log',
    'Mangrove Log side': 'mangrove_log',
    'Cherry Log side': 'cherry_log',
    
    // Ores
    'Coal Ore': 'coal_ore',
    'Iron Ore': 'iron_ore',
    'Gold Ore': 'gold_ore',
    'Diamond Ore': 'diamond_ore',
    'Emerald Ore': 'emerald_ore',
    'Lapis Lazuli Ore': 'lapis_ore',
    'Redstone Ore': 'redstone_ore',
    'Copper Ore': 'copper_ore',
    
    // Blocks
    'Block of Coal': 'coal_block',
    'Block of Iron': 'iron_block',
    'Block of Gold': 'gold_block',
    'Block of Diamond': 'diamond_block',
    'Block of Emerald': 'emerald_block',
    'Block of Lapis Lazuli': 'lapis_block',
    'Block of Redstone': 'redstone_block',
    'Block of Copper': 'copper_block',
    
    // Glass
    'Glass': 'glass',
    'White Stained Glass': 'white_stained_glass',
    'Orange Stained Glass': 'orange_stained_glass',
    'Magenta Stained Glass': 'magenta_stained_glass',
    'Light Blue Stained Glass': 'light_blue_stained_glass',
    'Yellow Stained Glass': 'yellow_stained_glass',
    'Lime Stained Glass': 'lime_stained_glass',
    'Pink Stained Glass': 'pink_stained_glass',
    'Gray Stained Glass': 'gray_stained_glass',
    'Light Gray Stained Glass': 'light_gray_stained_glass',
    'Cyan Stained Glass': 'cyan_stained_glass',
    'Purple Stained Glass': 'purple_stained_glass',
    'Blue Stained Glass': 'blue_stained_glass',
    'Brown Stained Glass': 'brown_stained_glass',
    'Green Stained Glass': 'green_stained_glass',
    'Red Stained Glass': 'red_stained_glass',
    'Black Stained Glass': 'black_stained_glass',
    
    // Wool
    'White Wool': 'white_wool',
    'Orange Wool': 'orange_wool',
    'Magenta Wool': 'magenta_wool',
    'Light Blue Wool': 'light_blue_wool',
    'Yellow Wool': 'yellow_wool',
    'Lime Wool': 'lime_wool',
    'Pink Wool': 'pink_wool',
    'Gray Wool': 'gray_wool',
    'Light Gray Wool': 'light_gray_wool',
    'Cyan Wool': 'cyan_wool',
    'Purple Wool': 'purple_wool',
    'Blue Wool': 'blue_wool',
    'Brown Wool': 'brown_wool',
    'Green Wool': 'green_wool',
    'Red Wool': 'red_wool',
    'Black Wool': 'black_wool',
    
    // Other important blocks
    'Bricks': 'bricks',
    'Obsidian': 'obsidian',
    'Netherrack': 'netherrack',
    'End Stone': 'end_stone',
    'Glowstone': 'glowstone',
    'TNT': 'tnt',
    'Bookshelf': 'bookshelf',
    'Stone Bricks': 'stone_bricks',
    'Mossy Stone Bricks': 'mossy_stone_bricks',
    'Cracked Stone Bricks': 'cracked_stone_bricks',
    'Chiseled Stone Bricks': 'chiseled_stone_bricks',
    'Ice': 'ice',
    'Snow': 'snow_block',
    'Soul Sand': 'soul_sand',
    'Sandstone side': 'sandstone',
    'Red Sandstone side': 'red_sandstone',
    'Prismarine': 'prismarine',
    'Prismarine Bricks': 'prismarine_bricks',
    'Dark Prismarine': 'dark_prismarine',
    'Sea Lantern': 'sea_lantern',
    'Hay Bale side': 'hay_block',
    'Terracotta': 'terracotta'
  };
  
  // Check exact matches first
  if (blockMappings[altText]) {
    return blockMappings[altText];
  }
  
  // Try partial matches and cleanup
  const altClean = altText.replace(/\s*\(texture\).*$/, '').trim();
  if (blockMappings[altClean]) {
    return blockMappings[altClean];
  }
  
  // Try without direction/side indicators
  const altNoSide = altText.replace(/\s+(top|side|bottom|front|back).*$/, '').trim();
  if (blockMappings[altNoSide]) {
    return blockMappings[altNoSide];
  }
  
  // Try from image filename if available
  if (imageUrlOrName) {
    for (const [pattern, blockName] of Object.entries(blockMappings)) {
      const patternClean = pattern.toLowerCase().replace(/[^a-z]/g, '');
      if (imageUrlOrName.toLowerCase().includes(patternClean)) {
        return blockName;
      }
    }
  }
  
  // Generic fallback: convert alt text to block name format
  const words = altText.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !['texture', 'je', 'be', 'only'].includes(w));
  
  if (words.length > 0) {
    let blockName = words.join('_');
    
    // Handle special cases
    if (blockName === 'grass_block') return 'grass_block';
    if (blockName.startsWith('block_of_')) {
      blockName = blockName.replace('block_of_', '') + '_block';
    }
    
    return blockName;
  }
  
  return null;
}

/**
 * Download an image from URL to file
 */
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        require('fs').unlink(outputPath, () => {}); // Delete the file on error
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });

    request.on('error', (error) => {
      file.close();
      require('fs').unlink(outputPath, () => {}); // Delete the file on error
      reject(error);
    });

    file.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Main scraping and downloading function
 */
async function scrapeAndDownloadTextures(forceDownload = false) {
  console.log('🔍 Scraping Minecraft Wiki for block textures...');
  
  try {
    // Ensure textures directory exists
    await fs.mkdir(TEXTURES_DIR, { recursive: true });
    
    // Fetch the wiki page
    const wikiUrl = 'https://minecraft.fandom.com/wiki/List_of_block_textures';
    console.log(`📥 Fetching ${wikiUrl}...`);
    
    const htmlContent = await fetchContent(wikiUrl);
    console.log('✅ Wiki page fetched successfully');
    
    // Extract texture URLs from gallery
    console.log('🔍 Extracting texture URLs from gallery...');
    const textureUrls = extractGalleryImageUrls(htmlContent);
    
    console.log(`🎯 Found ${textureUrls.size} potential textures`);
    
    // Download textures
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const [blockName, textureInfo] of textureUrls) {
      const outputPath = path.join(TEXTURES_DIR, `${blockName}.png`);
      
      try {
        // Check if file exists and skip if not forcing
        if (!forceDownload) {
          try {
            await fs.access(outputPath);
            console.log(`⏭️  Skipping ${blockName} (already exists)`);
            skipped++;
            continue;
          } catch {
            // File doesn't exist, proceed with download
          }
        }
        
        console.log(`⬇️  Downloading ${blockName}...`);
        await downloadImage(textureInfo.url, outputPath);
        console.log(`✅ Downloaded ${blockName}`);
        downloaded++;
        
        // Rate limiting - be nice to the wiki
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Failed to download ${blockName}: ${error.message}`);
        failed++;
      }
    }
    
    // Summary
    console.log('\n📊 Download Summary:');
    console.log(`✅ Downloaded: ${downloaded}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total found: ${textureUrls.size}`);
    
    if (failed > 0) {
      console.log('\n⚠️  Some textures failed to download. This might be due to:');
      console.log('   - Network issues');
      console.log('   - Changed URLs on the wiki');
      console.log('   - Rate limiting');
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. The textures are now in client/public/assets/textures/blocks/');
    console.log('2. MCWebEdit will automatically try to load them');
    console.log('3. Enable textures in the 3D viewport settings');
    
    // Create texture mapping file for developers
    const mappingData = {};
    for (const [blockName, textureInfo] of textureUrls) {
      mappingData[textureInfo.minecraftId] = `${blockName}.png`;
    }
    
    const mappingPath = path.join(TEXTURES_DIR, 'texture-mappings.json');
    await fs.writeFile(mappingPath, JSON.stringify(mappingData, null, 2));
    console.log(`📄 Texture mappings saved to: ${mappingPath}`);
    
  } catch (error) {
    console.error('❌ Error during scraping:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('MCWebEdit Wiki Texture Scraper');
  console.log('Usage: node scrapeWikiTextures.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --force, -f    Re-download existing textures');
  console.log('');
  console.log('This script intelligently scrapes block textures from the Minecraft Wiki');
  console.log('gallery structure and downloads them for use in MCWebEdit.');
  process.exit(0);
}

const forceDownload = args.includes('--force') || args.includes('-f');
if (forceDownload) {
  console.log('🔄 Force mode enabled - will re-download existing textures');
}

// Run the scraper
scrapeAndDownloadTextures(forceDownload).catch(console.error);
