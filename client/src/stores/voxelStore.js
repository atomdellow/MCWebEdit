import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVoxelStore = defineStore('voxel', () => {
  // State
  const currentModel = ref(null)
  const blocks = ref(new Map()) // Map with "x,y,z" keys
  const selectedBlockType = ref('minecraft:stone')
  const isLoading = ref(false)
  const error = ref(null)
  
  // Collaboration state
  const activeUsers = ref([])
  const isConnected = ref(false)
  
  // Editor state
  const cameraPosition = ref({ x: 10, y: 10, z: 10 })
  const cameraTarget = ref({ x: 0, y: 0, z: 0 })
  const selectedTool = ref('place') // 'place', 'remove', 'select'
  
  // Getters
  const modelDimensions = computed(() => {
    if (!currentModel.value) {
      console.log('🚫 No current model, using default dimensions')
      return { width: 50, height: 50, length: 50 }
    }
    
    if (!currentModel.value.dimensions) {
      console.log('🚫 Current model has no dimensions property, using default')
      console.log('🔍 Current model:', currentModel.value)
      return { width: 50, height: 50, length: 50 }
    }
    
    const dims = {
      width: currentModel.value.dimensions.width || 50,
      height: currentModel.value.dimensions.height || 50,
      length: currentModel.value.dimensions.length || 50
    }
    
    console.log('✅ Model dimensions computed:', dims)
    return dims
  })
  
  const totalBlocks = computed(() => blocks.value.size)
  
  const blockPalette = computed(() => {
    const types = new Set()
    blocks.value.forEach(block => types.add(block.blockType))
    return Array.from(types).sort()
  })
  
  // Actions
  function setCurrentModel(model) {
    currentModel.value = model
    loadBlocks(model.blocks || [])
  }
  
  function loadBlocks(blockArray) {
    blocks.value.clear()
    blockArray.forEach(block => {
      const key = `${block.x},${block.y},${block.z}`
      blocks.value.set(key, { ...block })
    })
  }
  
  function setBlock(x, y, z, blockType, blockData = 0, properties = {}) {
    const key = `${x},${y},${z}`
    
    if (blockType === 'minecraft:air' || !blockType) {
      blocks.value.delete(key)
    } else {
      blocks.value.set(key, {
        x, y, z, blockType, blockData, properties
      })
    }
  }
  
  function getBlock(x, y, z) {
    const key = `${x},${y},${z}`
    return blocks.value.get(key) || {
      x, y, z,
      blockType: 'minecraft:air',
      blockData: 0,
      properties: {}
    }
  }
  
  function hasBlock(x, y, z) {
    const key = `${x},${y},${z}`
    return blocks.value.has(key)
  }
  
  function removeBlock(x, y, z) {
    const key = `${x},${y},${z}`
    blocks.value.delete(key)
  }
  
  function clearAll() {
    blocks.value.clear()
  }
  
  function getBlocksArray() {
    return Array.from(blocks.value.values())
  }
  
  function setSelectedBlockType(blockType) {
    selectedBlockType.value = blockType
  }
  
  function setSelectedTool(tool) {
    selectedTool.value = tool
  }
  
  function setCameraPosition(position) {
    cameraPosition.value = { ...position }
  }
  
  function setCameraTarget(target) {
    cameraTarget.value = { ...target }
  }
  
  function setActiveUsers(users) {
    activeUsers.value = [...users]
  }
  
  function setConnectionStatus(connected) {
    isConnected.value = connected
  }
  
  function setLoading(loading) {
    isLoading.value = loading
  }
  
  function setError(errorMessage) {
    error.value = errorMessage
  }
  
  function clearError() {
    error.value = null
  }
  
  // Bulk operations
  function fillArea(startPos, endPos, blockType) {
    const minX = Math.min(startPos.x, endPos.x)
    const maxX = Math.max(startPos.x, endPos.x)
    const minY = Math.min(startPos.y, endPos.y)
    const maxY = Math.max(startPos.y, endPos.y)
    const minZ = Math.min(startPos.z, endPos.z)
    const maxZ = Math.max(startPos.z, endPos.z)
    
    const changedBlocks = []
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          setBlock(x, y, z, blockType)
          changedBlocks.push({ x, y, z, blockType })
        }
      }
    }
    
    return changedBlocks
  }
  
  function copyArea(startPos, endPos) {
    const minX = Math.min(startPos.x, endPos.x)
    const maxX = Math.max(startPos.x, endPos.x)
    const minY = Math.min(startPos.y, endPos.y)
    const maxY = Math.max(startPos.y, endPos.y)
    const minZ = Math.min(startPos.z, endPos.z)
    const maxZ = Math.max(startPos.z, endPos.z)
    
    const copiedBlocks = []
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const block = getBlock(x, y, z)
          if (block.blockType !== 'minecraft:air') {
            copiedBlocks.push({
              ...block,
              relativeX: x - minX,
              relativeY: y - minY,
              relativeZ: z - minZ
            })
          }
        }
      }
    }
    
    return copiedBlocks
  }
  
  function pasteBlocks(pastePos, copiedBlocks) {
    const changedBlocks = []
    
    copiedBlocks.forEach(block => {
      const x = pastePos.x + block.relativeX
      const y = pastePos.y + block.relativeY
      const z = pastePos.z + block.relativeZ
      
      // Check bounds
      const dims = modelDimensions.value
      if (x >= 0 && x < dims.width && 
          y >= 0 && y < dims.height && 
          z >= 0 && z < dims.length) {
        setBlock(x, y, z, block.blockType, block.blockData, block.properties)
        changedBlocks.push({ x, y, z, blockType: block.blockType })
      }
    })
    
    return changedBlocks
  }
  
  return {
    // State
    currentModel,
    blocks,
    selectedBlockType,
    isLoading,
    error,
    activeUsers,
    isConnected,
    cameraPosition,
    cameraTarget,
    selectedTool,
    
    // Getters
    modelDimensions,
    totalBlocks,
    blockPalette,
    
    // Actions
    setCurrentModel,
    loadBlocks,
    setBlock,
    getBlock,
    hasBlock,
    removeBlock,
    clearAll,
    getBlocksArray,
    setSelectedBlockType,
    setSelectedTool,
    setCameraPosition,
    setCameraTarget,
    setActiveUsers,
    setConnectionStatus,
    setLoading,
    setError,
    clearError,
    fillArea,
    copyArea,
    pasteBlocks
  }
})
