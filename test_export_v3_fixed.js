const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const nbt = require('prismarine-nbt');

async function testExportVersion3Fixed() {
  try {
    console.log('🧪 Testing export with corrected Version 3 format (Blocks structure)...');
    
    // Use the FinalTest model ID
    const modelId = '6868d5c76957a26decbff38e';
    
    // Test export API
    const response = await fetch(`http://localhost:3001/api/schematic/export-schematic/${modelId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${response.status} - ${errorText}`);
    }
    
    console.log('📦 Export API successful, content type:', response.headers.get('content-type'));
    
    // Get the exported data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('💾 Downloaded buffer size:', buffer.length, 'bytes');
    
    // Save to file for testing in WorldEdit
    const outputPath = path.join(__dirname, 'finaltest_v3_fixed.schem');
    fs.writeFileSync(outputPath, buffer);
    console.log('💾 Saved to:', outputPath);
    
    // Verify it's GZIP compressed and valid
    try {
      const decompressed = zlib.gunzipSync(buffer);
      console.log('✅ Successfully decompressed GZIP, uncompressed size:', decompressed.length, 'bytes');
      
      // Parse NBT to verify structure
      const result = await nbt.parse(decompressed);
      const parsed = result.parsed;
      console.log('✅ NBT parsed successfully');
      console.log('📋 Root NBT structure keys:', Object.keys(parsed.value || {}));
      
      // Check for 'Schematic' tag
      if (parsed && parsed.value && parsed.value.Schematic) {
        console.log('✅ Found Schematic compound tag');
        const schematicKeys = Object.keys(parsed.value.Schematic.value || {});
        console.log('📋 Schematic keys:', schematicKeys);
        
        const schematic = parsed.value.Schematic.value;
        console.log('📐 Dimensions:', {
          width: schematic.Width?.value,
          height: schematic.Height?.value,
          length: schematic.Length?.value
        });
        
        console.log('🏷️ Version:', schematic.Version?.value, '(should be 3)');
        console.log('🏷️ DataVersion:', schematic.DataVersion?.value);
        
        // Check for Blocks structure (Version 3 requirement)
        if (schematic.Blocks) {
          console.log('✅ Found Blocks compound tag (Version 3 format)');
          const blocksKeys = Object.keys(schematic.Blocks.value || {});
          console.log('📋 Blocks keys:', blocksKeys);
          
          const blocks = schematic.Blocks.value;
          if (blocks.Palette) {
            console.log('🎨 Palette entries:', Object.keys(blocks.Palette.value || {}).length);
          }
          if (blocks.Data) {
            console.log('📦 Data size:', blocks.Data.value?.length);
          }
          if (blocks.BlockEntities) {
            console.log('🏗️ BlockEntities present:', !!blocks.BlockEntities);
          }
          
          console.log('✅ Correct Version 3 format with Blocks structure - should work in WorldEdit!');
        } else {
          console.log('❌ Missing Blocks compound tag (required for Version 3)');
        }
        
      } else {
        console.error('❌ No Schematic compound tag found!');
      }
      
    } catch (err) {
      console.error('❌ Failed to decompress or parse:', err.message);
    }
    
    console.log('✅ Test completed. Try loading finaltest_v3_fixed.schem in WorldEdit!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExportVersion3Fixed();
