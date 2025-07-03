<template>
  <div class="editor-container">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div>Loading model...</div>
      </div>
    </div>
    
    <!-- Main Editor Interface -->
    <div v-else class="editor-layout">
      <!-- Top Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <button @click="$router.push('/')" class="btn btn-secondary">
            ← Back
          </button>
          <span class="model-name">{{ currentModel?.name || 'Untitled' }}</span>
          <span class="connection-status" :class="{ connected: isConnected }">
            {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
          </span>
        </div>
        
        <div class="toolbar-center">
          <div class="tool-group">
            <button 
              v-for="tool in tools" 
              :key="tool.id"
              @click="setSelectedTool(tool.id)"
              :class="['btn', { active: selectedTool === tool.id }]"
              :title="tool.name"
            >
              {{ tool.icon }}
            </button>
          </div>
        </div>
        
        <div class="toolbar-right">
          <button @click="exportModel" class="btn" :disabled="isExporting">
            {{ isExporting ? 'Exporting...' : '💾 Export' }}
          </button>
          <button @click="showChatPanel = !showChatPanel" class="btn btn-secondary">
            💬 Chat
          </button>
        </div>
      </div>
      
      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Block Palette -->
        <div class="left-panel panel">
          <BlockPalette 
            :selected-block="selectedBlockType"
            @block-selected="setSelectedBlockType"
          />
        </div>
        
        <!-- 3D Viewport -->
        <div class="viewport-container">
          <canvas ref="threeCanvas" class="three-canvas"></canvas>
          
          <!-- Viewport Overlay -->
          <div class="viewport-overlay">
            <div class="viewport-info">
              <div>{{ totalBlocks }} blocks</div>
              <div>{{ modelDimensions.width }}×{{ modelDimensions.height }}×{{ modelDimensions.length }}</div>
              <div v-if="hoveredBlock">
                Hover: ({{ hoveredBlock.x }}, {{ hoveredBlock.y }}, {{ hoveredBlock.z }})
              </div>
            </div>
            
            <!-- Active Users -->
            <div v-if="activeUsers.length > 0" class="active-users">
              <div class="users-header">Active Users:</div>
              <div 
                v-for="user in activeUsers" 
                :key="user.userId"
                class="user-indicator"
              >
                {{ user.userName }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Chat Panel -->
        <div v-if="showChatPanel" class="right-panel panel">
          <ChatPanel 
            :messages="chatMessages"
            @send-message="sendChatMessage"
          />
        </div>
      </div>
      
      <!-- Bottom Status Bar -->
      <div class="status-bar">
        <div class="status-left">
          Tool: {{ getCurrentTool()?.name }}
          | Block: {{ getBlockName(selectedBlockType) }}
        </div>
        <div class="status-right">
          Camera: ({{ Math.round(cameraPosition.x) }}, {{ Math.round(cameraPosition.y) }}, {{ Math.round(cameraPosition.z) }})
        </div>
      </div>
    </div>
    
    <!-- Error Toast -->
    <div v-if="error" class="error-toast" @click="clearError">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVoxelStore } from '@/stores/voxelStore'
import apiService from '@/services/apiService'
import socketService from '@/services/socketService'
import { getBlockName } from '@/utils/blockTypes'
import BlockPalette from '@/components/BlockPalette.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import VoxelRenderer from '@/utils/VoxelRenderer'

export default {
  name: 'Editor',
  components: {
    BlockPalette,
    ChatPanel
  },
  props: {
    modelId: String
  },
  setup(props) {
    const route = useRoute()
    const voxelStore = useVoxelStore()
    
    // Refs
    const threeCanvas = ref(null)
    const voxelRenderer = ref(null)
    const isLoading = ref(true)
    const isExporting = ref(false)
    const error = ref(null)
    const showChatPanel = ref(false)
    const hoveredBlock = ref(null)
    const chatMessages = ref([])
    
    // Tools
    const tools = [
      { id: 'place', name: 'Place Block', icon: '🧱' },
      { id: 'remove', name: 'Remove Block', icon: '🗑️' },
      { id: 'select', name: 'Select', icon: '👆' },
      { id: 'fill', name: 'Fill Tool', icon: '🪣' }
    ]
    
    // Computed
    const currentModel = computed(() => voxelStore.currentModel)
    const selectedBlockType = computed(() => voxelStore.selectedBlockType)
    const selectedTool = computed(() => voxelStore.selectedTool)
    const totalBlocks = computed(() => voxelStore.totalBlocks)
    const modelDimensions = computed(() => voxelStore.modelDimensions)
    const activeUsers = computed(() => voxelStore.activeUsers)
    const isConnected = computed(() => voxelStore.isConnected)
    const cameraPosition = computed(() => voxelStore.cameraPosition)
    
    // Methods
    const loadModel = async () => {
      try {
        isLoading.value = true
        const modelId = props.modelId || route.params.modelId
        
        if (!modelId) {
          throw new Error('No model ID provided')
        }
        
        const model = await apiService.getModel(modelId)
        voxelStore.setCurrentModel(model)
        
        // Connect to socket and join room
        socketService.connect()
        socketService.joinModel(modelId, `User-${Date.now()}`)
        
      } catch (err) {
        error.value = `Failed to load model: ${err.message}`
      } finally {
        isLoading.value = false
      }
    }
    
    const initializeThreeJS = () => {
      if (!threeCanvas.value) return
      
      voxelRenderer.value = new VoxelRenderer(threeCanvas.value)
      voxelRenderer.value.setVoxelStore(voxelStore)
      
      // Set up event listeners
      voxelRenderer.value.onBlockHover = (position) => {
        hoveredBlock.value = position
      }
      
      voxelRenderer.value.onBlockClick = (position, isRightClick) => {
        handleBlockClick(position, isRightClick)
      }
      
      voxelRenderer.value.onCameraMove = (position, target) => {
        voxelStore.setCameraPosition(position)
        voxelStore.setCameraTarget(target)
      }
      
      // Start render loop
      voxelRenderer.value.startRenderLoop()
    }
    
    const handleBlockClick = (position, isRightClick) => {
      const { x, y, z } = position
      
      // Check bounds
      const dims = modelDimensions.value
      if (x < 0 || x >= dims.width || 
          y < 0 || y >= dims.height || 
          z < 0 || z >= dims.length) {
        return
      }
      
      let newBlockType = 'minecraft:air'
      
      if (selectedTool.value === 'place' && !isRightClick) {
        newBlockType = selectedBlockType.value
      } else if (selectedTool.value === 'remove' || isRightClick) {
        newBlockType = 'minecraft:air'
      }
      
      // Update local store
      voxelStore.setBlock(x, y, z, newBlockType)
      
      // Send to server and other clients
      try {
        socketService.sendBlockChange(x, y, z, newBlockType)
        // Note: We don't await the API call to keep interactions snappy
        // The socket update will handle real-time sync
        apiService.setBlock(currentModel.value.id, x, y, z, newBlockType)
      } catch (err) {
        console.error('Failed to sync block change:', err)
        // Could implement retry logic here
      }
    }
    
    const exportModel = async () => {
      try {
        isExporting.value = true
        const blob = await apiService.exportSchematic(currentModel.value.id)
        const filename = `${currentModel.value.name.replace(/[^a-zA-Z0-9]/g, '_')}.schem`
        apiService.downloadFile(blob, filename)
      } catch (err) {
        error.value = `Export failed: ${err.message}`
      } finally {
        isExporting.value = false
      }
    }
    
    const sendChatMessage = (message) => {
      try {
        socketService.sendChatMessage(message)
      } catch (err) {
        error.value = `Failed to send message: ${err.message}`
      }
    }
    
    const setSelectedBlockType = (blockType) => {
      voxelStore.setSelectedBlockType(blockType)
    }
    
    const setSelectedTool = (tool) => {
      voxelStore.setSelectedTool(tool)
    }
    
    const getCurrentTool = () => {
      return tools.find(t => t.id === selectedTool.value)
    }
    
    const clearError = () => {
      error.value = null
    }
    
    // Socket event handlers
    const setupSocketListeners = () => {
      socketService.on('connection-status', (connected) => {
        voxelStore.setConnectionStatus(connected)
      })
      
      socketService.on('room-users', (users) => {
        voxelStore.setActiveUsers(users)
      })
      
      socketService.on('user-joined', (data) => {
        voxelStore.setActiveUsers(data.activeUsers)
        chatMessages.value.push({
          type: 'system',
          message: `${data.userName} joined`,
          timestamp: new Date()
        })
      })
      
      socketService.on('user-left', (data) => {
        voxelStore.setActiveUsers(data.activeUsers)
        chatMessages.value.push({
          type: 'system',
          message: `${data.userName} left`,
          timestamp: new Date()
        })
      })
      
      socketService.on('block-changed', (data) => {
        // Update from other users
        voxelStore.setBlock(data.x, data.y, data.z, data.blockType, data.blockData, data.properties)
      })
      
      socketService.on('chat-message', (data) => {
        chatMessages.value.push({
          type: 'chat',
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          timestamp: new Date(data.timestamp)
        })
      })
      
      socketService.on('error', (error) => {
        error.value = `Socket error: ${error.message}`
      })
    }
    
    // Lifecycle
    onMounted(async () => {
      await loadModel()
      initializeThreeJS()
      setupSocketListeners()
      
      // Handle window resize
      const handleResize = () => {
        if (voxelRenderer.value) {
          voxelRenderer.value.handleResize()
        }
      }
      
      window.addEventListener('resize', handleResize)
      
      // Cleanup function stored for onUnmounted
      window.mcWebEditCleanup = () => {
        window.removeEventListener('resize', handleResize)
      }
    })
    
    onUnmounted(() => {
      if (voxelRenderer.value) {
        voxelRenderer.value.dispose()
      }
      
      socketService.leaveModel()
      
      if (window.mcWebEditCleanup) {
        window.mcWebEditCleanup()
        delete window.mcWebEditCleanup
      }
    })
    
    // Watch for blocks changes to update renderer
    watch(() => voxelStore.blocks, () => {
      if (voxelRenderer.value) {
        voxelRenderer.value.updateVoxels()
      }
    }, { deep: true })
    
    return {
      // Refs
      threeCanvas,
      isLoading,
      isExporting,
      error,
      showChatPanel,
      hoveredBlock,
      chatMessages,
      tools,
      
      // Computed
      currentModel,
      selectedBlockType,
      selectedTool,
      totalBlocks,
      modelDimensions,
      activeUsers,
      isConnected,
      cameraPosition,
      
      // Methods
      exportModel,
      sendChatMessage,
      setSelectedBlockType,
      setSelectedTool,
      getCurrentTool,
      clearError,
      getBlockName
    }
  }
}
</script>

<style scoped>
.editor-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: white;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-center {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-name {
  font-weight: 600;
  color: #4CAF50;
}

.connection-status {
  font-size: 0.9rem;
  color: #f44336;
}

.connection-status.connected {
  color: #4CAF50;
}

.tool-group {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 4px;
}

.tool-group .btn {
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
}

.tool-group .btn.active {
  background: #4CAF50;
}

.content-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  flex-shrink: 0;
  margin: 8px 0 8px 8px;
  overflow-y: auto;
}

.right-panel {
  width: 320px;
  flex-shrink: 0;
  margin: 8px 8px 8px 0;
}

.viewport-container {
  flex: 1;
  position: relative;
  margin: 8px;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.viewport-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.viewport-info {
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.viewport-info > div {
  margin-bottom: 4px;
}

.viewport-info > div:last-child {
  margin-bottom: 0;
}

.active-users {
  background: rgba(0, 0, 0, 0.7);
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  max-width: 200px;
}

.users-header {
  font-weight: 600;
  margin-bottom: 8px;
  color: #4CAF50;
}

.user-indicator {
  background: rgba(76, 175, 80, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.user-indicator:last-child {
  margin-bottom: 0;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid #333;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.error-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #f44336;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 1001;
  max-width: 400px;
}
</style>
