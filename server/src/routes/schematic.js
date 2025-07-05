import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import VoxelModel from '../models/VoxelModel.js';
import { SchematicService } from '../services/schematicService.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept .schem and .schematic files
    const allowedExtensions = ['.schem', '.schematic'];
    const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Only .schem and .schematic files are allowed'), false);
    }
  }
});

/**
 * POST /upload-schematic
 * Upload and parse a WorldEdit schematic file
 */
router.post('/upload-schematic', upload.single('schematic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name, description } = req.body;
    const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));
    
    let parsedData;
    
    // Parse based on file extension
    if (fileExtension === '.schem') {
      parsedData = await SchematicService.parseSchematic(req.file.buffer);
    } else if (fileExtension === '.schematic') {
      parsedData = await SchematicService.parseLegacySchematic(req.file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }
    
    // Create new voxel model
    const voxelModel = new VoxelModel({
      name: name || req.file.originalname,
      description: description || '',
      width: parsedData.width,
      height: parsedData.height,
      length: parsedData.length,
      origin: parsedData.origin,
      blocks: parsedData.blocks,
      blockPalette: parsedData.blockPalette,
      totalBlocks: parsedData.totalBlocks,
      originalFormat: parsedData.originalFormat,
      originalFileName: req.file.originalname
    });
    
    await voxelModel.save();
    
    res.json({
      success: true,
      modelId: voxelModel._id,
      model: {
        id: voxelModel._id,
        name: voxelModel.name,
        description: voxelModel.description,
        dimensions: {
          width: voxelModel.width,
          height: voxelModel.height,
          length: voxelModel.length
        },
        origin: voxelModel.origin,
        totalBlocks: voxelModel.totalBlocks,
        blockPalette: voxelModel.blockPalette,
        originalFormat: voxelModel.originalFormat
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process schematic file',
      message: error.message 
    });
  }
});

/**
 * GET /model/:id
 * Get a voxel model by ID
 */
router.get('/model/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ error: 'Invalid model ID format' });
    }
    
    console.log('🔍 Getting model with ID:', req.params.id);
    const model = await VoxelModel.findById(req.params.id);
    
    if (!model) {
      console.log('❌ Model not found:', req.params.id);
      return res.status(404).json({ error: 'Model not found' });
    }
    
    console.log('✅ Model found:', model.name);
    res.json({
      id: model._id,
      name: model.name,
      description: model.description,
      dimensions: {
        width: model.width,
        height: model.height,
        length: model.length
      },
      origin: model.origin,
      blocks: model.blocks,
      blockPalette: model.blockPalette,
      totalBlocks: model.totalBlocks,
      activeUsers: model.activeUsers,
      lastModified: model.lastModified,
      version: model.version,
      originalFormat: model.originalFormat,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    });
    
  } catch (error) {
    console.error('Get model error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve model',
      message: error.message 
    });
  }
});

/**
 * PUT /model/:id
 * Update a voxel model
 */
router.put('/model/:id', async (req, res) => {
  try {
    const { name, description, blocks } = req.body;
    const model = await VoxelModel.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Update basic properties
    if (name !== undefined) model.name = name;
    if (description !== undefined) model.description = description;
    
    // Update blocks if provided
    if (blocks !== undefined) {
      model.blocks = blocks;
      model.totalBlocks = blocks.length;
      model.blockPalette = Array.from(new Set(blocks.map(b => b.blockType)));
      model.version += 1;
    }
    
    model.lastModified = new Date();
    await model.save();
    
    res.json({
      success: true,
      model: {
        id: model._id,
        name: model.name,
        description: model.description,
        totalBlocks: model.totalBlocks,
        version: model.version,
        lastModified: model.lastModified
      }
    });
    
  } catch (error) {
    console.error('Update model error:', error);
    res.status(500).json({ 
      error: 'Failed to update model',
      message: error.message 
    });
  }
});

/**
 * POST /export-schematic/:id
 * Export a voxel model as WorldEdit schematic
 */
