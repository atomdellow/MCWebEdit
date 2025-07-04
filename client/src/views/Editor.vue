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
        </div>
        
        <div class="toolbar-right">
          <button @click="exportModel" class="btn" :disabled="isExporting">
            {{ isExporting ? 'Exporting...' : '💾 Export' }}
          </button>
        </div>
      </div>
      
      <!-- Debug Info -->
      <div class="debug-info">
        <p>Model ID: {{ modelId }}</p>
        <p>Model loaded: {{ currentModel?.name || 'None' }}</p>
        <p>Dimensions: {{ currentModel?.dimensions?.width || 0 }}x{{ currentModel?.dimensions?.height || 0 }}x{{ currentModel?.dimensions?.length || 0 }}</p>
      </div>
      
      <!-- 3D Viewport Container -->
      <div class="viewport-container">
        <div ref="threeContainer" class="three-container"></div>
      </div>
    </div>
    
    <!-- Error Toast -->
    <div v-if="error" class="error-toast" @click="clearError">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useVoxelStore } from '@/stores/voxelStore'
import apiService from '@/services/apiService'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

console.log('📦 Editor.vue: Module loaded!');

export default {
  name: 'Editor',
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
    
    // Three.js refs
    const scene = ref(null)
    const camera = ref(null)
    const renderer = ref(null)
    const controls = ref(null)
    
    // Computed
    const currentModel = computed(() => voxelStore.currentModel)
    
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
        
        // Initialize 3D renderer after model is loaded
        await nextTick()
        await initThreeJS()
        
      } catch (err) {
        console.error('❌ Failed to load model:', err)
        error.value = `Failed to load model: ${err.message}`
      } finally {
        console.log('🏁 Setting isLoading to false')
        isLoading.value = false
      }
    }
    
    const initThreeJS = async () => {
      try {
        console.log('🎮 Editor: Initializing Three.js...')
        
        if (!threeContainer.value) {
          throw new Error('Three.js container not found')
        }
        
        const container = threeContainer.value
        const width = container.clientWidth
        const height = container.clientHeight
        
        console.log('🎮 Three.js container found, dimensions:', { width, height })
        
        // Create scene
        scene.value = new THREE.Scene()
        scene.value.background = new THREE.Color(0x222222)
        
        // Create camera
        camera.value = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.value.position.set(50, 50, 50)
        camera.value.lookAt(0, 0, 0)
        
        // Create renderer
        renderer.value = new THREE.WebGLRenderer({ antialias: true })
        renderer.value.setSize(width, height)
        renderer.value.shadowMap.enabled = true
        renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
        
        // Add renderer to DOM
        container.appendChild(renderer.value.domElement)
        
        // Add basic lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
        scene.value.add(ambientLight)
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(50, 100, 50)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        scene.value.add(directionalLight)
        
        // Add a test cube to verify rendering
        const geometry = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshLambertMaterial({ color: 0xff0000 })
        const testCube = new THREE.Mesh(geometry, material)
        testCube.position.set(0, 1, 0)
        testCube.castShadow = true
        scene.value.add(testCube)
        
        // Add orbit controls
        controls.value = new OrbitControls(camera.value, renderer.value.domElement)
        controls.value.enableDamping = true
        controls.value.dampingFactor = 0.05
        controls.value.screenSpacePanning = false
        controls.value.minDistance = 10
        controls.value.maxDistance = 500
        controls.value.maxPolarAngle = Math.PI / 2
        
        // Start render loop
        animate()
        
        console.log('✅ Three.js initialization completed')
        
      } catch (err) {
        console.error('❌ Failed to initialize Three.js:', err)
        error.value = `Failed to initialize 3D renderer: ${err.message}`
      }
    }
    
    const animate = () => {
      if (!renderer.value || !scene.value || !camera.value) return
      
      requestAnimationFrame(animate)
      
      // Update controls
      if (controls.value) {
        controls.value.update()
      }
      
      renderer.value.render(scene.value, camera.value)
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
    
    // Lifecycle
    onMounted(async () => {
      console.log('🎯 Editor: Component mounted!');
      console.log('🎯 Editor: Props modelId:', props.modelId);
      console.log('🎯 Editor: Route params:', route.params);
      
      await loadModel()
    })
    
    onUnmounted(() => {
      console.log('🧹 Editor: Component unmounted, cleaning up...')
      
      // Cleanup Three.js resources
      if (controls.value) {
        controls.value.dispose()
      }
      
      if (renderer.value) {
        renderer.value.dispose()
        if (threeContainer.value && renderer.value.domElement) {
          threeContainer.value.removeChild(renderer.value.domElement)
        }
      }
      
      if (scene.value) {
        // Dispose of all geometries and materials
        scene.value.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }
    })
    
    return {
      isLoading,
      error,
      currentModel,
      isExporting,
      threeContainer,
      exportModel,
      clearError
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
  background: #2d2d2d;
  border-bottom: 1px solid #444;
  min-height: 48px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-name {
  font-weight: bold;
  color: #fff;
}

.btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #45a049;
}

.btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.btn-secondary {
  background: #666;
}

.btn-secondary:hover {
  background: #777;
}

.debug-info {
  padding: 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
}

.debug-info p {
  margin: 4px 0;
  font-family: monospace;
  font-size: 12px;
  color: #ccc;
}

.viewport-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  background: #111;
}

.error-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #f44336;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 1001;
}
</style>
