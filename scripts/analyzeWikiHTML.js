#!/usr/bin/env node

/**
 * MCWebEdit Wiki HTML Analyzer
 * Analyzes the Minecraft Wiki HTML structure to understand gallery patterns
 */

const https = require('https');
const fs = require('fs').promises;

function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function analyzeWikiHTML() {
  console.log('🔍 Fetching and analyzing Minecraft Wiki HTML structure...');
  
  try {
    const htmlContent = await fetchContent('https://minecraft.fandom.com/wiki/List_of_block_textures');
    
    // Save the HTML for inspection
    await fs.writeFile('wiki-debug.html', htmlContent);
    console.log('📄 HTML saved to wiki-debug.html for inspection');
    
    // Look for different gallery patterns
    console.log('\n🔍 Analyzing gallery patterns...');
    
    // Pattern 1: Standard gallery
    const galleryMatches = htmlContent.match(/<ul[^>]*class="[^"]*gallery[^"]*"[^>]*>/gi);
    console.log(`Found ${galleryMatches ? galleryMatches.length : 0} gallery containers`);
    
    // Pattern 2: Gallery boxes
    const galleryBoxMatches = htmlContent.match(/<li[^>]*class="[^"]*gallerybox[^"]*"/gi);
    console.log(`Found ${galleryBoxMatches ? galleryBoxMatches.length : 0} gallery boxes`);
    
    // Pattern 3: Image tags
    const imageMatches = htmlContent.match(/<img[^>]*src="[^"]*minecraft[^"]*"/gi);
    console.log(`Found ${imageMatches ? imageMatches.length : 0} minecraft-related images`);
    
    // Pattern 4: Static wikia images
    const staticImageMatches = htmlContent.match(/<img[^>]*src="[^"]*static\.wikia\.nocookie\.net[^"]*"/gi);
    console.log(`Found ${staticImageMatches ? staticImageMatches.length : 0} static wikia images`);
    
    // Extract a few example images to see the pattern
    console.log('\n📋 Sample image tags:');
    if (staticImageMatches) {
      staticImageMatches.slice(0, 5).forEach((match, i) => {
        console.log(`${i + 1}. ${match.substring(0, 200)}...`);
      });
    }
    
    // Look for specific texture names we know exist
    console.log('\n🔍 Looking for known textures...');
    const knownTextures = ['Stone', 'Cobblestone', 'Dirt', 'Grass', 'Oak'];
    for (const texture of knownTextures) {
      const regex = new RegExp(texture + '.*?texture', 'gi');
      const matches = htmlContent.match(regex);
      if (matches) {
        console.log(`Found ${texture}: ${matches.slice(0, 3).join(', ')}`);
      }
    }
    
    // Look for the actual URL pattern structure
    console.log('\n🔗 Analyzing URL patterns...');
    const urlMatches = htmlContent.match(/https:\/\/static\.wikia\.nocookie\.net\/minecraft_gamepedia\/images\/[^"']*/gi);
    if (urlMatches) {
      console.log(`Found ${urlMatches.length} static image URLs`);
      console.log('Sample URLs:');
      urlMatches.slice(0, 10).forEach((url, i) => {
        console.log(`${i + 1}. ${url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeWikiHTML().catch(console.error);
