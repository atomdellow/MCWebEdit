import nbt from 'prismarine-nbt';
import { promisify } from 'util';
import zlib from 'zlib';

const parseNbt = promisify(nbt.parse);
const gzipAsync = promisify(zlib.gzip);

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
      console.log('🔍 Parsing schematic, buffer size:', buffer.length);
      
      // Try to decompress GZIP first
      let nbtBuffer = buffer;
      try {
        nbtBuffer = zlib.gunzipSync(buffer);
        console.log('✅ GZIP decompressed, size:', nbtBuffer.length);
      } catch (gzipError) {
        console.log('⚠️ Not GZIP compressed, using original buffer');
      }
      
      let parsed;
      try {
        parsed = await parseNbt(nbtBuffer);
        console.log('✅ Raw NBT parse result:', parsed ? 'success' : 'failed');
      } catch (nbtError) {
        console.error('❌ NBT parsing failed:', nbtError.message);
        throw new Error(`NBT parsing error: ${nbtError.message}`);
      }
      
      if (!parsed || !parsed.value) {
        console.error('❌ NBT parsing returned empty or invalid structure');
        console.error('Parsed object keys:', Object.keys(parsed || {}));
        console.error('Parsed structure:', parsed);
        throw new Error('Invalid NBT structure');
      }
      
      const nbtData = parsed;
      
      console.log('✅ NBT parsed, root keys:', Object.keys(nbtData.value));
      
      // Handle both wrapped and unwrapped formats
      let schematic = nbtData.value;
      
      // Check if data is wrapped in 'Schematic' compound tag (modern format)
      if (nbtData.value.Schematic) {
        console.log('📋 Found wrapped Schematic compound tag');
        schematic = nbtData.value.Schematic.value;
      } else {
        console.log('📋 Using direct structure (legacy format)');
      }
      
      // Extract dimensions
      const width = schematic.Width?.value || 0;
      const height = schematic.Height?.value || 0;
      const length = schematic.Length?.value || 0;
      
      console.log('📐 Schematic dimensions:', { width, height, length });
      
      // Extract offset (origin)
      const offsetData = schematic.Offset?.value || [0, 0, 0];
      const origin = {
        x: Array.isArray(offsetData) ? offsetData[0] : 0,
        y: Array.isArray(offsetData) ? offsetData[1] : 0,
        z: Array.isArray(offsetData) ? offsetData[2] : 0
      };
      
      let blocks = [];
      
      // Handle different block data formats
      if (schematic.Palette && schematic.BlockData) {
        console.log('🎨 Using Palette + BlockData format (modern)');
        blocks = this.parseModernBlockData(schematic, width, height, length);
      } else if (schematic.Blocks && schematic.Blocks.value) {
        const blocksData = schematic.Blocks.value;
        if (blocksData.Palette && blocksData.Data) {
          console.log('🧱 Using Blocks.Palette + Blocks.Data format (WorldEdit hybrid)');
          blocks = this.parseHybridBlockData(schematic.Blocks.value, width, height, length);
        } else {
          console.log('🧱 Using individual Blocks format (older WorldEdit format)');
          blocks = this.parseBlocksFormat(schematic, width, height, length);
        }
      } else {
        throw new Error('No recognizable block data format found (missing Palette+BlockData or Blocks)');
      }
      
      console.log('✅ Parsed', blocks.length, 'blocks');
      
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
      console.log('🎯 Generating schematic for model:', {
        name: voxelModel.name,
        width: voxelModel.width,
        height: voxelModel.height,
        length: voxelModel.length,
        totalBlocks: voxelModel.blocks?.length || 0,
        blockPalette: voxelModel.blockPalette?.length || 0,
        origin: voxelModel.origin
      })
      
      // Create palette from actual blocks if blockPalette is empty
      let blockPalette = voxelModel.blockPalette || []
      if (blockPalette.length === 0 && voxelModel.blocks && voxelModel.blocks.length > 0) {
        console.log('📝 Building block palette from blocks...')
        const uniqueBlocks = new Set()
        voxelModel.blocks.forEach(block => {
          if (block.blockType && block.blockType !== 'minecraft:air') {
            uniqueBlocks.add(block.blockType)
          }
        })
        blockPalette = Array.from(uniqueBlocks)
        console.log('✅ Built palette:', blockPalette)
      }
      
      // Create palette
      const palette = {}
      const paletteList = ['minecraft:air', ...blockPalette]
      
      paletteList.forEach((blockType, index) => {
        palette[blockType] = { type: 'int', value: index };
      });
      
      console.log('🎨 Final palette:', paletteList)
      
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
      
      console.log('📦 Block array created, non-air blocks:', blockArray.filter(id => id !== 0).length)
      
      // For Version 3, use simple byte array instead of VarInt encoding
      // Check if we need VarInt or simple bytes based on palette size
      let encodedData;
      if (paletteList.length <= 256) {
        // Use simple byte array for small palettes
        encodedData = Buffer.from(blockArray);
        console.log('🔢 Using simple byte encoding, data size:', encodedData.length);
      } else {
        // Use VarInt encoding for larger palettes  
        const varIntData = [];
        for (const blockId of blockArray) {
          this.writeVarInt(varIntData, blockId);
        }
        encodedData = Buffer.from(varIntData);
        console.log('🔢 Using VarInt encoding, data size:', encodedData.length);
      }
      
      // Create NBT structure with proper WorldEdit Version 3 format
      // Version 3 uses a 'Blocks' compound containing Palette, Data, and BlockEntities
      const nbtData = {
        type: 'compound',
        name: '',
        value: {
          Schematic: {
            type: 'compound',
            value: {
              Version: { type: 'int', value: 3 },
              DataVersion: { type: 'int', value: 2975 }, // MC 1.19.2 data version
              
              Width: { type: 'short', value: voxelModel.width },
              Height: { type: 'short', value: voxelModel.height },
              Length: { type: 'short', value: voxelModel.length },
              
              Offset: {
                type: 'intArray',
                value: [voxelModel.origin?.x || 0, voxelModel.origin?.y || 0, voxelModel.origin?.z || 0]
              },
              
              // Version 3 format: Blocks compound containing Palette, Data, and BlockEntities
              Blocks: {
                type: 'compound',
                value: {
                  Palette: {
                    type: 'compound',
                    value: palette
                  },
                  
                  Data: {
                    type: 'byteArray',
                    value: encodedData
                  },
                  
                  // BlockEntities can be empty for simple blocks
                  BlockEntities: {
                    type: 'list',
                    value: {
                      type: 'compound',
                      value: []
                    }
                  }
                }
              }
            }
          }
        }
      };
      
      console.log('📋 NBT structure created')
      
      // Serialize to NBT (uncompressed first)
      const uncompressedBuffer = nbt.writeUncompressed(nbtData, 'big');
      console.log('📦 NBT serialized, size:', uncompressedBuffer.length, 'bytes')
      
      // Compress with GZIP (required for WorldEdit .schem files)
      const compressedBuffer = await gzipAsync(uncompressedBuffer);
      console.log('🗜️ GZIP compressed, final size:', compressedBuffer.length, 'bytes')
      console.log('✅ Schematic generated successfully')
      
      return compressedBuffer;
      
    } catch (error) {
      console.error('❌ Error generating schematic:', error);
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
  
  /**
   * Parse modern block data format (Palette + BlockData)
   */
  static parseModernBlockData(schematic, width, height, length) {
    const paletteData = schematic.Palette?.value || {};
    const palette = [];
    const paletteMap = new Map();
    
    for (const [blockName, id] of Object.entries(paletteData)) {
      const idValue = id.value;
      palette[idValue] = blockName;
      paletteMap.set(idValue, blockName);
    }
    
    console.log('🎨 Palette:', palette);
    
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
    
    return blocks;
  }
  
  /**
   * Parse hybrid block data format (Blocks.Palette + Blocks.Data)
   */
  static parseHybridBlockData(blocksData, width, height, length) {
    const paletteData = blocksData.Palette?.value || {};
    const palette = [];
    const paletteMap = new Map();
    
    // Build palette map
    for (const [blockName, id] of Object.entries(paletteData)) {
      const idValue = id.value;
      palette[idValue] = blockName;
      paletteMap.set(idValue, blockName);
    }
    
    console.log('🎨 Hybrid palette:', palette);
    
    const blockData = blocksData.Data?.value || [];
    const blocks = [];
    
    // Parse block data array (should be simple array, not varint encoded)
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < length; z++) {
        for (let x = 0; x < width; x++) {
          if (index >= blockData.length) break;
          
          const blockId = blockData[index++];
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
    
    return blocks;
  }
  
  /**
   * Parse Blocks format (older WorldEdit format)
   */
  static parseBlocksFormat(schematic, width, height, length) {
    const blocksData = schematic.Blocks?.value || {};
    const blocks = [];
    
    console.log('🧱 Blocks data keys:', Object.keys(blocksData));
    
    // The Blocks format stores blocks as compound tags with position and state
    for (const [key, blockCompound] of Object.entries(blocksData)) {
      try {
        const blockValue = blockCompound.value;
        
        // Extract position
        const pos = blockValue.Pos?.value || [0, 0, 0];
        const x = pos[0];
        const y = pos[1]; 
        const z = pos[2];
        
        // Extract block state
        const state = blockValue.State?.value || 0;
        
        // For now, we'll use a simple mapping - this could be enhanced with a full state palette
        // The state refers to an index in a BlockStates palette (if present)
        let blockType = 'minecraft:stone'; // Default fallback
        
        if (schematic.BlockStates?.value && Array.isArray(schematic.BlockStates.value)) {
          const blockStates = schematic.BlockStates.value;
          if (state < blockStates.length) {
            const stateData = blockStates[state];
            blockType = stateData.Name?.value || 'minecraft:stone';
          }
        }
        
        blocks.push({
          x, y, z,
          blockType,
          blockData: 0,
          properties: {}
        });
        
      } catch (err) {
        console.warn('Failed to parse block entry:', key, err.message);
      }
    }
    
    return blocks;
  }
}
