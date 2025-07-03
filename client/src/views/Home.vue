<template>
  <div class="home-container">
    <header class="header">
      <h1>🧱 MC Web Edit</h1>
      <p>Collaborative Voxel Editor for Minecraft</p>
    </header>
    
    <main class="main-content">
      <div class="actions-grid">
        <!-- Create New Model -->
        <div class="action-card">
          <h3>🎨 Create New Model</h3>
          <p>Start with an empty voxel space</p>
          <button @click="showCreateModal = true" class="btn">
            Create New
          </button>
        </div>
        
        <!-- Upload Schematic -->
        <div class="action-card">
          <h3>📁 Import Schematic</h3>
          <p>Upload WorldEdit .schem or .schematic files</p>
          <input
            ref="fileInput"
            type="file"
            accept=".schem,.schematic"
            @change="handleFileSelect"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="btn">
            Choose File
          </button>
        </div>
        
        <!-- Recent Models -->
        <div class="action-card models-list">
          <h3>📋 Recent Models</h3>
          <div v-if="isLoadingModels" class="loading-text">
            Loading models...
          </div>
          <div v-else-if="models.length === 0" class="empty-text">
            No models found
          </div>
          <div v-else class="models-grid">
            <div 
              v-for="model in models" 
              :key="model.id"
              class="model-item"
              @click="openEditor(model.id)"
            >
              <div class="model-name">{{ model.name }}</div>
              <div class="model-info">
                {{ model.dimensions.width }}×{{ model.dimensions.height }}×{{ model.dimensions.length }}
                <br>
                {{ model.totalBlocks }} blocks
              </div>
              <div class="model-date">
                {{ formatDate(model.lastModified) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Create Model Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal" @click.stop>
        <h2>Create New Model</h2>
        <form @submit.prevent="createNewModel">
          <div class="form-group">
            <label>Name:</label>
            <input 
              v-model="newModel.name" 
              class="input" 
              placeholder="My Awesome Build"
              required
            />
          </div>
          
          <div class="form-group">
            <label>Description:</label>
            <textarea 
              v-model="newModel.description" 
              class="input" 
              rows="3"
              placeholder="Optional description..."
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Width:</label>
              <input 
                v-model.number="newModel.width" 
                type="number" 
                class="input" 
                min="1" 
                max="256"
                required
              />
            </div>
            <div class="form-group">
              <label>Height:</label>
              <input 
                v-model.number="newModel.height" 
                type="number" 
                class="input" 
                min="1" 
                max="256"
                required
              />
            </div>
            <div class="form-group">
              <label>Length:</label>
              <input 
                v-model.number="newModel.length" 
                type="number" 
                class="input" 
                min="1" 
                max="256"
                required
              />
            </div>
          </div>
          
          <div class="flex gap-8 justify-end mt-16">
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn" :disabled="isCreating">
              {{ isCreating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal" @click.stop>
        <h2>Import Schematic</h2>
        <form @submit.prevent="uploadSchematic">
          <div class="form-group">
            <label>File:</label>
            <div class="file-info">
              {{ selectedFile?.name || 'No file selected' }}
            </div>
          </div>
          
          <div class="form-group">
            <label>Name (optional):</label>
            <input 
              v-model="uploadForm.name" 
              class="input" 
              :placeholder="selectedFile?.name || 'Model name'"
            />
          </div>
          
          <div class="form-group">
            <label>Description (optional):</label>
            <textarea 
              v-model="uploadForm.description" 
              class="input" 
              rows="3"
              placeholder="Description of the schematic..."
            ></textarea>
          </div>
          
          <div class="flex gap-8 justify-end mt-16">
            <button type="button" @click="closeUploadModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn" :disabled="isUploading || !selectedFile">
              {{ isUploading ? 'Importing...' : 'Import' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Error Toast -->
    <div v-if="error" class="error-toast" @click="error = null">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '@/services/apiService'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    
    // State
    const models = ref([])
    const isLoadingModels = ref(false)
    const error = ref(null)
    
    // Create model modal
    const showCreateModal = ref(false)
    const isCreating = ref(false)
    const newModel = ref({
      name: '',
      description: '',
      width: 32,
      height: 32,
      length: 32
    })
    
    // Upload modal
    const showUploadModal = ref(false)
    const isUploading = ref(false)
    const selectedFile = ref(null)
    const uploadForm = ref({
      name: '',
      description: ''
    })
    
    // Methods
    const loadModels = async () => {
      try {
        isLoadingModels.value = true
        const response = await apiService.getModels(1, 20)
        models.value = response.models
      } catch (err) {
        error.value = `Failed to load models: ${err.message}`
      } finally {
        isLoadingModels.value = false
      }
    }
    
    const createNewModel = async () => {
      try {
        isCreating.value = true
        const response = await apiService.createEmptyModel(
          newModel.value.name,
          newModel.value.description,
          newModel.value.width,
          newModel.value.height,
          newModel.value.length
        )
        
        // Navigate to editor
        router.push(`/editor/${response.modelId}`)
      } catch (err) {
        error.value = `Failed to create model: ${err.message}`
      } finally {
        isCreating.value = false
      }
    }
    
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
        uploadForm.value.name = file.name.replace(/\.(schem|schematic)$/i, '')
        showUploadModal.value = true
      }
    }
    
    const uploadSchematic = async () => {
      try {
        isUploading.value = true
        const response = await apiService.uploadSchematic(
          selectedFile.value,
          uploadForm.value.name,
          uploadForm.value.description
        )
        
        // Navigate to editor
        router.push(`/editor/${response.modelId}`)
      } catch (err) {
        error.value = `Failed to import schematic: ${err.message}`
      } finally {
        isUploading.value = false
      }
    }
    
    const openEditor = (modelId) => {
      router.push(`/editor/${modelId}`)
    }
    
    const closeCreateModal = () => {
      showCreateModal.value = false
      newModel.value = {
        name: '',
        description: '',
        width: 32,
        height: 32,
        length: 32
      }
    }
    
    const closeUploadModal = () => {
      showUploadModal.value = false
      selectedFile.value = null
      uploadForm.value = {
        name: '',
        description: ''
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }
    
    // Lifecycle
    onMounted(() => {
      loadModels()
    })
    
    return {
      models,
      isLoadingModels,
      error,
      showCreateModal,
      isCreating,
      newModel,
      showUploadModal,
      isUploading,
      selectedFile,
      uploadForm,
      createNewModel,
      handleFileSelect,
      uploadSchematic,
      openEditor,
      closeCreateModal,
      closeUploadModal,
      formatDate
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 24px;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.header h1 {
  font-size: 3rem;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #4CAF50, #2196F3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  font-size: 1.2rem;
  color: #ccc;
  margin: 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.2s, background-color 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.action-card h3 {
  margin: 0 0 12px 0;
  font-size: 1.4rem;
}

.action-card p {
  color: #ccc;
  margin: 0 0 20px 0;
}

.models-list {
  text-align: left;
}

.models-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.model-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.model-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.model-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #4CAF50;
}

.model-info {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 8px;
}

.model-date {
  font-size: 0.8rem;
  color: #888;
}

.loading-text, .empty-text {
  text-align: center;
  color: #888;
  padding: 24px;
  font-style: italic;
}

.file-info {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px 12px;
  color: #ccc;
  font-family: monospace;
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

textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