router.post('/export-schematic/:id', async (req, res) => {
  try {
    console.log('🚀 Export request received for model ID:', req.params.id);
    
    const model = await VoxelModel.findById(req.params.id);
    
    if (!model) {
      console.log('❌ Model not found:', req.params.id);
      return res.status(404).json({ error: 'Model not found' });
    }
    
    console.log('✅ Model found:', {
      name: model.name,
      blocks: model.blocks?.length || 0,
      dimensions: { width: model.width, height: model.height, length: model.length }
    });
    
    // Generate schematic file
    const schematicBuffer = await SchematicService.generateSchematic(model);
    
    // Set response headers for file download
    const fileName = `${model.name.replace(/[^a-zA-Z0-9]/g, '_')}.schem`;
    console.log('📁 Sending file:', fileName, 'Size:', schematicBuffer.length, 'bytes');
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', schematicBuffer.length);
    
    res.send(schematicBuffer);
    
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export schematic',
      message: error.message 
    });
  }
});

/**
 * GET /models
 * List all voxel models (with pagination)
 */
router.get('/models', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const models = await VoxelModel.find({}, {
      blocks: 0 // Exclude blocks array for performance
    })
    .sort({ lastModified: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await VoxelModel.countDocuments();
    
    res.json({
      models: models.map(model => ({
        id: model._id,
        name: model.name,
        description: model.description,
        dimensions: {
          width: model.width,
          height: model.height,
          length: model.length
        },
        totalBlocks: model.totalBlocks,
        lastModified: model.lastModified,
        createdAt: model.createdAt
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve models',
      message: error.message 
    });
  }
});

/**
 * DELETE /model/:id
 * Delete a voxel model
 */
router.delete('/model/:id', async (req, res) => {
  try {
    const model = await VoxelModel.findByIdAndDelete(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Model deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ 
      error: 'Failed to delete model',
      message: error.message 
    });
  }
});

/**
 * POST /model/:id/block
 * Add or update a single block
 */
router.post('/model/:id/block', async (req, res) => {
  try {
    const { x, y, z, blockType, blockData, properties } = req.body;
    const model = await VoxelModel.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Validate coordinates are within bounds
    if (x < 0 || x >= model.width || 
        y < 0 || y >= model.height || 
        z < 0 || z >= model.length) {
      return res.status(400).json({ error: 'Coordinates out of bounds' });
    }
    
    model.setBlock(x, y, z, blockType, blockData, properties);
    await model.save();
    
    res.json({
      success: true,
      block: { x, y, z, blockType, blockData, properties },
      version: model.version
    });
    
  } catch (error) {
    console.error('Set block error:', error);
    res.status(500).json({ 
      error: 'Failed to set block',
      message: error.message 
    });
  }
});

/**
 * POST /create-empty
 * Create a new empty voxel model
 */
router.post('/create-empty', async (req, res) => {
  try {
    console.log('🎯 Creating new empty model:', req.body);
    const { name, description, width, height, length } = req.body;
    
    // Validate dimensions
    if (!width || !height || !length || 
        width <= 0 || height <= 0 || length <= 0 ||
        width > 1000 || height > 1000 || length > 1000) {
      return res.status(400).json({ 
        error: 'Invalid dimensions. Must be between 1 and 1000.' 
      });
    }
    
    const voxelModel = new VoxelModel({
      name: name || 'New Model',
      description: description || '',
      width: parseInt(width),
      height: parseInt(height),
      length: parseInt(length),
      origin: { x: 0, y: 0, z: 0 },
      blocks: [],
      blockPalette: [],
      totalBlocks: 0,
      originalFormat: 'created'
    });
    
    await voxelModel.save();
    
    console.log('✅ Model created successfully:', voxelModel._id);
    
    res.json({
      success: true,
      modelId: voxelModel._id,
      model: {
        id: voxelModel._id,
        name: voxelModel.name,
        description: voxelModel.description,
        dimensions: {
          width: voxelModel.width,
          height: voxelModel.height,
          length: voxelModel.length
        },
        origin: voxelModel.origin,
        totalBlocks: 0,
        blockPalette: [],
        originalFormat: 'created'
      }
    });
    
  } catch (error) {
    console.error('Create empty model error:', error);
    res.status(500).json({ 
      error: 'Failed to create model',
      message: error.message 
    });
  }
});

export default router;
