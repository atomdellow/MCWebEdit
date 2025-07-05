const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const nbt = require('prismarine-nbt');

async function analyzeSchematic() {
  try {
    console.log('🔍 Analyzing Pantheon.schem structure...');
    
    const filePath = path.join(__dirname, 'Pantheon.schem');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Patheon.schem not found in project root');
      return;
    }
    
    const buffer = fs.readFileSync(filePath);
    console.log('📁 File size:', buffer.length, 'bytes');
    
    try {
      // Try to decompress as GZIP first
      const decompressed = zlib.gunzipSync(buffer);
      console.log('✅ Successfully decompressed GZIP, uncompressed size:', decompressed.length, 'bytes');
      
      // Parse NBT
      const { parsed } = await nbt.parse(decompressed);
      console.log('✅ NBT parsed successfully');
      console.log('📋 Root NBT structure keys:', Object.keys(parsed.value));
      
      // Check structure
      if (parsed.value.Schematic) {
        console.log('✅ Found Schematic compound tag (modern format)');
        const schematic = parsed.value.Schematic.value;
        console.log('📋 Schematic keys:', Object.keys(schematic));
        console.log('📐 Dimensions:', {
          width: schematic.Width?.value,
          height: schematic.Height?.value,
          length: schematic.Length?.value
        });
        
        if (schematic.Palette) {
          console.log('🎨 Palette entries:', Object.keys(schematic.Palette?.value || {}).length);
        }
        
        if (schematic.Blocks) {
          console.log('🧱 Blocks format detected');
          const blocksData = schematic.Blocks.value;
          console.log('🧱 Blocks structure:', typeof blocksData);
          
          if (Array.isArray(blocksData)) {
            console.log('🧱 Blocks is array with', blocksData.length, 'entries');
            if (blocksData.length > 0) {
              console.log('🧱 First block sample:', blocksData[0]);
            }
          } else if (typeof blocksData === 'object') {
            console.log('🧱 Blocks is object with keys:', Object.keys(blocksData));
            const firstKey = Object.keys(blocksData)[0];
            if (firstKey) {
              console.log('🧱 First block sample:', blocksData[firstKey]);
            }
          }
          
          // Check for BlockStates
          if (schematic.BlockStates) {
            console.log('🎯 BlockStates found');
            const blockStates = schematic.BlockStates.value;
            if (Array.isArray(blockStates)) {
              console.log('🎯 BlockStates array length:', blockStates.length);
              if (blockStates.length > 0) {
                console.log('🎯 First BlockState sample:', blockStates[0]);
              }
            }
          }
        }
        
      } else {
        console.log('⚠️ No Schematic compound tag found, checking direct structure...');
        console.log('📋 Available keys:', Object.keys(parsed.value));
        
        // Check if it's direct structure (like our current parser expects)
        if (parsed.value.Width && parsed.value.Height && parsed.value.Length) {
          console.log('✅ Found direct Width/Height/Length (old format or different structure)');
          console.log('📐 Dimensions:', {
            width: parsed.value.Width?.value,
            height: parsed.value.Height?.value,
            length: parsed.value.Length?.value
          });
        }
      }
      
    } catch (gzipError) {
      console.log('⚠️ Not GZIP compressed, trying direct NBT parse...');
      
      try {
        const { parsed } = await nbt.parse(buffer);
        console.log('✅ Direct NBT parsed successfully');
        console.log('📋 Root NBT structure keys:', Object.keys(parsed.value));
      } catch (nbtError) {
        console.error('❌ Failed to parse as NBT:', nbtError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeSchematic();
