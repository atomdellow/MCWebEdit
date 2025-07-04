<template>
  <div class="block-palette">
    <div class="palette-header">
      <h3>Block Palette</h3>
      <input 
        v-model="searchQuery" 
        class="search-input" 
        placeholder="Search blocks..."
      />
    </div>
    
    <div class="palette-content">
      <div 
        v-for="(blocks, category) in filteredCategories" 
        :key="category"
        class="category-section"
      >
        <div class="category-header" @click="toggleCategory(category)">
          <span class="category-toggle">{{ expandedCategories.has(category) ? '▼' : '▶' }}</span>
          <span class="category-name">{{ category }}</span>
        </div>
        
        <div v-if="expandedCategories.has(category)" class="block-grid">
          <div 
            v-for="blockType in blocks" 
            :key="blockType"
            @click="selectBlock(blockType)"
            :class="['block-item', { selected: selectedBlockType === blockType }]"
            :title="getBlockName(blockType)"
          >
            <div 
              class="block-preview" 
              :style="{ backgroundColor: getBlockColorHex(blockType) }"
            ></div>
            <div class="block-name">{{ getBlockName(blockType) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { BLOCK_CATEGORIES, getBlockName, getBlockColor } from '@/utils/blockTypes'

export default {
  name: 'BlockPalette',
  props: {
    selectedBlockType: {
      type: String,
      default: 'minecraft:stone'
    }
  },
  emits: ['select-block'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const expandedCategories = ref(new Set(['Building']))
    
    const filteredCategories = computed(() => {
      const query = searchQuery.value.toLowerCase()
      const filtered = {}
      
      Object.entries(BLOCK_CATEGORIES).forEach(([category, blocks]) => {
        const filteredBlocks = blocks.filter(blockType => {
          const name = getBlockName(blockType).toLowerCase()
          return name.includes(query) || blockType.includes(query)
        })
        
        if (filteredBlocks.length > 0) {
          filtered[category] = filteredBlocks
        }
      })
      
      return filtered
    })
    
    const toggleCategory = (category) => {
      if (expandedCategories.value.has(category)) {
        expandedCategories.value.delete(category)
      } else {
        expandedCategories.value.add(category)
      }
    }
    
    const selectBlock = (blockType) => {
      console.log(`🎨 BlockPalette: selectBlock called with ${blockType}`)
      console.log(`🎨 BlockPalette: current selectedBlockType prop is ${props.selectedBlockType}`)
      emit('select-block', blockType)
    }
    
    const getBlockColorHex = (blockType) => {
      const color = getBlockColor(blockType)
      return `#${color.toString(16).padStart(6, '0')}`
    }
    
    onMounted(() => {
      // Expand all categories by default
      Object.keys(BLOCK_CATEGORIES).forEach(category => {
        expandedCategories.value.add(category)
      })
    })
    
    return {
      searchQuery,
      expandedCategories,
      filteredCategories,
      toggleCategory,
      selectBlock,
      getBlockName,
      getBlockColorHex
    }
  }
}
</script>

<style scoped>
.block-palette {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.palette-header {
  margin-bottom: 16px;
}

.palette-header h3 {
  margin: 0 0 12px 0;
  color: #4CAF50;
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.palette-content {
  flex: 1;
  overflow-y: auto;
}

.category-section {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  color: #ccc;
  transition: color 0.2s;
}

.category-header:hover {
  color: #4CAF50;
}

.category-toggle {
  font-size: 0.8rem;
  color: #888;
}

.block-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding: 8px 0;
}

.block-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
}

.block-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(76, 175, 80, 0.5);
}

.block-item.selected {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
}

.block-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-bottom: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.block-preview::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%);
  border-radius: 2px;
  pointer-events: none;
}

.block-name {
  font-size: 0.75rem;
  text-align: center;
  color: #ccc;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Scrollbar styling */
.palette-content::-webkit-scrollbar {
  width: 6px;
}

.palette-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.palette-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.palette-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
