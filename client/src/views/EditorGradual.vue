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
    <div class="editor-layout">
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
            <template v-for="tool in tools" :key="tool.id">
              <!-- Regular tool button -->
              <button 
                v-if="!tool.isDropdown"
                @click="setSelectedTool(tool.id)"
                :class="['btn', { active: selectedTool === tool.id }]"
                :title="tool.name"
              >
                {{ tool.icon }}
              </button>
              
              <!-- Dropdown tool button -->
              <div v-else class="dropdown-tool" :class="{ active: selectedTool === tool.id }">
                <button 
                  @click="toggleShapeDropdown"
                  :class="['btn', { active: selectedTool === tool.id }]"
                  :title="tool.name"
                >
                  {{ selectedTool === tool.id ? getSelectedShapeIcon() : tool.icon }}
                  <span class="dropdown-arrow">▼</span>
                </button>
                
                <div v-if="showShapeDropdown && selectedTool === tool.id" class="dropdown-menu">
                  <button 
                    v-for="shape in tool.options" 
                    :key="shape.id"
                    @click="selectShape(shape.id)"
                    :class="['dropdown-item', { active: selectedShape === shape.id }]"
                  >
                    {{ shape.icon }} {{ shape.name }}
                  </button>
                </div>
              </div>
            </template>
          </div>
          
          <!-- Tool Help -->
          <div class="tool-help">
            <span v-if="selectedTool === 'place'">Left: Place | Right: Remove</span>
            <span v-else-if="selectedTool === 'remove'">Click: Remove Block</span>
            <span v-else-if="selectedTool === 'select'">Left: Start/End Selection | Right: Clear</span>
            <span v-else-if="selectedTool === 'fill'">Left: Fill | Right: Clear Fill</span>
            <span v-else-if="selectedTool === 'copy'">Left: Copy Selection | Right: Paste</span>
            <span v-else-if="selectedTool === 'shapes'">Click and drag to create {{ getSelectedShapeName() }}</span>
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
        <div ref="threeContainer" class="three-container"></div>
        
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
            
            <!-- Controls Help -->
            <div class="panel-section">
              <div class="panel-header">Controls</div>
              <div class="controls-help">
                <div><strong>Camera:</strong></div>
                <div>WASD: Move | QE: Up/Down</div>
                <div>Mouse Wheel: Zoom</div>
                <div>Middle Mouse: Rotate</div>
                <div>R: Reset | F: Focus</div>
                <div><strong>Block Targeting:</strong></div>
                <div>Enter: Toggle Manual Mode</div>
                <div>Arrow Keys: Move Target</div>
                <div>Insert/Delete: Up/Down</div>
                <div>Space: Place Block (Manual Mode)</div>
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
import { ref, onMounted, onUnmounted, computed, nextTick, markRaw, watch, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useVoxelStore } from '@/stores/voxelStore'
import apiService from '@/services/apiService'
import socketService from '@/services/socketService'
import { getBlockName } from '@/utils/blockTypes'
import BlockPalette from '@/components/BlockPalette.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import VoxelRenderer from '@/utils/VoxelRenderer'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

