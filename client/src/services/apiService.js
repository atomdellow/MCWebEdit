const API_BASE = '/api'

class ApiService {
  
  async uploadSchematic(file, name, description) {
    const formData = new FormData()
    formData.append('schematic', file)
    if (name) formData.append('name', name)
    if (description) formData.append('description', description)
    
    const response = await fetch(`${API_BASE}/schematic/upload-schematic`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }
    
    return response.json()
  }
  
  async getModel(modelId) {
    const response = await fetch(`${API_BASE}/schematic/model/${modelId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch model')
    }
    
    return response.json()
  }
  
  async updateModel(modelId, data) {
    const response = await fetch(`${API_BASE}/schematic/model/${modelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Update failed')
    }
    
    return response.json()
  }
  
  async exportSchematic(modelId) {
    const response = await fetch(`${API_BASE}/schematic/export-schematic/${modelId}`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Export failed')
    }
    
    // Return blob for file download
    return response.blob()
  }
  
  async getModels(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE}/schematic/models?page=${page}&limit=${limit}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch models')
    }
    
    return response.json()
  }
  
  async deleteModel(modelId) {
    const response = await fetch(`${API_BASE}/schematic/model/${modelId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Delete failed')
    }
    
    return response.json()
  }
  
  async createEmptyModel(name, description, width, height, length) {
    const response = await fetch(`${API_BASE}/schematic/create-empty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name, description, width, height, length
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create model')
    }
    
    return response.json()
  }
  
  async setBlock(modelId, x, y, z, blockType, blockData = 0, properties = {}) {
    const response = await fetch(`${API_BASE}/schematic/model/${modelId}/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        x, y, z, blockType, blockData, properties
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to set block')
    }
    
    return response.json()
  }
  
  // Utility method for downloading files
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

export const apiService = new ApiService()
export default apiService
