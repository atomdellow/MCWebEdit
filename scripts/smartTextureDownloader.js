const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const WIKI_URL = 'https://minecraft.fandom.com/wiki/List_of_block_textures';
const TEXTURE_DIR = path.join(__dirname, '..', 'client', 'public', 'assets', 'textures', 'blocks');
const STATUS_FILE = path.join(TEXTURE_DIR, 'texture-status.json');

// Track progress
let downloadStats = {
    attempted: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: []
};

/**
 * Extract image URLs from the wiki page by parsing the content structure
 */
async function scrapeTextureUrls() {
    console.log('🌐 Loading Minecraft Wiki page...');
    const browser = await puppeteer.launch({ 
        headless: true, // Set back to true for regular operation
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    try {
        console.log('🌐 Navigating to:', WIKI_URL);
        await page.goto(WIKI_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        
        console.log('✅ Page loaded successfully');
        console.log('📄 Page title:', await page.title());
        
        // Check if we have basic content
        const bodyText = await page.evaluate(() => document.body.textContent.length);
        console.log(`📝 Page content length: ${bodyText} characters`);
        
        // Check for any images at all
        const imageCount = await page.evaluate(() => document.querySelectorAll('img').length);
        console.log(`🖼️ Total images found: ${imageCount}`);
        
        // Extract texture information from the structured content
        const textures = await page.evaluate(() => {
            const textureMap = new Map();
            
            console.log('Starting texture extraction...');
            console.log('Page URL:', window.location.href);
            console.log('Page title:', document.title);
            
            // Debug: Check what content we have
            const allImages = document.querySelectorAll('img');
            console.log(`Total images on page: ${allImages.length}`);
            
            const wikiImages = Array.from(allImages).filter(img => 
                img.src && (img.src.includes('minecraft_gamepedia') || img.src.includes('static.wikia'))
            );
            console.log(`Minecraft wiki images: ${wikiImages.length}`);
            
            // Sample the first few images for debugging
            wikiImages.slice(0, 5).forEach((img, i) => {
                console.log(`Sample image ${i + 1}:`, img.src);
                console.log(`  alt: "${img.alt || 'none'}"`);
                console.log(`  title: "${img.title || 'none'}"`);
            });
            
            // Method 0: Extract directly from the found images
            console.log('Method 0: Processing wiki images directly...');
            wikiImages.forEach(img => {
                const cleanUrl = cleanImageUrl(img.src);
                if (!cleanUrl) return;
                
                const alt = img.alt || '';
                const title = img.title || '';
                const text = `${alt} ${title}`.trim();
                
                if (!text) {
                    // Try to get text from parent link or nearby text
                    const parentLink = img.closest('a');
                    if (parentLink && parentLink.textContent) {
                        text = parentLink.textContent.trim();
                    }
                }
                
                if (!text) return;
                
                const blockName = extractBlockName(text);
                if (blockName && blockName.length > 1 && isValidBlockName(text)) {
                    console.log(`Found texture: ${blockName} from "${text}"`);
                    if (!textureMap.has(blockName)) {
                        textureMap.set(blockName, {
                            url: cleanUrl,
                            source: 'direct-image',
                            originalText: text,
                            method: 'image-parsing'
                        });
                    }
                }
            });
            
            // Function to extract block name from various text formats
            function extractBlockName(text) {
                if (!text) return null;
                
                // Common patterns to clean up
                let name = text
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links [text](url) -> text
                    .replace(/\s*\(.*?\)\s*/g, '') // Remove parenthetical content
                    .replace(/\s+(top|side|front|back|bottom|texture|block)(\s|$)/gi, '') // Remove directional/texture indicators
                    .replace(/^\s*-\s*/, '') // Remove leading dashes
                    .replace(/\s*JE\d+.*$/i, '') // Remove Java Edition version info
                    .replace(/\s*BE\d+.*$/i, '') // Remove Bedrock Edition version info
                    .replace(/\s*\d+x\d+.*$/i, '') // Remove size indicators
                    .trim();
                
                // Skip if it's just a descriptive word
                const skipWords = ['texture', 'top', 'side', 'front', 'back', 'bottom', 'block', 'java', 'bedrock', 'edition'];
                if (skipWords.includes(name.toLowerCase())) {
                    return null;
                }
                
                // Convert to minecraft block ID format
                name = name
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '')
                    .replace(/_+/g, '_') // Remove duplicate underscores
                    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
                
                return name || null;
            }
            
            // Function to clean and validate image URLs
            function cleanImageUrl(url) {
                if (!url) return null;
                
                // Make absolute URL if needed
                if (url.startsWith('/')) {
                    url = 'https://static.wikia.nocookie.net' + url;
                }
                
                // Remove scaling parameters and get the original image
                if (url.includes('/scale-to-width-down/')) {
                    url = url.split('/scale-to-width-down/')[0];
                }
                
                // Remove everything after .png except the revision parameter
                if (url.includes('.png')) {
                    const pngIndex = url.indexOf('.png');
                    let cleanUrl = url.substring(0, pngIndex + 4);
                    
                    // If there's a revision parameter, keep it for the latest version
                    if (url.includes('/revision/latest')) {
                        const revisionPart = url.match(/\/revision\/latest[^?]*(\?cb=[^&]*)?/);
                        if (revisionPart) {
                            cleanUrl += revisionPart[0];
                        }
                    }
                    url = cleanUrl;
                }
                
                // Ensure it's a static wikia URL and contains minecraft_gamepedia
                if (!url.includes('static.wikia.nocookie.net') || 
                    (!url.includes('minecraft_gamepedia') && !url.includes('minecraft'))) {
                    return null;
                }
                
                // Skip obvious non-block textures
                const skipPatterns = [
                    'Site-logo', 'Gear_', 'Painting_', 'debug', 'Duck', 'entity', 'art/',
                    'gui/', 'font/', 'effect/', 'particle/', 'misc/', 'environment/',
                    'mob/', 'item/', 'model/', 'colormap/', 'mcpatcher/'
                ];
                
                if (skipPatterns.some(pattern => url.includes(pattern))) {
                    return null;
                }
                
                return url;
            }
            
            // Function to check if text represents a valid Minecraft block
            function isValidBlockName(text) {
                if (!text) return false;
                
                // Skip obvious non-blocks
                const invalidTerms = [
                    'minecraft wiki', 'fandom', 'logo', 'site-logo', 'gear', 'painting',
                    'debug', 'duck', 'entity', 'particle', 'adult', 'kid', 'gui', 'font',
                    'effect', 'misc', 'environment', 'mob', 'item', 'model', 'colormap'
                ];
                
                const lowerText = text.toLowerCase();
                if (invalidTerms.some(term => lowerText.includes(term))) {
                    return false;
                }
                
                // If it contains "texture" or common block words, it's likely valid
                const blockIndicators = [
                    'texture', 'block', 'stone', 'wood', 'dirt', 'grass', 'ore', 'plank', 
                    'log', 'sand', 'brick', 'glass', 'wool', 'concrete', 'terracotta', 
                    'obsidian', 'ice', 'snow', 'clay', 'coal', 'iron', 'gold', 'diamond',
                    'emerald', 'redstone', 'lapis', 'quartz', 'nether', 'end', 'prismarine',
                    'granite', 'diorite', 'andesite', 'basalt', 'blackstone', 'netherite',
                    'copper', 'amethyst', 'deepslate', 'tuff', 'calcite', 'dripstone'
                ];
                
                if (blockIndicators.some(indicator => lowerText.includes(indicator))) {
                    return true;
                }
                
                // Default to true for reasonable length names that might be valid blocks
                return text.length >= 2 && text.length <= 50;
            }
            
            // Method 1: Extract from direct links that look like block textures
            console.log('Method 1: Processing direct texture links...');
            const directLinks = document.querySelectorAll('a[href*=".png"]');
            console.log(`Found ${directLinks.length} direct PNG links`);
            
            directLinks.forEach((link, i) => {
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                
                if (i < 5) console.log(`Direct link ${i + 1}: "${text}" -> ${href}`);
                
                const cleanUrl = cleanImageUrl(href);
                if (!cleanUrl) return;
                
                const blockName = extractBlockName(text);
                
                if (cleanUrl && blockName && blockName.length > 1 && isValidBlockName(text)) {
                    console.log(`Found texture via direct link: ${blockName} from "${text}"`);
                    if (!textureMap.has(blockName)) {
                        textureMap.set(blockName, {
                            url: cleanUrl,
                            source: 'direct-link',
                            originalText: text,
                            method: 'content-link'
                        });
                    }
                }
            });
            
            // Method 1.5: Look for gallery elements or structured lists
            console.log('Method 1.5: Processing gallery and list structures...');
            const galleries = document.querySelectorAll('.wikitable, .gallery, .mw-content-text ul, .mw-content-text ol');
            console.log(`Found ${galleries.length} structured content areas`);
            
            galleries.forEach(gallery => {
                const images = gallery.querySelectorAll('img');
                const links = gallery.querySelectorAll('a[href*=".png"]');
                
                // Process images in structured content
                images.forEach(img => {
                    const cleanUrl = cleanImageUrl(img.src);
                    if (!cleanUrl) return;
                    
                    // Try multiple text sources
                    let text = img.alt || img.title || '';
                    
                    // Look at parent cell or list item
                    const cell = img.closest('td, th, li');
                    if (cell && !text) {
                        text = cell.textContent.trim();
                    }
                    
                    // Look at nearby text
                    if (!text && img.parentElement) {
                        text = img.parentElement.textContent.trim();
                    }
                    
                    if (text) {
                        const blockName = extractBlockName(text);
                        if (blockName && blockName.length > 1 && isValidBlockName(text)) {
                            console.log(`Found texture in gallery: ${blockName} from "${text}"`);
                            if (!textureMap.has(blockName)) {
                                textureMap.set(blockName, {
                                    url: cleanUrl,
                                    source: 'gallery-image',
                                    originalText: text,
                                    method: 'gallery-parsing'
                                });
                            }
                        }
                    }
                });
                
                // Process links in structured content
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    const text = link.textContent.trim();
                    
                    const cleanUrl = cleanImageUrl(href);
                    if (!cleanUrl) return;
                    
                    const blockName = extractBlockName(text);
                    if (blockName && blockName.length > 1 && isValidBlockName(text)) {
                        console.log(`Found texture link in gallery: ${blockName} from "${text}"`);
                        if (!textureMap.has(blockName)) {
                            textureMap.set(blockName, {
                                url: cleanUrl,
                                source: 'gallery-link',
                                originalText: text,
                                method: 'gallery-parsing'
                            });
                        }
                    }
                });
            });
            
            // Method 2: Parse content for pattern: [Block Name](url)
            console.log('Method 2: Pattern matching for markdown-style links...');
            const contentText = document.body.innerHTML;
            const linkPattern = /\[([^\]]+)\]\(https:\/\/static\.wikia\.nocookie\.net\/minecraft_gamepedia[^)]+\.png[^)]*\)/g;
            let match;
            let patternMatches = 0;
            
            while ((match = linkPattern.exec(contentText)) !== null) {
                patternMatches++;
                const text = match[1];
                const url = match[2];
                
                if (patternMatches <= 5) console.log(`Pattern match ${patternMatches}: "${text}" -> ${url}`);
                
                const cleanUrl = cleanImageUrl(url);
                if (!cleanUrl) continue;
                
                const blockName = extractBlockName(text);
                
                if (cleanUrl && blockName && blockName.length > 1 && isValidBlockName(text)) {
                    console.log(`Found texture via pattern: ${blockName} from "${text}"`);
                    if (!textureMap.has(blockName)) {
                        textureMap.set(blockName, {
                            url: cleanUrl,
                            source: 'content-parsing',
                            originalText: text,
                            method: 'pattern-matching'
                        });
                    }
                }
            }
            console.log(`Pattern matching found ${patternMatches} potential matches`);
            
            // Method 2.5: Look for URL patterns directly in text content
            console.log('Method 2.5: Direct URL pattern matching...');
            const urlPattern = /https:\/\/static\.wikia\.nocookie\.net\/minecraft_gamepedia[^"\s)]+\.png[^"\s)]*/g;
            let urlMatch;
            let urlMatches = 0;
            
            while ((urlMatch = urlPattern.exec(contentText)) !== null) {
                urlMatches++;
                const url = urlMatch[0];
                
                if (urlMatches <= 5) console.log(`URL match ${urlMatches}: ${url}`);
                
                const cleanUrl = cleanImageUrl(url);
                if (!cleanUrl) continue;
                
                // Try to find associated text nearby in the HTML
                const urlIndex = contentText.indexOf(url);
                const beforeText = contentText.substring(Math.max(0, urlIndex - 200), urlIndex);
                const afterText = contentText.substring(urlIndex + url.length, urlIndex + url.length + 200);
                
                // Look for meaningful text patterns
                const textPatterns = [
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:texture|block)/i,
                    /alt="([^"]+)"/,
                    /title="([^"]+)"/,
                    />([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)</
                ];
                
                let foundText = '';
                for (const pattern of textPatterns) {
                    const beforeMatch = beforeText.match(pattern);
                    const afterMatch = afterText.match(pattern);
                    
                    if (beforeMatch && beforeMatch[1]) {
                        foundText = beforeMatch[1];
                        break;
                    }
                    if (afterMatch && afterMatch[1]) {
                        foundText = afterMatch[1];
                        break;
                    }
                }
                
                if (foundText) {
                    const blockName = extractBlockName(foundText);
                    if (blockName && blockName.length > 1 && isValidBlockName(foundText)) {
                        console.log(`Found texture via URL pattern: ${blockName} from "${foundText}"`);
                        if (!textureMap.has(blockName)) {
                            textureMap.set(blockName, {
                                url: cleanUrl,
                                source: 'url-pattern',
                                originalText: foundText,
                                method: 'url-pattern-matching'
                            });
                        }
                    }
                }
            }
            console.log(`URL pattern matching found ${urlMatches} potential matches`);
            
            // Method 3: Look for specific texture categories in the page structure
            const categories = ['Sediment', 'Stone', 'Ore', 'Wood', 'Plant', 'Fungus', 'Animal', 'Building', 'Decoration', 'Utility', 'Redstone'];
            
            categories.forEach(category => {
                // Find heading with this category
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const categoryHeading = headings.find(h => h.textContent.includes(category));
                
                if (categoryHeading) {
                    // Look for links in the section following this heading
                    let current = categoryHeading.nextElementSibling;
                    let depth = 0;
                    
                    while (current && depth < 10) {
                        // Stop if we hit another heading of same or higher level
                        if (current.matches('h1, h2, h3, h4, h5, h6')) {
                            const currentLevel = parseInt(current.tagName.charAt(1));
                            const categoryLevel = parseInt(categoryHeading.tagName.charAt(1));
                            if (currentLevel <= categoryLevel) break;
                        }
                        
                        // Find texture links in this element
                        const links = current.querySelectorAll('a[href*=".png"]');
                        links.forEach(link => {
                            const href = link.getAttribute('href');
                            const text = link.textContent.trim();
                            
                            const cleanUrl = cleanImageUrl(href);
                            if (!cleanUrl) return;
                            
                            const blockName = extractBlockName(text);
                            
                            if (cleanUrl && blockName && blockName.length > 1 && isValidBlockName(text)) {
                                if (!textureMap.has(blockName)) {
                                    textureMap.set(blockName, {
                                        url: cleanUrl,
                                        source: `category-${category.toLowerCase()}`,
                                        originalText: text,
                                        method: 'section-parsing'
                                    });
                                }
                            }
                        });
                        
                        current = current.nextElementSibling;
                        depth++;
                    }
                }
            });
            
            console.log(`Found ${textureMap.size} unique textures`);
            
            return Array.from(textureMap.entries()).map(([name, data]) => ({
                blockName: name,
                ...data
            }));
        });
        
        await browser.close();
        
        console.log(`📋 Extracted ${textures.length} potential textures from wiki`);
        
        // Filter out obviously invalid entries
        const validTextures = textures.filter(texture => {
            return texture.blockName && 
                   texture.blockName.length > 1 && 
                   texture.url && 
                   texture.url.includes('.png') &&
                   !texture.blockName.includes('undefined') &&
                   !texture.blockName.includes('null');
        });
        
        console.log(`✅ ${validTextures.length} valid textures after filtering`);
        return validTextures;
        
    } catch (error) {
        console.error('❌ Error scraping wiki page:', error);
        await browser.close();
        return [];
    }
}

