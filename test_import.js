const fs = require('fs');
const path = require('path');

async function testImport() {
  try {
    console.log('🧪 Testing import of Pantheon.schem...');
    
    const filePath = path.join(__dirname, 'Pantheon.schem');
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create FormData for file upload
    const FormData = require('form-data');
    const form = new FormData();
    form.append('schematic', fileBuffer, 'Pantheon.schem');
    form.append('name', 'Pantheon Test');
    form.append('description', 'Testing import of Pantheon schematic');
    
    console.log('📤 Uploading file...');
    
    // Use node-fetch for the request
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3001/api/schematic/upload-schematic', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Import successful!');
      const data = JSON.parse(result);
      console.log('📋 Imported model:', {
        id: data.model?.id,
        name: data.model?.name,
        dimensions: data.model?.dimensions,
        totalBlocks: data.model?.totalBlocks
      });
    } else {
      console.error('❌ Import failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImport();
