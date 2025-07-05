const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const nbt = require('prismarine-nbt');

async function testExportPantheon() {
  try {
    console.log('🧪 Testing export of imported Pantheon model...');
    
    // Get the model ID from the import test result (6868d2ac6957a26decbfebc7)
    const modelId = '6868d2ac6957a26decbfebc7';
    
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
    const outputPath = path.join(__dirname, 'pantheon_exported.schem');
    fs.writeFileSync(outputPath, buffer);
    console.log('💾 Saved to:', outputPath);
    
    // Verify it's GZIP compressed and valid
    try {
      const decompressed = zlib.gunzipSync(buffer);
      console.log('✅ Successfully decompressed GZIP, uncompressed size:', decompressed.length, 'bytes');
      
      // Parse NBT to verify structure
      const { parsed } = await nbt.parse(decompressed);
      console.log('✅ NBT parsed successfully');
      console.log('📋 Root NBT structure keys:', Object.keys(parsed.value));
      
      // Check for 'Schematic' tag
      if (parsed.value.Schematic) {
        console.log('✅ Found Schematic compound tag');
        console.log('📋 Schematic keys:', Object.keys(parsed.value.Schematic.value));
        
        const schematic = parsed.value.Schematic.value;
        console.log('📐 Dimensions:', {
          width: schematic.Width?.value,
          height: schematic.Height?.value,
          length: schematic.Length?.value
        });
        console.log('🎨 Palette entries:', Object.keys(schematic.Palette?.value || {}).length);
        console.log('📦 BlockData size:', schematic.BlockData?.value?.length);
        console.log('🏷️ Version:', schematic.Version?.value);
        console.log('🏷️ DataVersion:', schematic.DataVersion?.value);
      } else {
        console.error('❌ No Schematic compound tag found!');
      }
      
    } catch (err) {
      console.error('❌ Failed to decompress or parse:', err.message);
    }
    
    console.log('✅ Test completed. Try loading pantheon_exported.schem in WorldEdit!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExportPantheon();
