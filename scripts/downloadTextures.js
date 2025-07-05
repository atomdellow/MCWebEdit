#!/usr/bin/env node

/**
 * MCWebEdit Texture Downloader
 * Downloads block textures from Minecraft Wiki and organizes them by block names
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Target directory for textures
const TEXTURES_DIR = path.join(__dirname, '..', 'client', 'public', 'assets', 'textures', 'blocks');

// Block mappings from our blockTypes.js to wiki texture names
const TEXTURE_MAPPINGS = {
  // Building blocks
  'minecraft:stone': 'Stone_(texture)_JE5_BE3.png',
  'minecraft:cobblestone': 'Cobblestone_(texture)_JE5_BE3.png',
  'minecraft:granite': 'Granite_(texture)_JE2_BE2.png',
  'minecraft:polished_granite': 'Polished_Granite_(texture)_JE2_BE2.png',
  'minecraft:diorite': 'Diorite_(texture)_JE4_BE3.png',
  'minecraft:polished_diorite': 'Polished_Diorite_(texture)_JE2_BE2.png',
  'minecraft:andesite': 'Andesite_(texture)_JE3_BE2.png',
  'minecraft:polished_andesite': 'Polished_Andesite_(texture)_JE2_BE2.png',
  
  // Natural blocks
  'minecraft:grass_block': 'Grass_Block_(side_texture)_JE7_BE6.png',
  'minecraft:dirt': 'Dirt_(texture)_JE2_BE2.png',
  'minecraft:coarse_dirt': 'Coarse_Dirt_(texture)_JE2_BE2.png',
  'minecraft:podzol': 'Podzol_(side_texture)_JE2_BE2.png',
  'minecraft:sand': 'Sand_(texture)_JE5_BE3.png',
  'minecraft:red_sand': 'Red_Sand_(texture)_JE3_BE2.png',
  'minecraft:gravel': 'Gravel_(texture)_JE5_BE4.png',
  'minecraft:clay': 'Clay_(texture)_JE2_BE2.png',
  
  // Wood blocks
  'minecraft:oak_planks': 'Oak_Planks_(texture)_JE6_BE3.png',
  'minecraft:spruce_planks': 'Spruce_Planks_(texture)_JE6_BE3.png',
  'minecraft:birch_planks': 'Birch_Planks_(texture)_JE6_BE3.png',
  'minecraft:jungle_planks': 'Jungle_Planks_(texture)_JE3_BE2.png',
  'minecraft:acacia_planks': 'Acacia_Planks_(texture)_JE3_BE2.png',
  'minecraft:dark_oak_planks': 'Dark_Oak_Planks_(texture)_JE6_BE3.png',
  
  'minecraft:oak_log': 'Oak_Log_(texture)_JE5_BE3.png',
  'minecraft:spruce_log': 'Spruce_Log_(texture)_JE3_BE2.png',
  'minecraft:birch_log': 'Birch_Log_(texture)_JE5_BE3.png',
  'minecraft:jungle_log': 'Jungle_Log_(texture)_JE2.png',
  'minecraft:acacia_log': 'Acacia_Log_(texture)_JE4_BE2.png',
  'minecraft:dark_oak_log': 'Dark_Oak_Log_(texture)_JE6_BE3.png',
  
  // Leaves (transparent)
  'minecraft:oak_leaves': 'Oak_Leaves_(texture)_JE3.png',
  'minecraft:spruce_leaves': 'Spruce_Leaves_(texture)_JE3.png',
  'minecraft:birch_leaves': 'Birch_Leaves_(texture)_JE3.png',
  'minecraft:jungle_leaves': 'Jungle_Leaves_(texture)_JE3.png',
  'minecraft:acacia_leaves': 'Acacia_Leaves_(texture)_JE3.png',
  'minecraft:dark_oak_leaves': 'Dark_Oak_Leaves_(texture)_JE3.png',
  
  // Ores
  'minecraft:coal_ore': 'Coal_Ore_(texture)_JE4_BE4.png',
  'minecraft:iron_ore': 'Iron_Ore_(texture)_JE6_BE5.png',
  'minecraft:gold_ore': 'Gold_Ore_(texture)_JE5_BE5.png',
  'minecraft:diamond_ore': 'Diamond_Ore_(texture)_JE5_BE5.png',
  'minecraft:emerald_ore': 'Emerald_Ore_(texture)_JE4_BE4.png',
  'minecraft:redstone_ore': 'Redstone_Ore_(texture)_JE4_BE3.png',
  'minecraft:lapis_ore': 'Lapis_Lazuli_Ore_(texture)_JE3_BE3.png',
  
  // Stone variants
  'minecraft:stone_bricks': 'Stone_Bricks_(texture)_JE3_BE2.png',
  'minecraft:mossy_stone_bricks': 'Mossy_Stone_Bricks_(texture)_JE3_BE2.png',
  'minecraft:cracked_stone_bricks': 'Cracked_Stone_Bricks_(texture)_JE3_BE2.png',
  'minecraft:chiseled_stone_bricks': 'Chiseled_Stone_Bricks_(texture)_JE3_BE2.png',
  'minecraft:mossy_cobblestone': 'Mossy_Cobblestone_(texture)_JE4_BE3.png',
  
  // Sandstone
  'minecraft:sandstone': 'Sandstone_(side_texture)_JE4_BE3.png',
  'minecraft:chiseled_sandstone': 'Chiseled_Sandstone_(texture)_JE4_BE2.png',
  'minecraft:smooth_sandstone': 'Smooth_Sandstone_(texture)_JE2_BE2.png',
  'minecraft:red_sandstone': 'Red_Sandstone_(side_texture)_JE2_BE2.png',
  
  // Glass
  'minecraft:glass': 'Glass_(texture)_JE4_BE2.png',
  
  // Other important blocks
  'minecraft:obsidian': 'Obsidian_(texture)_JE3_BE2.png',
  'minecraft:bedrock': 'Bedrock_(texture)_JE2_BE2.png',
  'minecraft:bricks': 'Bricks_(texture)_JE5_BE3.png',
  'minecraft:bookshelf': 'Bookshelf_(texture)_JE2_BE2.png',
  'minecraft:tnt': 'TNT_(side_texture)_JE3_BE2.png',
  'minecraft:crafting_table': 'Crafting_Table_(side_texture)_JE4.png',
  
  // Blocks of materials
  'minecraft:gold_block': 'Block_of_Gold_(texture)_JE4_BE3.png',
  'minecraft:iron_block': 'Block_of_Iron_(texture)_JE4_BE3.png',
  'minecraft:diamond_block': 'Block_of_Diamond_(texture)_JE4_BE3.png',
  'minecraft:emerald_block': 'Block_of_Emerald_(texture)_JE4_BE3.png',
  'minecraft:lapis_block': 'Block_of_Lapis_Lazuli_(texture)_JE3_BE3.png',
  'minecraft:coal_block': 'Block_of_Coal_(texture)_JE3_BE2.png',
  'minecraft:quartz_block': 'Block_of_Quartz_(side_texture)_JE2_BE2.png',
  
  // Wool colors
  'minecraft:white_wool': 'White_Wool_(texture)_JE3_BE3.png',
  'minecraft:orange_wool': 'Orange_Wool_(texture)_JE3_BE3.png',
  'minecraft:magenta_wool': 'Magenta_Wool_(texture)_JE3_BE3.png',
  'minecraft:light_blue_wool': 'Light_Blue_Wool_(texture)_JE3_BE3.png',
  'minecraft:yellow_wool': 'Yellow_Wool_(texture)_JE3_BE3.png',
  'minecraft:lime_wool': 'Lime_Wool_(texture)_JE3_BE3.png',
  'minecraft:pink_wool': 'Pink_Wool_(texture)_JE3_BE3.png',
  'minecraft:gray_wool': 'Gray_Wool_(texture)_JE3_BE3.png',
  'minecraft:light_gray_wool': 'Light_Gray_Wool_(texture)_JE3_BE3.png',
  'minecraft:cyan_wool': 'Cyan_Wool_(texture)_JE3_BE3.png',
  'minecraft:purple_wool': 'Purple_Wool_(texture)_JE3_BE3.png',
  'minecraft:blue_wool': 'Blue_Wool_(texture)_JE3_BE3.png',
  'minecraft:brown_wool': 'Brown_Wool_(texture)_JE3_BE3.png',
  'minecraft:green_wool': 'Green_Wool_(texture)_JE3_BE3.png',
  'minecraft:red_wool': 'Red_Wool_(texture)_JE3_BE3.png',
  'minecraft:black_wool': 'Black_Wool_(texture)_JE3_BE3.png',
  
  // Terracotta
  'minecraft:terracotta': 'Terracotta_(texture)_JE2_BE2.png',
  'minecraft:white_terracotta': 'White_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:orange_terracotta': 'Orange_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:magenta_terracotta': 'Magenta_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:light_blue_terracotta': 'Light_Blue_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:yellow_terracotta': 'Yellow_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:lime_terracotta': 'Lime_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:pink_terracotta': 'Pink_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:gray_terracotta': 'Gray_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:light_gray_terracotta': 'Light_Gray_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:cyan_terracotta': 'Cyan_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:purple_terracotta': 'Purple_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:blue_terracotta': 'Blue_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:brown_terracotta': 'Brown_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:green_terracotta': 'Green_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:red_terracotta': 'Red_Terracotta_(texture)_JE1_BE1.png',
  'minecraft:black_terracotta': 'Black_Terracotta_(texture)_JE1_BE1.png',
  
  // Concrete
  'minecraft:white_concrete': 'White_Concrete_(texture)_JE1_BE1.png',
  'minecraft:orange_concrete': 'Orange_Concrete_(texture)_JE1_BE1.png',
  'minecraft:magenta_concrete': 'Magenta_Concrete_(texture)_JE1_BE1.png',
  'minecraft:light_blue_concrete': 'Light_Blue_Concrete_(texture)_JE1_BE1.png',
  'minecraft:yellow_concrete': 'Yellow_Concrete_(texture)_JE1_BE1.png',
  'minecraft:lime_concrete': 'Lime_Concrete_(texture)_JE1_BE1.png',
  'minecraft:pink_concrete': 'Pink_Concrete_(texture)_JE1_BE1.png',
  'minecraft:gray_concrete': 'Gray_Concrete_(texture)_JE1_BE1.png',
  'minecraft:light_gray_concrete': 'Light_Gray_Concrete_(texture)_JE1_BE1.png',
  'minecraft:cyan_concrete': 'Cyan_Concrete_(texture)_JE1_BE1.png',
  'minecraft:purple_concrete': 'Purple_Concrete_(texture)_JE1_BE1.png',
  'minecraft:blue_concrete': 'Blue_Concrete_(texture)_JE1_BE1.png',
  'minecraft:brown_concrete': 'Brown_Concrete_(texture)_JE1_BE1.png',
  'minecraft:green_concrete': 'Green_Concrete_(texture)_JE1_BE1.png',
  'minecraft:red_concrete': 'Red_Concrete_(texture)_JE1_BE1.png',
  'minecraft:black_concrete': 'Black_Concrete_(texture)_JE1_BE1.png',
  
  // Nether blocks
  'minecraft:netherrack': 'Netherrack_(texture)_JE4_BE3.png',
  'minecraft:soul_sand': 'Soul_Sand_(texture)_JE2_BE2.png',
  'minecraft:glowstone': 'Glowstone_(texture)_JE4_BE3.png',
  'minecraft:nether_bricks': 'Nether_Bricks_(texture)_JE3_BE4.png',
  'minecraft:magma_block': 'Magma_Block_(texture)_JE2_BE2.png',
  
  // End blocks
  'minecraft:end_stone': 'End_Stone_(texture)_JE3_BE2.png',
  'minecraft:purpur_block': 'Purpur_Block_(texture)_JE2_BE2.png',
  'minecraft:end_stone_bricks': 'End_Stone_Bricks_(texture)_JE2_BE2.png',
  
  // Prismarine
  'minecraft:prismarine': 'Prismarine_(texture)_JE2_BE2.png',
  'minecraft:prismarine_bricks': 'Prismarine_Bricks_(texture)_JE2_BE2.png',
  'minecraft:dark_prismarine': 'Dark_Prismarine_(texture)_JE2_BE2.png',
  'minecraft:sea_lantern': 'Sea_Lantern_(texture)_JE1_BE1.png',
  
  // Ice
  'minecraft:ice': 'Ice_(texture)_JE2_BE3.png',
  'minecraft:packed_ice': 'Packed_Ice_(texture)_JE1_BE1.png',
  'minecraft:snow_block': 'Snow_(texture)_JE2_BE2.png',
  
  // Others
  'minecraft:hay_block': 'Hay_Bale_(side_texture)_JE2_BE2.png',
  'minecraft:sponge': 'Sponge_(texture)_JE3_BE3.png',
  'minecraft:wet_sponge': 'Wet_Sponge_(texture)_JE2_BE2.png',
  'minecraft:slime_block': 'Slime_Block_(texture)_JE2_BE3.png',
  'minecraft:cactus': 'Cactus_(side_texture)_JE4_BE2.png',
  
  // Fluids - these might be animated but we'll get static versions
  'minecraft:water': 'Water_(texture)_JE4.png',
  'minecraft:lava': 'Lava_(texture)_JE10_BE11.png'
};

// Base URL for Minecraft Wiki static assets
const WIKI_BASE_URL = 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/';

/**
 * Download a file from URL to local path
 */
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            await fs.writeFile(outputPath, buffer);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
        } else {
          reject(new Error(`Redirect without location header for ${url}`));
        }
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * Convert wiki filename to direct URL
 */
