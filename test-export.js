#!/usr/bin/env node
/**
 * Test the export functionality by calling the API directly
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001/api';

async function testExport() {
  try {
    console.log('🧪 Testing export functionality...');
    
    // Get list of models
    console.log('📋 Fetching models...');
    const modelsResponse = await fetch(`${API_BASE}/schematic/models`);
    const modelsData = await modelsResponse.json();
    
    if (!modelsData.models || modelsData.models.length === 0) {
      console.log('❌ No models found to test');
      return;
    }
    
    // Use the first model with blocks
    const testModel = modelsData.models.find(m => m.totalBlocks > 0);
    if (!testModel) {
      console.log('❌ No models with blocks found to test');
      return;
    }
    
    console.log(`🎯 Testing with model: ${testModel.name} (${testModel.totalBlocks} blocks)`);
    console.log(`   ID: ${testModel.id}`);
    console.log(`   Dimensions: ${testModel.dimensions.width}×${testModel.dimensions.height}×${testModel.dimensions.length}`);
    
    // Export the model
    console.log('📤 Exporting schematic...');
    const exportResponse = await fetch(`${API_BASE}/schematic/export-schematic/${testModel.id}`, {
      method: 'POST'
    });
    
    if (!exportResponse.ok) {
      const error = await exportResponse.json();
      throw new Error(error.message || 'Export failed');
    }
    
    // Save to file
    const buffer = await exportResponse.buffer();
    const filename = `test-export-${testModel.name.replace(/[^a-zA-Z0-9]/g, '_')}.schem`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`💾 Saved to: ${filepath}`);
    console.log(`📊 File size: ${buffer.length} bytes`);
    
    // Validate the file
    console.log('🔍 Validating exported file...');
    const validateScript = path.join(process.cwd(), 'validate-schem.js');
    
    const { spawn } = await import('child_process');
    const validation = spawn('node', [validateScript, filepath], { stdio: 'inherit' });
    
    validation.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Export test completed successfully!');
      } else {
        console.log('❌ Export validation failed');
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExport();
