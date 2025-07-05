# 🎨 MCWebEdit Texture System

This document describes the enhanced block texture system implemented in MCWebEdit, which provides realistic Minecraft block rendering with proper multi-face texture support.

## 🚀 Features

- **1,164 Authentic Minecraft Textures**: Downloaded from the official Minecraft Wiki
- **Multi-Face Support**: Blocks like grass, logs, and quartz blocks have different textures for top/side/bottom faces
- **Smart Fallbacks**: Automatic fallback to colors when textures aren't available
- **3D Rendering Ready**: Comprehensive API for Three.js integration
- **Face Culling Optimization**: Performance optimization by hiding occluded faces
- **Block Palette Integration**: Visual preview with texture indicators

## 📁 File Structure

```
client/
├── public/assets/textures/blocks/    # 1,164 block texture PNGs
├── src/utils/blockTypes.js           # Enhanced texture system
├── src/components/BlockPalette.vue   # Texture-aware block palette
└── src/examples/textureSystemDemo.js # Usage examples
```

## 🧩 Core Components

### Block Texture Mappings

The `BLOCK_TEXTURE_MAPPINGS` object in `blockTypes.js` defines how blocks map to textures:

```javascript
'minecraft:grass_block': {
  top: 'grasstop',      // Grass texture on top
  side: 'grassside',    // Grass side texture  
  bottom: 'dirt'        // Dirt texture on bottom
},
'minecraft:oak_log': {
  top: 'oak_log_topbottom',    // Wood rings on top/bottom
  side: 'oak_log',             // Bark texture on sides
  bottom: 'oak_log_topbottom'
},
'minecraft:stone': 'stone'     // Single texture for all faces
```

### Key Functions

#### `getBlockTexture(blockType, face)`
Gets the texture URL for a specific face of a block.

```javascript
getBlockTexture('minecraft:grass_block', 'top')    // → '/assets/textures/blocks/grasstop.png'
getBlockTexture('minecraft:grass_block', 'side')   // → '/assets/textures/blocks/grassside.png'
getBlockTexture('minecraft:grass_block', 'bottom') // → '/assets/textures/blocks/dirt.png'
```

#### `getBlockTextureSet(blockType)`
Gets all textures for a block as a complete set for 3D rendering.

```javascript
const textures = getBlockTextureSet('minecraft:grass_block')
// Returns: { top: '...', side: '...', bottom: '...', north: '...', south: '...', east: '...', west: '...' }
```

#### `getBlockRenderProperties(blockType)`
Gets comprehensive rendering properties including textures, materials, and optimization flags.

```javascript
const props = getBlockRenderProperties('minecraft:grass_block')
// Returns complete configuration for 3D rendering
```

## 🎯 Block Palette Integration

The `BlockPalette.vue` component now shows:

- **Actual block textures** instead of solid colors
- **Multi-face indicators** (⚡) for blocks with different top/side/bottom textures  
- **Smart tooltips** describing texture configuration
- **Fallback colors** when textures fail to load

## 🔧 3D Rendering Integration

### Basic Usage

```javascript
import { getBlockTextureSet, getBlockRenderProperties } from '@/utils/blockTypes'

// Get textures for a block
const textures = getBlockTextureSet('minecraft:grass_block')

// Create Three.js materials
const materials = [
  new THREE.MeshLambertMaterial({ map: textureLoader.load(textures.east) }),
  new THREE.MeshLambertMaterial({ map: textureLoader.load(textures.west) }),
  new THREE.MeshLambertMaterial({ map: textureLoader.load(textures.top) }),
  new THREE.MeshLambertMaterial({ map: textureLoader.load(textures.bottom) }),
  new THREE.MeshLambertMaterial({ map: textureLoader.load(textures.north) }),
  new THREE.MeshLambertMaterial({ map: textureLoader.load(textures.south) })
]

const cube = new THREE.Mesh(geometry, materials)
```

### Face Culling Optimization

```javascript
import { shouldCullBlockFace } from '@/utils/blockTypes'

// Check if a face should be hidden due to adjacent blocks
const shouldHide = shouldCullBlockFace(
  'minecraft:stone',        // Current block
  'top',                   // Face being checked
  'minecraft:grass_block'  // Adjacent block
)
```

## 📦 Block Categories

Blocks are organized into categories with texture support:

- **Building**: Stone, wood planks, bricks, glass
- **Natural**: Grass, dirt, logs, leaves, sand, gravel
- **Ores**: Coal, iron, gold, diamond, emerald, redstone, lapis
- **Wool**: All 16 wool colors
- **Utility**: Air (eraser tool)

## 🎨 Multi-Face Blocks

The following blocks have different textures on different faces:

### Grass-like Blocks
- `minecraft:grass_block`: Grass top, grass sides, dirt bottom
- `minecraft:podzol`: Podzol top, podzol sides, dirt bottom

### Wood Logs  
- All log types: Ring texture on top/bottom, bark on sides
- `minecraft:oak_log`, `minecraft:spruce_log`, etc.
- Stripped variants also supported

### Directional Blocks
- `minecraft:quartz_block`: Different top/bottom vs. sides
- `minecraft:hay_block`: Rotated texture on different faces
- `minecraft:bone_block`: Bone pattern orientation
- `minecraft:deepslate`: Layered texture orientation

## 🚀 Performance Features

- **Texture Caching**: Reused texture URLs prevent duplicate loading
- **Face Culling**: Hidden faces aren't rendered for performance
- **Fallback System**: Graceful degradation when textures are missing
- **Optimized Lookups**: Fast block type to texture mapping

## 🔄 Future Enhancements

- **Animated Textures**: Support for water, lava animation
- **Connected Textures**: For seamless glass, stone textures
- **Seasonal Variants**: Different textures based on biome/season
- **Texture Packs**: Support for custom texture pack loading
- **Block States**: Different textures for block orientations/states

## 🛠️ Development

### Adding New Blocks

1. Add the block definition to `BLOCK_TYPES`
2. Add texture mapping to `BLOCK_TEXTURE_MAPPINGS`
3. Add to appropriate category in `BLOCK_CATEGORIES`
4. Download texture files to `/public/assets/textures/blocks/`

### Testing Textures

Visit `/texture-test.html` to see a visual demonstration of the multi-face texture system.

## 📸 Examples

### Single-Face Block (Stone)
```
[Stone Texture] → All faces use stone.png
```

### Multi-Face Block (Grass)
```
Top:    [Grass Texture] → grasstop.png
Sides:  [Grass Side]    → grassside.png  
Bottom: [Dirt Texture]  → dirt.png
```

### Directional Block (Oak Log)
```
Top/Bottom: [Wood Rings] → oak_log_topbottom.png
Sides:      [Bark]       → oak_log.png
```

This system provides the foundation for realistic Minecraft-style block rendering with proper face textures, making the MCWebEdit experience visually authentic and engaging! 🎮✨