/**
 * Download a single texture file
 */
async function downloadTexture(textureInfo, force = false) {
    const { blockName, url } = textureInfo;
    const filename = `${blockName}.png`;
    const filepath = path.join(TEXTURE_DIR, filename);
    
    downloadStats.attempted++;
    
    try {
        // Check if file already exists
        if (!force) {
            try {
                await fs.access(filepath);
                console.log(`⏭️  Skipping ${filename} (already exists)`);
                downloadStats.skipped++;
                return { success: true, skipped: true };
            } catch (err) {
                // File doesn't exist, proceed with download
            }
        }
        
        console.log(`⬬  Downloading ${filename} from ${url}`);
        
        const fileData = await downloadFile(url);
        await fs.writeFile(filepath, fileData);
        
        console.log(`✅ Downloaded ${filename} (${fileData.length} bytes)`);
        downloadStats.successful++;
        
        return { 
            success: true, 
            skipped: false, 
            size: fileData.length,
            url: url
        };
        
    } catch (error) {
        console.error(`❌ Failed to download ${filename}:`, error.message);
        downloadStats.failed++;
        downloadStats.errors.push({
            blockName,
            url,
            error: error.message
        });
        
        return { 
            success: false, 
            error: error.message,
            url: url
        };
    }
}

/**
 * Download file from URL using promises
 */
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                const redirectUrl = response.headers.location;
                downloadFile(redirectUrl).then(resolve).catch(reject);
            } else {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', reject);
    });
}

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists() {
    try {
        await fs.mkdir(TEXTURE_DIR, { recursive: true });
        console.log(`📁 Texture directory ready: ${TEXTURE_DIR}`);
    } catch (error) {
        throw new Error(`Failed to create texture directory: ${error.message}`);
    }
}

