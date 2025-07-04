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
        <!-- Three.js Canvas -->
        <canvas ref="threeCanvas" class="three-canvas"></canvas>
        
        <!-- Side Panels -->
        <div class="side-panels">
          <!-- Left Panel -->
          <div class="left-panel panel">
            <!-- Block Palette -->
            <div class="panel-section">
              <div class="panel-header">Block Palette</div>
              <BlockPalette 
                :selectedBlockType="selectedBlockType"
                @select-block="setSelectedBlockType"
              />
            </div>
            
            <!-- Model Info -->
            <div class="panel-section">
              <div class="panel-header">Model Info</div>
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
          Tool: {{ getCurrentTool()?.name || 'Unknown' }}
          | Block: {{ getBlockName(selectedBlockType) }}
          <span v-if="selectionStart && !selectionEnd" class="status-highlight">
            | Selecting... ({{ selectionStart.x }}, {{ selectionStart.y }}, {{ selectionStart.z }})
          </span>
          <span v-if="selectionStart && selectionEnd" class="status-highlight">
            | Selected: {{ getSelectionSize() }} blocks
          </span>
          <span v-if="clipboard" class="status-highlight">
            | Clipboard: {{ clipboard.blocks.length }} blocks
          </span>
        </div>
        <div class="status-center">
          <span v-if="hoveredBlock" class="hover-info">
            Hover: ({{ hoveredBlock.x }}, {{ hoveredBlock.y }}, {{ hoveredBlock.z }})
          </span>
        </div>
        <div class="status-right">
          Camera: ({{ Math.round(cameraPosition.x) }}, {{ Math.round(cameraPosition.y) }}, {{ Math.round(cameraPosition.z) }})
          | Blocks: {{ totalBlocks }}
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
import { ref, onMounted, onUnmounted, computed, watch, markRaw, toRaw } from 'vue'
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
    
    // Selection state
    const selectionStart = ref(null)
    const selectionEnd = ref(null)
    const isSelecting = ref(false)
    const clipboard = ref(null) // Stores copied blocks
    
    // Tools
    const tools = [
      { id: 'place', name: 'Place Block', icon: '🧱' },
      { id: 'remove', name: 'Remove Block', icon: '🗑️' },
      { id: 'select', name: 'Select', icon: '👆' },
      { id: 'fill', name: 'Fill Tool', icon: '🪣' },
      { id: 'copy', name: 'Copy/Paste', icon: '📋' }
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

    // Helper methods
    const getSelectionSize = () => {
      if (!selectionStart.value || !selectionEnd.value) return 0
      const width = Math.abs(selectionEnd.value.x - selectionStart.value.x) + 1
      const height = Math.abs(selectionEnd.value.y - selectionStart.value.y) + 1
      const depth = Math.abs(selectionEnd.value.z - selectionStart.value.z) + 1
      return width * height * depth
    }
    
    // Methods placeholder - the actual methods would be here
    const loadModel = async () => {
      // Implementation would go here
    }

    const initializeThreeJS = () => {
      // Implementation would go here
    }

    // Return the reactive properties for the template
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
      selectionStart,
      selectionEnd,
      isSelecting,
      clipboard,
      
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
      getSelectionSize,
      getBlockName,
      getCurrentTool: () => tools.find(t => t.id === selectedTool.value)
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

.tool-group {
  display: flex;
  gap: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-area {
  flex: 1;
  position: relative;
  display: flex;
}

.three-canvas {
  flex: 1;
  display: block;
  background: #1a1a1a;
}

.side-panels {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  z-index: 10;
}

.panel {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.left-panel {
  width: 250px;
}

.right-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 300px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 16px;
}

.panel-header {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #333;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;
  background: rgba(0, 0, 0, 0.9);
  border-top: 1px solid #333;
  font-size: 12px;
  flex-shrink: 0;
}

.status-left, .status-center, .status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-highlight {
  color: #4CAF50;
  font-weight: bold;
}

.hover-info {
  color: #ffeb3b;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #333;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #555;
}

.btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #f44336;
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
  max-width: 300px;
}
</style>
