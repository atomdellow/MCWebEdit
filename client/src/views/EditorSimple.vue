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
      <h1>Editor Working!</h1>
      <p>Model ID: {{ modelId }}</p>
      <p>Model loaded: {{ currentModel?.name || 'None' }}</p>
      <button @click="$router.push('/')" class="btn">← Back to Home</button>
    </div>
    
    <!-- Error Toast -->
    <div v-if="error" class="error-toast" @click="clearError">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useVoxelStore } from '@/stores/voxelStore'
import apiService from '@/services/apiService'

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
        
      } catch (err) {
        console.error('❌ Failed to load model:', err)
        error.value = `Failed to load model: ${err.message}`
      } finally {
        console.log('🏁 Setting isLoading to false')
        isLoading.value = false
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
    
    return {
      isLoading,
      error,
      currentModel,
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
  padding: 20px;
}

.btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
  width: fit-content;
}

.btn:hover {
  background: #45a049;
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
