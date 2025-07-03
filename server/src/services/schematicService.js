import nbt from 'prismarine-nbt';
import { promisify } from 'util';

const parseNbt = promisify(nbt.parse);

/**
 * Service for handling WorldEdit schematic file parsing and generation
 */
export class SchematicService {
  
  /**
   * Parse a WorldEdit .schem file (1.13+ format)
   * @param {Buffer} buffer - The file buffer
   * @returns {Object} Parsed schematic data
   */
  static async parseSchematic(buffer) {
    try {
      const { parsed } = await parseNbt(buffer);
      
      if (!parsed || !parsed.value) {
        throw new Error('Invalid NBT structure');
      }
      
      const schematic = parsed.value;
      
      // Extract dimensions
      const width = schematic.Width?.value || 0;
      const height = schematic.Height?.value || 0;
      const length = schematic.Length?.value || 0;
      
      // Extract offset (origin)
      const offset = schematic.Offset?.value || { x: 0, y: 0, z: 0 };
      const origin = {
        x: offset.x?.value || 0,
        y: offset.y?.value || 0,
        z: offset.z?.value || 0
      };
      
      // Extract palette
      const paletteData = schematic.Palette?.value || {};
      const palette = [];
      const paletteMap = new Map();
      
      for (const [blockName, id] of Object.entries(paletteData)) {
        const idValue = id.value;
        palette[idValue] = blockName;
        paletteMap.set(idValue, blockName);
      }
      
      // Extract block data
      const blockData = schematic.BlockData?.value || [];
      const blocks = [];
      
      // Parse variable-length encoded block data
      let index = 0;
      for (let y = 0; y < height; y++) {
        for (let z = 0; z < length; z++) {
          for (let x = 0; x < width; x++) {
            if (index >= blockData.length) break;
            
            // Decode varint
            let blockId = 0;
            let shift = 0;
            let byte;
            
            do {
              if (index >= blockData.length) break;
              byte = blockData[index++];
              blockId |= (byte & 0x7F) << shift;
              shift += 7;
            } while ((byte & 0x80) !== 0);
            
            const blockType = paletteMap.get(blockId) || 'minecraft:air';
            
            // Only store non-air blocks
            if (blockType !== 'minecraft:air') {
              blocks.push({
                x, y, z,
                blockType,
                blockData: 0,
                properties: {}
              });
            }
          }
        }
      }
      
      return {
        width,
        height,
        length,
        origin,
        blocks,
        blockPalette: Array.from(new Set(blocks.map(b => b.blockType))),
        totalBlocks: blocks.length,
        originalFormat: 'schem'
      };
      
    } catch (error) {
      console.error('Error parsing schematic:', error);
      throw new Error(`Failed to parse schematic: ${error.message}`);
    }
  }
  
  /**
   * Parse a legacy .schematic file (pre-1.13 format)
   * @param {Buffer} buffer - The file buffer
   * @returns {Object} Parsed schematic data
   */
  static async parseLegacySchematic(buffer) {
    try {
      const { parsed } = await parseNbt(buffer);
      
      if (!parsed || !parsed.value) {
        throw new Error('Invalid NBT structure');
      }
      
      const schematic = parsed.value;
      
      // Extract dimensions
      const width = schematic.Width?.value || 0;
      const height = schematic.Height?.value || 0;
      const length = schematic.Length?.value || 0;
      
      // Extract block arrays
      const blockIds = schematic.Blocks?.value || [];
      const blockData = schematic.Data?.value || [];
      
      const blocks = [];
      
      // Convert legacy format to modern format
      for (let y = 0; y < height; y++) {
        for (let z = 0; z < length; z++) {
          for (let x = 0; x < width; x++) {
            const index = y * width * length + z * width + x;
            
            if (index >= blockIds.length) continue;
            
            const blockId = blockIds[index];
            const data = blockData[index] || 0;
            
            // Convert legacy block ID to modern block name
            const blockType = this.legacyBlockIdToName(blockId, data);
            
            // Only store non-air blocks
            if (blockType !== 'minecraft:air' && blockId !== 0) {
              blocks.push({
                x, y, z,
                blockType,
                blockData: data,
                properties: {}
              });
            }
          }
        }
      }
      
      return {
        width,
        height,
        length,
        origin: { x: 0, y: 0, z: 0 },
        blocks,
        blockPalette: Array.from(new Set(blocks.map(b => b.blockType))),
        totalBlocks: blocks.length,
        originalFormat: 'schematic'
      };
      
    } catch (error) {
      console.error('Error parsing legacy schematic:', error);
      throw new Error(`Failed to parse legacy schematic: ${error.message}`);
    }
  }
  
