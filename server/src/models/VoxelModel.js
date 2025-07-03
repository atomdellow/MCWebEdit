import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  blockType: { type: String, required: true, default: 'minecraft:stone' },
  blockData: { type: Number, default: 0 },
  properties: { type: Map, of: String, default: {} }
});

const voxelModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Dimensions
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  length: { type: Number, required: true },
  
  // Origin point for World-Edit compatibility
  origin: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  
  // Block data
  blocks: [blockSchema],
  
  // Metadata
  blockPalette: [{ type: String }], // List of unique block types used
  totalBlocks: { type: Number, default: 0 },
  
  // Collaboration
  activeUsers: [{ type: String }], // Socket IDs of active users
  lastModified: { type: Date, default: Date.now },
  
  // Version control
  version: { type: Number, default: 1 },
  
  // Original file info (if imported)
  originalFormat: { type: String, enum: ['schem', 'schematic', 'created'], default: 'created' },
  originalFileName: { type: String }
}, {
  timestamps: true
});

// Indexes for better performance
voxelModelSchema.index({ 'blocks.x': 1, 'blocks.y': 1, 'blocks.z': 1 });
voxelModelSchema.index({ lastModified: -1 });

// Virtual for getting bounds
voxelModelSchema.virtual('bounds').get(function() {
  return {
    min: { x: 0, y: 0, z: 0 },
    max: { x: this.width - 1, y: this.height - 1, z: this.length - 1 }
  };
});

// Method to add/update a block
voxelModelSchema.methods.setBlock = function(x, y, z, blockType, blockData = 0, properties = {}) {
  // Remove existing block at this position
  this.blocks = this.blocks.filter(block => 
    !(block.x === x && block.y === y && block.z === z)
  );
  
  // Add new block if blockType is not air
  if (blockType && blockType !== 'minecraft:air') {
    this.blocks.push({
      x, y, z, blockType, blockData, properties
    });
    
    // Update palette
    if (!this.blockPalette.includes(blockType)) {
      this.blockPalette.push(blockType);
    }
  }
  
  // Update total blocks count
  this.totalBlocks = this.blocks.length;
  this.lastModified = new Date();
  this.version += 1;
};

// Method to get block at position
voxelModelSchema.methods.getBlock = function(x, y, z) {
  return this.blocks.find(block => 
    block.x === x && block.y === y && block.z === z
  ) || { x, y, z, blockType: 'minecraft:air', blockData: 0, properties: {} };
};

// Method to clear all blocks
voxelModelSchema.methods.clear = function() {
  this.blocks = [];
  this.blockPalette = [];
  this.totalBlocks = 0;
  this.lastModified = new Date();
  this.version += 1;
};

export default mongoose.model('VoxelModel', voxelModelSchema);
