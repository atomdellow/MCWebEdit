import nbt from 'prismarine-nbt';
import fs from 'fs';
import { promisify } from 'util';

const parseNbt = promisify(nbt.parse);

/**
 * Validate a WorldEdit .schem file
 * @param {string} filePath - Path to the .schem file
 */
async function validateSchem(filePath) {
  try {
    console.log(`🔍 Validating schematic: ${filePath}`);
    
    // Read file
    const buffer = fs.readFileSync(filePath);
    console.log(`📁 File size: ${buffer.length} bytes`);
    
    // Parse NBT
    const { parsed } = await parseNbt(buffer);
    
    if (!parsed || !parsed.value) {
      throw new Error('Invalid NBT structure');
    }
    
    const schematic = parsed.value;
    console.log('📋 NBT structure parsed successfully');
    
    // Check required fields
    const width = schematic.Width?.value;
    const height = schematic.Height?.value;
    const length = schematic.Length?.value;
    const version = schematic.Version?.value;
    const dataVersion = schematic.DataVersion?.value;
    
    console.log(`📐 Dimensions: ${width}×${height}×${length}`);
    console.log(`🔢 Version: ${version}, DataVersion: ${dataVersion}`);
    
    // Check palette
    const palette = schematic.Palette?.value || {};
    const paletteCount = Object.keys(palette).length;
    console.log(`🎨 Palette: ${paletteCount} block types`);
    
    for (const [blockName, id] of Object.entries(palette)) {
      console.log(`  - ${id.value}: ${blockName}`);
    }
    
    // Check block data
    const blockData = schematic.BlockData?.value;
    if (blockData) {
      console.log(`📦 Block data: ${blockData.length} bytes`);
      
      // Decode and count blocks
      let index = 0;
      let blockCount = 0;
      const totalBlocks = width * height * length;
      
      while (index < blockData.length && blockCount < totalBlocks) {
        const blockId = readVarInt(blockData, index);
        index = blockId.index;
        if (blockId.value !== 0) {
          blockCount++;
        }
      }
      
      console.log(`🧱 Non-air blocks: ${blockCount}/${totalBlocks}`);
    }
    
    // Check offset
    const offset = schematic.Offset?.value;
    if (offset && offset.length >= 3) {
      console.log(`📍 Offset: [${offset[0]}, ${offset[1]}, ${offset[2]}]`);
    }
    
    console.log('✅ Schematic validation passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

/**
 * Read a varint from buffer starting at index
 */
function readVarInt(buffer, startIndex) {
  let value = 0;
  let index = startIndex;
  let shift = 0;
  
  while (index < buffer.length) {
    const byte = buffer[index++];
    value |= (byte & 0x7F) << shift;
    
    if ((byte & 0x80) === 0) {
      break;
    }
    
    shift += 7;
    if (shift >= 32) {
      throw new Error('VarInt too long');
    }
  }
  
  return { value, index };
}

// Main execution
if (process.argv.length < 3) {
  console.log('Usage: node validate-schem.js <path-to-schem-file>');
  process.exit(1);
}

const filePath = process.argv[2];
validateSchem(filePath).then((valid) => {
  process.exit(valid ? 0 : 1);
});