/**
 * Save download status report
 */
async function saveStatusReport(textures, results) {
    const report = {
        timestamp: new Date().toISOString(),
        totalTextures: textures.length,
        stats: downloadStats,
        successfulDownloads: results.filter(r => r.success && !r.skipped).length,
        skippedFiles: results.filter(r => r.skipped).length,
        failedDownloads: results.filter(r => !r.success).length,
        textures: textures.map((texture, index) => ({
            blockName: texture.blockName,
            url: texture.url,
            originalText: texture.originalText,
            method: texture.method,
            result: results[index] || { success: false, error: 'Unknown error' }
        }))
    };
    
    try {
        await fs.writeFile(STATUS_FILE, JSON.stringify(report, null, 2));
        console.log(`📋 Status report saved: ${STATUS_FILE}`);
    } catch (error) {
        console.error('❌ Failed to save status report:', error);
    }
}

/**
 * Main function to download all textures
 */
async function downloadAllTextures(force = false) {
    console.log('🚀 MCWebEdit Smart Texture Downloader');
    console.log('=====================================');
    
    try {
        // Ensure texture directory exists
        await ensureDirectoryExists();
        
        // Scrape texture URLs from wiki
        const textures = await scrapeTextureUrls();
        
        if (textures.length === 0) {
            console.log('❌ No textures found to download');
            return;
        }
        
        console.log(`\n🎯 Found ${textures.length} textures to process`);
        if (force) {
            console.log('🔄 Force mode: will overwrite existing files');
        }
        
        // Download textures with progress tracking
        const results = [];
        const batchSize = 5; // Download 5 at a time to be respectful
        
        for (let i = 0; i < textures.length; i += batchSize) {
            const batch = textures.slice(i, i + batchSize);
            const batchPromises = batch.map(texture => downloadTexture(texture, force));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Show progress
            const progress = Math.round(((i + batch.length) / textures.length) * 100);
            console.log(`📊 Progress: ${progress}% (${i + batch.length}/${textures.length})`);
            
            // Brief pause between batches
            if (i + batchSize < textures.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Save detailed status report
        await saveStatusReport(textures, results);
        
        // Print final summary
        console.log('\n📊 Download Summary');
        console.log('==================');
        console.log(`✅ Successful: ${downloadStats.successful}`);
        console.log(`⏭️  Skipped: ${downloadStats.skipped}`);
        console.log(`❌ Failed: ${downloadStats.failed}`);
        console.log(`📊 Total Attempted: ${downloadStats.attempted}`);
        
        if (downloadStats.errors.length > 0) {
            console.log('\n❌ Errors:');
            downloadStats.errors.forEach(error => {
                console.log(`   ${error.blockName}: ${error.error}`);
            });
        }
        
        console.log(`\n📁 Textures saved to: ${TEXTURE_DIR}`);
        console.log(`📋 Detailed report: ${STATUS_FILE}`);
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    const force = process.argv.includes('--force');
    downloadAllTextures(force).then(() => {
        console.log('✨ Done!');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = {
    downloadAllTextures,
    scrapeTextureUrls
};
