// Example usage of the enhanced block texture system for 3D rendering

import { 
  getBlockRenderProperties, 
  getBlockFaceTexture, 
  getBlockTextureSet,
  createBlockMaterial,
  shouldCullBlockFace 
} from '@/utils/blockTypes'

// Example: Creating a textured cube for a grass block
function createTexturedBlockMesh(blockType, position = { x: 0, y: 0, z: 0 }) {
  const renderProps = getBlockRenderProperties(blockType)
  const textureSet = getBlockTextureSet(blockType)
  
  console.log(`Creating ${renderProps.name} block at position:`, position)
  console.log('Render properties:', renderProps)
  console.log('Texture set:', textureSet)
  
  // Example Three.js cube creation (pseudo-code)
  /*
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  
  // Create materials for each face
  const materials = [
    new THREE.MeshLambertMaterial({ map: textureLoader.load(textureSet.east) }),  // Right
    new THREE.MeshLambertMaterial({ map: textureLoader.load(textureSet.west) }),  // Left
    new THREE.MeshLambertMaterial({ map: textureLoader.load(textureSet.top) }),   // Top
    new THREE.MeshLambertMaterial({ map: textureLoader.load(textureSet.bottom) }),// Bottom
    new THREE.MeshLambertMaterial({ map: textureLoader.load(textureSet.north) }), // Front
    new THREE.MeshLambertMaterial({ map: textureLoader.load(textureSet.south) })  // Back
  ]
  
  const mesh = new THREE.Mesh(geometry, materials)
  mesh.position.set(position.x, position.y, position.z)
  mesh.castShadow = renderProps.castShadows
  mesh.receiveShadow = renderProps.receiveShadows
  
  return mesh
  */
  
  return {
    type: blockType,
    position,
    renderProps,
    textureSet
  }
}

// Example: Building a simple structure with multi-face textures
function createSampleStructure() {
  const blocks = []
  
  // Create a grass base
  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 3; z++) {
      blocks.push(createTexturedBlockMesh('minecraft:grass_block', { x, y: 0, z }))
    }
  }
  
  // Add a oak log pillar
  blocks.push(createTexturedBlockMesh('minecraft:oak_log', { x: 1, y: 1, z: 1 }))
  blocks.push(createTexturedBlockMesh('minecraft:oak_log', { x: 1, y: 2, z: 1 }))
  
  // Add oak planks on top
  blocks.push(createTexturedBlockMesh('minecraft:oak_planks', { x: 1, y: 3, z: 1 }))
  
  return blocks
}

// Example: Face culling optimization
function optimizeBlockFaces(blocks) {
  return blocks.map(block => {
    const { type, position } = block
    const optimizedFaces = {}
    
    // Check each face
    const faces = ['top', 'bottom', 'north', 'south', 'east', 'west']
    faces.forEach(face => {
      // Find neighbor position
      const neighborPos = { ...position }
      switch (face) {
        case 'top': neighborPos.y += 1; break
        case 'bottom': neighborPos.y -= 1; break
        case 'north': neighborPos.z -= 1; break
        case 'south': neighborPos.z += 1; break
        case 'east': neighborPos.x += 1; break
        case 'west': neighborPos.x -= 1; break
      }
      
      // Find neighbor block
      const neighbor = blocks.find(b => 
        b.position.x === neighborPos.x && 
        b.position.y === neighborPos.y && 
        b.position.z === neighborPos.z
      )
      
      const neighborType = neighbor ? neighbor.type : 'minecraft:air'
      const shouldCull = shouldCullBlockFace(type, face, neighborType)
      
      optimizedFaces[face] = {
        visible: !shouldCull,
        texture: getBlockFaceTexture(type, face),
        neighbor: neighborType
      }
    })
    
    return {
      ...block,
      faces: optimizedFaces
    }
  })
}

// Demo usage
console.log('=== MCWebEdit Block Texture System Demo ===')

// Test individual block textures
console.log('\n1. Grass Block Textures:')
const grassTextures = getBlockTextureSet('minecraft:grass_block')
console.log(grassTextures)

console.log('\n2. Oak Log Textures:')
const logTextures = getBlockTextureSet('minecraft:oak_log')
console.log(logTextures)

console.log('\n3. Stone Textures:')
const stoneTextures = getBlockTextureSet('minecraft:stone')
console.log(stoneTextures)

// Test structure creation
console.log('\n4. Creating Sample Structure:')
const structure = createSampleStructure()
console.log(`Created ${structure.length} blocks`)

// Test face culling
console.log('\n5. Optimizing Faces:')
const optimized = optimizeBlockFaces(structure)
optimized.forEach((block, i) => {
  const visibleFaces = Object.values(block.faces).filter(f => f.visible).length
  console.log(`Block ${i} (${block.type}): ${visibleFaces}/6 faces visible`)
})

export { createTexturedBlockMesh, createSampleStructure, optimizeBlockFaces }