console.log('📦 Editor.vue: Module loaded!');

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
    console.log('🚀 Editor: Setup function called!');
    console.log('🚀 Editor: Props received:', props);
    
    const route = useRoute()
    const voxelStore = useVoxelStore()
    
    // Refs
    const isLoading = ref(true)
    const error = ref(null)
    const isExporting = ref(false)
    const threeContainer = ref(null)
    const showChatPanel = ref(false)
    const hoveredBlock = ref(null)
    const chatMessages = ref([])
    
    // Selection state
    const selectionStart = ref(null)
    const selectionEnd = ref(null)
    const isSelecting = ref(false)
    const clipboard = ref(null)
    
    // Tools
    const tools = [
      { id: 'place', name: 'Place Block', icon: '🧱' },
      { id: 'remove', name: 'Remove Block', icon: '🗑️' },
      { id: 'select', name: 'Select', icon: '👆' },
      { id: 'fill', name: 'Fill Tool', icon: '🪣' },
      { id: 'copy', name: 'Copy/Paste', icon: '📋' },
      { 
        id: 'shapes', 
        name: 'Shapes', 
        icon: '📐',
        isDropdown: true,
        options: [
          { id: 'box', name: 'Box', icon: '📦' },
          { id: 'sphere', name: 'Sphere', icon: '🔮' },
          { id: 'cylinder', name: 'Cylinder', icon: '🥫' },
          { id: 'pyramid', name: 'Pyramid', icon: '🔺' },
          { id: 'slab', name: 'Flat Slab', icon: '📄' },
          { id: 'round_slab', name: 'Round Slab', icon: '🎯' },
          { id: 'path', name: 'Path', icon: '🛤️' }
        ]
      }
    ]
    
    // Shape tool state
    const selectedShape = ref('box')
    const showShapeDropdown = ref(false)
    
    // Three.js objects - stored outside Vue's reactivity system
    let scene = null
    let camera = null
    let renderer = null
    let controls = null
    let voxelRenderer = null
    
    // Computed
    const currentModel = computed(() => voxelStore.currentModel)
    const selectedBlockType = computed(() => voxelStore.selectedBlockType)
    const selectedTool = computed(() => voxelStore.selectedTool)
    const totalBlocks = computed(() => voxelStore.totalBlocks)
    const modelDimensions = computed(() => voxelStore.modelDimensions)
    const activeUsers = computed(() => voxelStore.activeUsers)
    const isConnected = computed(() => voxelStore.isConnected)
    const cameraPosition = computed(() => voxelStore.cameraPosition)
    
    // Watch for selectedBlockType changes
    watch(selectedBlockType, (newBlockType, oldBlockType) => {
      console.log(`🎯 EditorGradual: selectedBlockType changed from ${oldBlockType} to ${newBlockType}`)
    }, { immediate: true })
    
    // Methods
    const loadModel = async () => {
      try {
        console.log('🎯 Editor: Starting to load model...')
        isLoading.value = true
        const modelId = props.modelId || route.params.modelId
        
        if (!modelId) {
          throw new Error('No model ID provided')
        }
        
        console.log('🔄 Loading model:', modelId)
        const model = await apiService.getModel(modelId)
        console.log('✅ Model loaded:', model)
        voxelStore.setCurrentModel(model)
        
        console.log('🔌 Connecting to socket...')
        // Connect to socket first
        socketService.connect()
        
        // Wait for connection before joining room
        const maxRetries = 5
        let retryCount = 0
        
        const waitForConnection = () => {
          return new Promise((resolve, reject) => {
            const checkConnection = () => {
              if (socketService.socket?.connected) {
                console.log('🏠 Joining model room:', modelId)
                socketService.joinModel(modelId, `User-${Date.now()}`)
                voxelStore.setConnectionStatus(true) // Set connected status
                resolve()
              } else if (retryCount < maxRetries) {
                retryCount++
                console.log(`⏳ Waiting for socket connection... (${retryCount}/${maxRetries})`)
                setTimeout(checkConnection, 1000)
              } else {
                console.warn('⚠️ Socket connection timeout, continuing without socket')
                voxelStore.setConnectionStatus(false) // Set disconnected status
                resolve() // Don't block the loading, just continue without socket
              }
            }
            checkConnection()
          })
        }
        
        try {
          await waitForConnection()
          console.log('✅ Socket connected and room joined')
          // Double-check connection status after joining
          if (socketService.socket?.connected) {
            voxelStore.setConnectionStatus(true)
          }
        } catch (socketErr) {
          console.warn('⚠️ Socket connection failed, continuing without real-time features:', socketErr)
          voxelStore.setConnectionStatus(false)
        }
        
      } catch (err) {
        console.error('❌ Failed to load model:', err)
        error.value = `Failed to load model: ${err.message}`
      } finally {
        console.log('🏁 Setting isLoading to false')
        isLoading.value = false
        
        // Initialize 3D renderer after loading is complete and DOM is updated
        await nextTick()
        await initThreeJS()
      }
    }
    
    const initThreeJS = async () => {
      try {
        console.log('🎮 Editor: Initializing Three.js...')
        
        // Wait a bit more to ensure DOM is ready
        await nextTick()
        
        console.log('🎮 Checking for threeContainer ref...')
        console.log('🎮 threeContainer.value:', threeContainer.value)
        
        if (!threeContainer.value) {
          console.error('❌ Three.js container ref is null')
          throw new Error('Three.js container not found')
        }
        
        const container = threeContainer.value
        const width = container.clientWidth || 800
        const height = container.clientHeight || 600
        
        console.log('🎮 Three.js container found, dimensions:', { width, height })
        
        if (width === 0 || height === 0) {
          console.warn('⚠️ Container has zero dimensions, using defaults')
        }
        
        // Create VoxelRenderer with markRaw to avoid reactivity issues
        console.log('🎨 Creating VoxelRenderer...')
        voxelRenderer = markRaw(new VoxelRenderer(container))
        
        // Use toRaw to strip reactivity from the entire store before passing it
        const rawStore = toRaw(voxelStore)
        console.log('📦 Setting voxel store (raw):', rawStore)
        voxelRenderer.setVoxelStore(rawStore)
        
        // Set up event listeners
        voxelRenderer.onBlockHover = (position) => {
          hoveredBlock.value = position
        }
        
        voxelRenderer.onBlockClick = (position, isRightClick) => {
          handleBlockClick(position, isRightClick)
        }
        
        voxelRenderer.onCameraMove = (position, target) => {
          // Create completely new objects to avoid proxy issues
          const newPosition = { x: position.x, y: position.y, z: position.z }
          const newTarget = { x: target.x, y: target.y, z: target.z }
          voxelStore.setCameraPosition(newPosition)
          voxelStore.setCameraTarget(newTarget)
        }
        
        console.log('✅ Three.js initialization completed')
        
      } catch (err) {
        console.error('❌ Failed to initialize Three.js:', err)
        error.value = `Failed to initialize 3D renderer: ${err.message}`
      }
    }
    
    const animate = () => {
      if (!renderer || !scene || !camera) return
      
      requestAnimationFrame(animate)
      
      // Update controls
      if (controls) {
        controls.update()
      }
      
      renderer.render(scene, camera)
    }
    
    const exportModel = async () => {
      try {
        isExporting.value = true
        console.log('📤 Exporting model...')
        // Placeholder for export functionality
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate export
        console.log('✅ Export completed')
      } catch (err) {
        console.error('❌ Export failed:', err)
        error.value = `Export failed: ${err.message}`
      } finally {
        isExporting.value = false
      }
    }
    
    const clearError = () => {
      error.value = null
    }
    
    // Helper methods
    const getSelectionSize = () => {
      if (!selectionStart.value || !selectionEnd.value) return 0
      const width = Math.abs(selectionEnd.value.x - selectionStart.value.x) + 1
      const height = Math.abs(selectionEnd.value.y - selectionStart.value.y) + 1
      const depth = Math.abs(selectionEnd.value.z - selectionStart.value.z) + 1
      return width * height * depth
    }
    
    const handleBlockClick = (position, isRightClick) => {
      const { x, y, z } = position
      
      // Check if socket is connected
      if (!isConnected.value) {
        error.value = 'Cannot place blocks: Not connected to server'
        return
      }
      
      // Check bounds
      const dims = modelDimensions.value
      if (x < 0 || x >= dims.width || 
          y < 0 || y >= dims.height || 
          z < 0 || z >= dims.length) {
        console.log('❌ Block position out of bounds:', { x, y, z }, 'Dims:', dims)
        return
      }
      
      // Handle different tools
      const tool = selectedTool.value
      
      if (tool === 'place') {
        const blockType = isRightClick ? 'minecraft:air' : selectedBlockType.value
        console.log(`🧱 handleBlockClick - Placing block: ${blockType} (selectedBlockType.value: ${selectedBlockType.value})`)
        console.log(`🧱 Right click: ${isRightClick}, Tool: ${tool}`)
        placeSingleBlock(x, y, z, blockType)
      } else if (tool === 'remove') {
        placeSingleBlock(x, y, z, 'minecraft:air')
      } else if (tool === 'fill') {
        handleFillTool(x, y, z, isRightClick)
      } else if (tool === 'select') {
        handleSelectTool(x, y, z, isRightClick)
      } else if (tool === 'copy') {
        handleCopyTool(x, y, z, isRightClick)
      } else if (tool === 'shapes') {
        handleShapeTool(x, y, z, isRightClick)
      }
    }
    
    const placeSingleBlock = (x, y, z, blockType) => {
      console.log(`🔨 placeSingleBlock called: (${x},${y},${z}) -> ${blockType}`)
      
      // Update local store
      voxelStore.setBlock(x, y, z, blockType)
      
      // Update renderer immediately
      if (voxelRenderer) {
        voxelRenderer.updateSingleBlock(x, y, z, blockType)
      }
      
      // Send to server and other clients
      try {
        socketService.sendBlockChange(x, y, z, blockType)
        apiService.setBlock(currentModel.value.id, x, y, z, blockType)
      } catch (err) {
        console.error('❌ Failed to sync block change:', err)
        error.value = `Failed to sync block change: ${err.message}`
      }
    }
    
    const handleFillTool = (x, y, z, isRightClick) => {
      const fillType = isRightClick ? 'minecraft:air' : selectedBlockType.value
      const dims = modelDimensions.value
      
      // Get the current block type at the clicked position
      const currentBlockType = voxelStore.getBlock(x, y, z)?.blockType || 'minecraft:air'
      
      // If we're trying to fill with the same type, don't do anything
      if (currentBlockType === fillType) {
        console.log('Fill tool: Already the same block type')
        return
      }
      
      // Flood fill algorithm
      const visited = new Set()
      const queue = [{ x, y, z }]
      const maxFillSize = 1000 // Prevent infinite fills
      let fillCount = 0
      
      while (queue.length > 0 && fillCount < maxFillSize) {
        const pos = queue.shift()
        const key = `${pos.x},${pos.y},${pos.z}`
        
        // Skip if already visited or out of bounds
        if (visited.has(key) ||
            pos.x < 0 || pos.x >= dims.width ||
            pos.y < 0 || pos.y >= dims.height ||
            pos.z < 0 || pos.z >= dims.length) {
          continue
        }
        
        visited.add(key)
        
        // Check if this block matches the original type
        const blockType = voxelStore.getBlock(pos.x, pos.y, pos.z)?.blockType || 'minecraft:air'
        if (blockType !== currentBlockType) {
          continue
        }
        
        // Place the new block
        placeSingleBlock(pos.x, pos.y, pos.z, fillType)
        fillCount++
        
        // Add adjacent positions to queue
        const directions = [
          { dx: 1, dy: 0, dz: 0 },
          { dx: -1, dy: 0, dz: 0 },
          { dx: 0, dy: 1, dz: 0 },
          { dx: 0, dy: -1, dz: 0 },
          { dx: 0, dy: 0, dz: 1 },
          { dx: 0, dy: 0, dz: -1 }
        ]
        
        for (const dir of directions) {
          queue.push({
            x: pos.x + dir.dx,
            y: pos.y + dir.dy,
            z: pos.z + dir.dz
          })
        }
      }
      
      console.log(`Fill tool: Filled ${fillCount} blocks`)
    }
    
    const handleSelectTool = (x, y, z, isRightClick) => {
      if (isRightClick) {
        // Right click clears selection
        selectionStart.value = null
        selectionEnd.value = null
        isSelecting.value = false
        
        // Clear selection visualization in renderer
        if (voxelRenderer) {
          voxelRenderer.clearSelection()
        }
        
        console.log('Selection cleared')
        return
      }
      
      if (!selectionStart.value) {
        // First click - start selection
        selectionStart.value = { x, y, z }
        isSelecting.value = true
        console.log('Selection started at:', { x, y, z })
      } else {
        // Second click - end selection
        selectionEnd.value = { x, y, z }
        isSelecting.value = false
        
        // Calculate selection bounds
        const minX = Math.min(selectionStart.value.x, x)
        const maxX = Math.max(selectionStart.value.x, x)
        const minY = Math.min(selectionStart.value.y, y)
        const maxY = Math.max(selectionStart.value.y, y)
        const minZ = Math.min(selectionStart.value.z, z)
        const maxZ = Math.max(selectionStart.value.z, z)
        
        const blockCount = (maxX - minX + 1) * (maxY - minY + 1) * (maxZ - minZ + 1)
        
        // Update selection visualization in renderer
        if (voxelRenderer) {
          voxelRenderer.showSelection(selectionStart.value, selectionEnd.value)
        }
        
        console.log(`Selection completed: ${blockCount} blocks selected`)
        console.log('From:', selectionStart.value, 'To:', selectionEnd.value)
      }
    }
    
    const handleCopyTool = (x, y, z, isRightClick) => {
      if (isRightClick) {
        // Right click = paste
        if (!clipboard.value) {
          console.log('Nothing to paste')
          return
        }
        
        // Paste the clipboard contents at the clicked position
        const paste = clipboard.value
        let pastedCount = 0
        
        for (const block of paste.blocks) {
          const newX = x + block.offsetX
          const newY = y + block.offsetY
          const newZ = z + block.offsetZ
          
          const dims = modelDimensions.value
          if (newX >= 0 && newX < dims.width &&
              newY >= 0 && newY < dims.height &&
              newZ >= 0 && newZ < dims.length) {
            placeSingleBlock(newX, newY, newZ, block.blockType)
            pastedCount++
          }
        }
        
        console.log(`Pasted ${pastedCount} blocks`)
      } else {
        // Left click = copy
        if (!selectionStart.value || !selectionEnd.value) {
          console.log('No selection to copy. Use Select tool first.')
          return
        }
        
        // Copy the selected area
        const minX = Math.min(selectionStart.value.x, selectionEnd.value.x)
        const maxX = Math.max(selectionStart.value.x, selectionEnd.value.x)
        const minY = Math.min(selectionStart.value.y, selectionEnd.value.y)
        const maxY = Math.max(selectionStart.value.y, selectionEnd.value.y)
        const minZ = Math.min(selectionStart.value.z, selectionEnd.value.z)
        const maxZ = Math.max(selectionStart.value.z, selectionEnd.value.z)
        
        const blocks = []
        
        for (let cx = minX; cx <= maxX; cx++) {
          for (let cy = minY; cy <= maxY; cy++) {
            for (let cz = minZ; cz <= maxZ; cz++) {
              const block = voxelStore.getBlock(cx, cy, cz)
              if (block && block.blockType !== 'minecraft:air') {
                blocks.push({
                  offsetX: cx - minX,
                  offsetY: cy - minY,
                  offsetZ: cz - minZ,
                  blockType: block.blockType
                })
              }
            }
          }
        }
        
        clipboard.value = { blocks }
        console.log(`Copied ${blocks.length} blocks to clipboard`)
      }
    }
    
    const handleShapeTool = (x, y, z, isRightClick) => {
      if (isRightClick) {
        // Right click clears any active shape operation
        // For future drag-to-create shapes, this could cancel the operation
        return
      }
      
      const blockType = selectedBlockType.value
      const shape = selectedShape.value
      
      console.log(`🔺 Shape tool: Creating ${shape} at (${x}, ${y}, ${z}) with block ${blockType}`)
      
      // Generate blocks based on selected shape
      const blocks = generateShapeBlocks(shape, x, y, z)
      
      // Place all blocks
      blocks.forEach(block => {
        placeSingleBlock(block.x, block.y, block.z, blockType)
      })
      
      console.log(`🔺 Shape tool: Placed ${blocks.length} blocks`)
    }
    
    const generateShapeBlocks = (shape, centerX, centerY, centerZ) => {
      switch (shape) {
        case 'box':
          return generateBox(centerX, centerY, centerZ, 3, 3, 3)
        case 'sphere':
          return generateSphere(centerX, centerY, centerZ, 3)
        case 'cylinder':
          return generateCylinder(centerX, centerY, centerZ, 2, 4)
        case 'pyramid':
          return generatePyramid(centerX, centerY, centerZ, 5)
        case 'slab':
          return generateSlab(centerX, centerY, centerZ, 5, 5)
        case 'round_slab':
          return generateRoundSlab(centerX, centerY, centerZ, 3)
        case 'path':
          return generatePath(centerX, centerY, centerZ, 7)
        default:
          return []
      }
    }
    
    const generateBox = (centerX, centerY, centerZ, width, height, depth) => {
      const blocks = []
      const halfW = Math.floor(width / 2)
      const halfH = Math.floor(height / 2)
      const halfD = Math.floor(depth / 2)
      
      for (let x = centerX - halfW; x <= centerX + halfW; x++) {
        for (let y = centerY - halfH; y <= centerY + halfH; y++) {
          for (let z = centerZ - halfD; z <= centerZ + halfD; z++) {
            blocks.push({ x, y, z })
          }
        }
      }
      
      return blocks
    }
    
    const generateSphere = (centerX, centerY, centerZ, radius) => {
      const blocks = []
      const radiusSquared = radius * radius
      
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
          for (let z = centerZ - radius; z <= centerZ + radius; z++) {
            const dx = x - centerX
            const dy = y - centerY
            const dz = z - centerZ
            const distanceSquared = dx * dx + dy * dy + dz * dz
            
            if (distanceSquared <= radiusSquared) {
              blocks.push({ x, y, z })
            }
          }
        }
      }
      
      return blocks
    }
    
    const generateCylinder = (centerX, centerY, centerZ, radius, height) => {
      const blocks = []
      const radiusSquared = radius * radius
      const halfHeight = Math.floor(height / 2)
      
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let z = centerZ - radius; z <= centerZ + radius; z++) {
          const dx = x - centerX
          const dz = z - centerZ
          const distanceSquared = dx * dx + dz * dz
          
          if (distanceSquared <= radiusSquared) {
            for (let y = centerY - halfHeight; y <= centerY + halfHeight; y++) {
              blocks.push({ x, y, z })
            }
          }
        }
      }
      
      return blocks
    }
    
    const generatePyramid = (centerX, centerY, centerZ, baseSize) => {
      const blocks = []
      const halfBase = Math.floor(baseSize / 2)
      const height = halfBase + 1
      
      for (let level = 0; level < height; level++) {
        const levelSize = baseSize - (level * 2)
        if (levelSize <= 0) break
        
        const halfLevel = Math.floor(levelSize / 2)
        const y = centerY + level
        
        for (let x = centerX - halfLevel; x <= centerX + halfLevel; x++) {
          for (let z = centerZ - halfLevel; z <= centerZ + halfLevel; z++) {
            blocks.push({ x, y, z })
          }
        }
      }
      
      return blocks
    }
    
    const generateSlab = (centerX, centerY, centerZ, width, depth) => {
      const blocks = []
      const halfW = Math.floor(width / 2)
      const halfD = Math.floor(depth / 2)
      
      for (let x = centerX - halfW; x <= centerX + halfW; x++) {
        for (let z = centerZ - halfD; z <= centerZ + halfD; z++) {
          blocks.push({ x, y: centerY, z })
        }
      }
      
      return blocks
    }
    
    const generateRoundSlab = (centerX, centerY, centerZ, radius) => {
      const blocks = []
      const radiusSquared = radius * radius
      
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        for (let z = centerZ - radius; z <= centerZ + radius; z++) {
          const dx = x - centerX
          const dz = z - centerZ
          const distanceSquared = dx * dx + dz * dz
          
          if (distanceSquared <= radiusSquared) {
            blocks.push({ x, y: centerY, z })
          }
        }
      }
      
      return blocks
    }
    
    const generatePath = (centerX, centerY, centerZ, length) => {
      const blocks = []
      const halfLength = Math.floor(length / 2)
      
      // Create a straight path along the X axis
      for (let x = centerX - halfLength; x <= centerX + halfLength; x++) {
        blocks.push({ x, y: centerY, z: centerZ })
      }
      
      return blocks
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
    
    const setSelectedTool = (toolId) => {
      voxelStore.setSelectedTool(toolId)
      if (toolId !== 'shapes') {
        showShapeDropdown.value = false
      }
    }
    
    // Shape dropdown functions
    const toggleShapeDropdown = () => {
      if (selectedTool.value !== 'shapes') {
        setSelectedTool('shapes')
      }
      showShapeDropdown.value = !showShapeDropdown.value
    }
    
    const selectShape = (shapeId) => {
      selectedShape.value = shapeId
      showShapeDropdown.value = false
      setSelectedTool('shapes')
    }
    
    const getSelectedShapeIcon = () => {
      const shapeTool = tools.find(t => t.id === 'shapes')
      const shape = shapeTool?.options?.find(s => s.id === selectedShape.value)
      return shape?.icon || '📐'
    }
    
    const getSelectedShapeName = () => {
      const shapeTool = tools.find(t => t.id === 'shapes')
      const shape = shapeTool?.options?.find(s => s.id === selectedShape.value)
      return shape?.name || 'shape'
    }
    
    const getCurrentTool = () => {
      return tools.find(t => t.id === selectedTool.value)
    }
    
    const setupSocketListeners = () => {
      socketService.on('connection-status', (status) => {
        voxelStore.setConnectionStatus(status.connected)
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
        console.log('🔄 Received block change from other user:', data)
        voxelStore.setBlock(data.x, data.y, data.z, data.blockType, data.blockData, data.properties)
        
        // Update renderer immediately
        console.log('🎨 Updating renderer from socket event...')
        if (voxelRenderer) {
          voxelRenderer.updateSingleBlock(data.x, data.y, data.z, data.blockType)
        } else {
          console.log('❌ voxelRenderer is null in socket handler!')
        }
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
      console.log('🎯 Editor: Component mounted!');
      console.log('🎯 Editor: Props modelId:', props.modelId);
      console.log('🎯 Editor: Route params:', route.params);
      
      // Initialize connection status
      voxelStore.setConnectionStatus(false)
      
      setupSocketListeners()
      await loadModel()
      
      // Handle window resize
      const handleResize = () => {
        if (voxelRenderer) {
          voxelRenderer.handleResize()
        }
      }
      
      window.addEventListener('resize', handleResize)
      
      // Cleanup function stored for onUnmounted
      window.mcWebEditCleanup = () => {
        window.removeEventListener('resize', handleResize)
      }
    })
    
    onUnmounted(() => {
      console.log('🧹 Editor: Component unmounted, cleaning up...')
      
      // Cleanup VoxelRenderer
      if (voxelRenderer) {
        voxelRenderer.dispose()
        voxelRenderer = null
      }
      
      socketService.leaveModel()
      
      if (window.mcWebEditCleanup) {
        window.mcWebEditCleanup()
        delete window.mcWebEditCleanup
      }
    })
    
    // Watch for dimension changes to update renderer
    watch(() => voxelStore.modelDimensions, (newDims) => {
      if (voxelRenderer && newDims) {
        voxelRenderer.updateDimensions(newDims)
      }
    }, { deep: true })
    
    // Return the reactive properties for the template
    return {
      // Refs
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
      threeContainer,
      selectedShape,
      showShapeDropdown,
      
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
      getBlockName,
      getSelectionSize,
      toggleShapeDropdown,
      selectShape,
      getSelectedShapeIcon,
      getSelectedShapeName
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
  gap: 16px;
}

.tool-group {
  display: flex;
  gap: 4px;
}

.tool-help {
  font-size: 12px;
  color: #ccc;
  font-style: italic;
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

.three-container {
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

.controls-help {
  font-size: 12px;
  line-height: 1.4;
}

.controls-help div {
  margin-bottom: 2px;
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

.btn-secondary {
  background: rgba(100, 100, 100, 0.2);
}

.btn-secondary:hover {
  background: rgba(120, 120, 120, 0.3);
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

.model-name {
  font-weight: bold;
}

.connection-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  background: rgba(255, 0, 0, 0.2);
}

.connection-status.connected {
  background: rgba(0, 255, 0, 0.2);
}

.active-users {
  margin-top: 16px;
}

.users-header {
  font-weight: bold;
  margin-bottom: 8px;
}

.user-indicator {
  padding: 4px 8px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
}

/* Dropdown Styles */
.dropdown-tool {
  position: relative;
  display: inline-block;
}

.dropdown-arrow {
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.7;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 150px;
  margin-top: 2px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: #3a3a3a;
}

.dropdown-item.active {
  background: #4CAF50;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}
</style>