  /**
   * Generate a WorldEdit .schem file from voxel data
   * @param {Object} voxelModel - The voxel model data
   * @returns {Buffer} The generated .schem file buffer
   */
  static async generateSchematic(voxelModel) {
    try {
      // Create palette
      const palette = {};
      const paletteList = ['minecraft:air', ...voxelModel.blockPalette];
      
      paletteList.forEach((blockType, index) => {
        palette[blockType] = { type: 'int', value: index };
      });
      
      // Create block array
      const blockArray = new Array(voxelModel.width * voxelModel.height * voxelModel.length).fill(0);
      
      // Fill block array
      voxelModel.blocks.forEach(block => {
        const index = block.y * voxelModel.width * voxelModel.length + 
                     block.z * voxelModel.width + 
                     block.x;
        
        const paletteIndex = paletteList.indexOf(block.blockType);
        if (paletteIndex !== -1) {
          blockArray[index] = paletteIndex;
        }
      });
      
      // Encode as varint
      const encodedData = [];
      for (const blockId of blockArray) {
        this.writeVarInt(encodedData, blockId);
      }
      
      // Create NBT structure
      const nbtData = {
        type: 'compound',
        name: '',
        value: {
          Version: { type: 'int', value: 2 },
          DataVersion: { type: 'int', value: 2975 }, // MC 1.19.2 data version
          
          Width: { type: 'short', value: voxelModel.width },
          Height: { type: 'short', value: voxelModel.height },
          Length: { type: 'short', value: voxelModel.length },
          
          Offset: {
            type: 'intArray',
            value: [voxelModel.origin.x, voxelModel.origin.y, voxelModel.origin.z]
          },
          
          Palette: {
            type: 'compound',
            value: palette
          },
          
          BlockData: {
            type: 'byteArray',
            value: Buffer.from(encodedData)
          }
        }
      };
      
      // Serialize to NBT
      const buffer = nbt.writeUncompressed(nbtData, 'big');
      return buffer;
      
    } catch (error) {
      console.error('Error generating schematic:', error);
      throw new Error(`Failed to generate schematic: ${error.message}`);
    }
  }
  
  /**
   * Write a variable-length integer to byte array
   */
  static writeVarInt(buffer, value) {
    while ((value & 0x80) !== 0) {
      buffer.push((value & 0x7F) | 0x80);
      value >>>= 7;
    }
    buffer.push(value & 0x7F);
  }
  
  /**
   * Convert legacy block ID to modern block name
   * This is a simplified mapping - in production you'd want a complete lookup table
   */
  static legacyBlockIdToName(id, data = 0) {
    const legacyMap = {
      0: 'minecraft:air',
      1: 'minecraft:stone',
      2: 'minecraft:grass_block',
      3: 'minecraft:dirt',
      4: 'minecraft:cobblestone',
      5: 'minecraft:oak_planks',
      6: 'minecraft:oak_sapling',
      7: 'minecraft:bedrock',
      8: 'minecraft:water',
      9: 'minecraft:water',
      10: 'minecraft:lava',
      11: 'minecraft:lava',
      12: 'minecraft:sand',
      13: 'minecraft:gravel',
      14: 'minecraft:gold_ore',
      15: 'minecraft:iron_ore',
      16: 'minecraft:coal_ore',
      17: 'minecraft:oak_log',
      18: 'minecraft:oak_leaves',
      // Add more mappings as needed...
    };
    
    return legacyMap[id] || 'minecraft:stone';
  }
}