function getWikiImageUrl(filename) {
  // Wiki URLs follow a pattern: first letter/first two letters/filename
  const firstChar = filename.charAt(0);
  const firstTwoChars = filename.substring(0, 2);
  return `${WIKI_BASE_URL}${firstChar}/${firstTwoChars}/${filename}`;
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Main function to download all textures
 */
async function downloadTextures() {
  console.log('🎨 MCWebEdit Texture Downloader');
  console.log('===============================');
  
  // Ensure textures directory exists
  await ensureDir(TEXTURES_DIR);
  
  const totalTextures = Object.keys(TEXTURE_MAPPINGS).length;
  let downloaded = 0;
  let failed = 0;
  
  console.log(`📥 Downloading ${totalTextures} textures...`);
  
  for (const [blockType, wikiFilename] of Object.entries(TEXTURE_MAPPINGS)) {
    try {
      const blockName = blockType.replace('minecraft:', '');
      const outputPath = path.join(TEXTURES_DIR, `${blockName}.png`);
      
      // Check if file already exists
      try {
        await fs.access(outputPath);
        console.log(`⏭️  Skipping ${blockName} (already exists)`);
        downloaded++;
        continue;
      } catch {
        // File doesn't exist, proceed with download
      }
      
      const url = getWikiImageUrl(wikiFilename);
      console.log(`⬇️  Downloading ${blockName}...`);
      
      await downloadFile(url, outputPath);
      downloaded++;
      console.log(`✅ Downloaded ${blockName}`);
      
      // Small delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      failed++;
      console.error(`❌ Failed to download ${blockType}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Download Summary:');
  console.log(`✅ Successfully downloaded: ${downloaded}/${totalTextures}`);
  console.log(`❌ Failed: ${failed}/${totalTextures}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some textures failed to download. This might be due to:');
    console.log('   - Changed filenames on the wiki');
    console.log('   - Network issues');
    console.log('   - Rate limiting');
    console.log('\n💡 You can re-run this script to retry failed downloads.');
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. The textures are now in client/public/assets/textures/blocks/');
  console.log('2. MCWebEdit will automatically try to load them');
  console.log('3. Enable textures in the 3D viewport settings');
  
  // Create a texture status report
  const statusReport = {
    timestamp: new Date().toISOString(),
    totalBlocks: totalTextures,
    downloaded: downloaded,
    failed: failed,
    blocks: {}
  };
  
  for (const [blockType, wikiFilename] of Object.entries(TEXTURE_MAPPINGS)) {
    const blockName = blockType.replace('minecraft:', '');
    const outputPath = path.join(TEXTURES_DIR, `${blockName}.png`);
    
    try {
      await fs.access(outputPath);
      statusReport.blocks[blockType] = { status: 'available', filename: `${blockName}.png` };
    } catch {
      statusReport.blocks[blockType] = { status: 'missing', filename: `${blockName}.png`, wikiSource: wikiFilename };
    }
  }
  
  const reportPath = path.join(TEXTURES_DIR, 'texture-status.json');
  await fs.writeFile(reportPath, JSON.stringify(statusReport, null, 2));
  console.log(`📄 Texture status report saved to: ${reportPath}`);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('MCWebEdit Texture Downloader');
  console.log('Usage: node downloadTextures.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --force, -f    Re-download existing textures');
  console.log('');
  console.log('This script downloads Minecraft block textures from the official wiki');
  console.log('and organizes them for use in MCWebEdit.');
  process.exit(0);
}

const forceDownload = args.includes('--force') || args.includes('-f');
if (forceDownload) {
  console.log('🔄 Force mode enabled - will re-download existing textures');
}

// Run the downloader
downloadTextures().catch(console.error);
