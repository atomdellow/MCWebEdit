const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const nbt = require('prismarine-nbt');

async function testExportWithVersion3() {
  try {
    console.log('🧪 Testing export with corrected Version 3...');
    
    // Use the FinalTest model ID from the user's example
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
    const outputPath = path.join(__dirname, 'finaltest_v3.schem');
    fs.writeFileSync(outputPath, buffer);
    console.log('💾 Saved to:', outputPath);
    
    // Verify it's GZIP compressed and valid
    try {
      const decompressed = zlib.gunzipSync(buffer);
      console.log('✅ Successfully decompressed GZIP, uncompressed size:', decompressed.length, 'bytes');
      
      // Parse NBT to verify structure
      const result = await nbt.parse(decompressed);
      const parsed = result.parsed; // The actual NBT data is in .parsed
      console.log('✅ NBT parsed successfully');
      console.log('📋 Root NBT structure keys:', Object.keys(parsed.value || {}));
      
      // Check for 'Schematic' tag
      if (parsed && parsed.value && parsed.value.Schematic) {
        console.log('✅ Found Schematic compound tag');
        console.log('📋 Schematic keys:', Object.keys(parsed.value.Schematic.value || {}));
        
        const schematic = parsed.value.Schematic.value;
        console.log('📐 Dimensions:', {
          width: schematic.Width?.value,
          height: schematic.Height?.value,
          length: schematic.Length?.value
        });
        console.log('🎨 Palette entries:', Object.keys(schematic.Palette?.value || {}).length);
        console.log('📦 BlockData size:', schematic.BlockData?.value?.length);
        console.log('🏷️ Version:', schematic.Version?.value, '(should be 3)');
        console.log('🏷️ DataVersion:', schematic.DataVersion?.value);
        
        if (schematic.Version?.value === 3) {
          console.log('✅ Correct Version 3 format - should work in WorldEdit!');
        } else {
          console.log('❌ Still wrong version:', schematic.Version?.value);
        }
      } else {
        console.error('❌ No Schematic compound tag found!');
        console.error('Parsed structure type:', typeof parsed);
        console.error('Parsed keys:', Object.keys(parsed || {}));
      }
      
    } catch (err) {
      console.error('❌ Failed to decompress or parse:', err.message);
    }
    
    console.log('✅ Test completed. Try loading finaltest_v3.schem in WorldEdit!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExportWithVersion3();
