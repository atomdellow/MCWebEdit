import * as THREE from 'three'
import { getBlockColor, isTransparent } from './blockTypes'
import { toRaw } from 'vue'

export default class VoxelRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.voxelStore = null
    this.modelDimensions = { width: 16, height: 16, length: 16 } // Non-reactive copy
    
    // Three.js objects - completely isolated from Vue
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      antialias: true,
      alpha: true
    })
    
    // Controls and interaction
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.isMouseDown = false
    this.lastMousePosition = { x: 0, y: 0 }
    this.lastHighlightedPosition = null
    this.lastHoverCheck = 0
    
    // Camera controls (RTS-style)
    this.cameraDistance = 30
    this.cameraAngleX = Math.PI / 4 // 45 degrees
    this.cameraAngleY = Math.PI / 4 // 45 degrees
    this.cameraTarget = new THREE.Vector3(25, 25, 25) // Center on the build area
    
    // Voxel objects
    this.voxelGroup = new THREE.Group()
    this.voxelMeshes = new Map() // "x,y,z" -> mesh
    this.highlightMesh = null
    
    // Materials
    this.materials = new Map()
    this.wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x666666 })
    
    // Event callbacks
    this.onBlockHover = null
    this.onBlockClick = null
    this.onCameraMove = null
    
    this.init()
  }
  
  init() {
    // Setup renderer
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(0x1a1a1a, 1)
    
    // Setup scene
    this.scene.background = new THREE.Color(0x1a1a1a)
    this.scene.add(this.voxelGroup)
    
    // Setup lighting
    this.setupLighting()
    
    // Setup camera
    this.updateCameraPosition()
    
    // Setup highlight mesh
    this.createHighlightMesh()
    
    // Add a test cube to verify rendering is working
    this.addTestCube()
    
    // Note: Ground plane will be created when voxelStore is set
    
    // Add event listeners
    this.addEventListeners()
    
    // Initial resize
    this.handleResize()
  }
  
  setupLighting() {
    // Brighter ambient light to ensure everything is visible
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
    this.scene.add(ambientLight)
    
    // Directional light (sun) - positioned relative to model center
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(25, 50, 25) // Center the light over the build area
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 200
    directionalLight.shadow.camera.left = -50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.bottom = -50
    this.scene.add(directionalLight)
    
    // Multiple point lights for better coverage
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 100)
    pointLight1.position.set(15, 40, 15)
    this.scene.add(pointLight1)
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.6, 100)
    pointLight2.position.set(35, 40, 35)
    this.scene.add(pointLight2)
    
    const pointLight3 = new THREE.PointLight(0xffffff, 0.6, 100)
    pointLight3.position.set(15, 40, 35)
    this.scene.add(pointLight3)
    
    console.log('💡 Lighting setup complete - ambient + directional + 3 point lights')
  }
  
  createHighlightMesh() {
    const geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    this.highlightMesh = new THREE.Mesh(geometry, material)
    this.highlightMesh.visible = false
    this.scene.add(this.highlightMesh)
  }
  
  createGroundPlane() {
    if (!this.modelDimensions) return
    
    const dims = this.modelDimensions
    
    // Clear previous ground plane and grid if they exist
    if (this.groundPlane) {
      this.scene.remove(this.groundPlane)
    }
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper)
    }
    if (this.buildArea) {
      this.scene.remove(this.buildArea)
    }
    
    // Create ground plane
    const geometry = new THREE.PlaneGeometry(dims.width, dims.length)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.1,
      side: THREE.DoubleSide
    })
    
    this.groundPlane = new THREE.Mesh(geometry, material)
    this.groundPlane.rotation.x = -Math.PI / 2
    this.groundPlane.position.set(dims.width / 2 - 0.5, -0.01, dims.length / 2 - 0.5)
    this.scene.add(this.groundPlane)
    
    // Add grid helper
    this.gridHelper = new THREE.GridHelper(
      Math.max(dims.width, dims.length), 
      Math.max(dims.width, dims.length),
      0x444444, 
      0x222222
    )
    this.gridHelper.position.set(dims.width / 2 - 0.5, 0, dims.length / 2 - 0.5)
    this.scene.add(this.gridHelper)
    
    // Add build area wireframe
    const buildGeometry = new THREE.BoxGeometry(dims.width, dims.height, dims.length)
    const buildMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4CAF50, 
      transparent: true, 
      opacity: 0.1,
      wireframe: false
    })
    
    // Create edges for the build area
    const edges = new THREE.EdgesGeometry(buildGeometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4CAF50, linewidth: 2 })
    this.buildArea = new THREE.LineSegments(edges, lineMaterial)
    this.buildArea.position.set(dims.width / 2 - 0.5, dims.height / 2 - 0.5, dims.length / 2 - 0.5)
    this.scene.add(this.buildArea)
    
    console.log('🏗️ Build area created:', dims)
  }
  
  getMaterial(blockType) {
    if (this.materials.has(blockType)) {
      return this.materials.get(blockType)
    }
    
    const color = getBlockColor(blockType)
    const transparent = isTransparent(blockType)
    
    const material = new THREE.MeshLambertMaterial({ 
      color: color,
      transparent: transparent,
      opacity: transparent ? 0.7 : 1.0
    })
    
    this.materials.set(blockType, material)
    return material
  }
  
  addEventListeners() {
    // Mouse events for camera control and block interaction
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('wheel', this.onWheel.bind(this))
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    
    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown.bind(this))
  }
  
  onMouseDown(event) {
    this.isMouseDown = true
    this.lastMousePosition = { x: event.clientX, y: event.clientY }
    
    // Handle block clicking
    if (event.button === 0 || event.button === 2) { // Left or right click
      this.updateMousePosition(event)
      this.handleBlockInteraction(event.button === 2) // true for right click
    }
  }
  
  onMouseMove(event) {
    this.updateMousePosition(event)
    
    if (this.isMouseDown && (event.buttons & 1)) { // Left mouse button held
      // Camera rotation
      const deltaX = event.clientX - this.lastMousePosition.x
      const deltaY = event.clientY - this.lastMousePosition.y
      
      this.cameraAngleY -= deltaX * 0.01
      this.cameraAngleX = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraAngleX + deltaY * 0.01))
      
      this.updateCameraPosition()
      this.lastMousePosition = { x: event.clientX, y: event.clientY }
    } else {
      // Block hovering - only call occasionally to avoid spam
      if (!this.lastHoverCheck || Date.now() - this.lastHoverCheck > 100) {
        this.handleBlockHover()
        this.lastHoverCheck = Date.now()
      }
    }
  }
  
  onMouseUp(event) {
    this.isMouseDown = false
  }
  
  onWheel(event) {
    event.preventDefault()
    this.cameraDistance = Math.max(5, Math.min(100, this.cameraDistance + event.deltaY * 0.01))
    this.updateCameraPosition()
  }
  
  onKeyDown(event) {
    const moveSpeed = 2
    
    switch(event.key) {
      case 'w':
      case 'W':
        this.cameraTarget.z -= moveSpeed
        break
      case 's':
      case 'S':
        this.cameraTarget.z += moveSpeed
        break
      case 'a':
      case 'A':
        this.cameraTarget.x -= moveSpeed
        break
      case 'd':
      case 'D':
        this.cameraTarget.x += moveSpeed
        break
      case 'q':
      case 'Q':
        this.cameraTarget.y -= moveSpeed
        break
      case 'e':
      case 'E':
        this.cameraTarget.y += moveSpeed
        break
    }
    
    this.updateCameraPosition()
  }
  
  updateMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }
  
  updateCameraPosition() {
    const x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraAngleX) * Math.cos(this.cameraAngleY)
    const y = this.cameraTarget.y + this.cameraDistance * Math.cos(this.cameraAngleX)
    const z = this.cameraTarget.z + this.cameraDistance * Math.sin(this.cameraAngleX) * Math.sin(this.cameraAngleY)
    
    this.camera.position.set(x, y, z)
    this.camera.lookAt(this.cameraTarget)
    
    if (this.onCameraMove) {
      // Create completely new, non-reactive objects for position data
      const positionData = {
        x: x,
        y: y,
        z: z
      }
      const targetData = {
        x: this.cameraTarget.x,
        y: this.cameraTarget.y,
        z: this.cameraTarget.z
      }
      this.onCameraMove(positionData, targetData)
    }
  }
  
  handleBlockHover() {
    if (!this.modelDimensions) {
      console.log('🚫 handleBlockHover: No modelDimensions')
      return
    }
    
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    const dims = this.modelDimensions
    console.log('🔍 Model dimensions for hover:', dims)
    console.log('🎯 Camera position:', this.camera.position)
    console.log('🎯 Camera target:', this.cameraTarget)
    console.log('🖱️ Mouse position:', this.mouse)
    
    // Create invisible collision boxes for all possible positions
    const intersects = []
    
    // Test with a smaller range first to see if raycast works at all
    const testRange = 10
    const centerX = Math.floor(dims.width / 2)
    const centerY = Math.floor(dims.height / 2) 
    const centerZ = Math.floor(dims.length / 2)
    
    console.log('🎯 Testing around center:', { centerX, centerY, centerZ })
    
    // Raycast against existing blocks and empty spaces in a smaller area around center
    for (let x = Math.max(0, centerX - testRange); x < Math.min(dims.width, centerX + testRange); x++) {
      for (let y = Math.max(0, centerY - testRange); y < Math.min(dims.height, centerY + testRange); y++) {
        for (let z = Math.max(0, centerZ - testRange); z < Math.min(dims.length, centerZ + testRange); z++) {
          const box = new THREE.Box3(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x + 1, y + 1, z + 1)
          )
          
          const ray = this.raycaster.ray
          const intersection = ray.intersectBox(box, new THREE.Vector3())
          
          if (intersection) {
            intersects.push({
              point: intersection,
              position: { x, y, z },
              distance: ray.origin.distanceTo(intersection)
            })
          }
        }
      }
    }
    
    console.log('🎯 Found intersections:', intersects.length)
    
    if (intersects.length > 0) {
      // Sort by distance and take the closest
      intersects.sort((a, b) => a.distance - b.distance)
      const closest = intersects[0]
      
      console.log('🎯 Closest intersection:', closest)
      
      this.highlightMesh.position.set(
        closest.position.x + 0.5,
        closest.position.y + 0.5,
        closest.position.z + 0.5
      )
      this.highlightMesh.visible = true
      
      // Only log if we just started highlighting a new position
      if (!this.lastHighlightedPosition || 
          this.lastHighlightedPosition.x !== closest.position.x ||
          this.lastHighlightedPosition.y !== closest.position.y ||
          this.lastHighlightedPosition.z !== closest.position.z) {
        console.log('🎯 Highlighting block at:', closest.position)
        this.lastHighlightedPosition = closest.position
      }
      
      if (this.onBlockHover) {
        // Create completely new, non-reactive position object
        const hoverPosition = {
          x: closest.position.x,
          y: closest.position.y,
          z: closest.position.z
        }
        this.onBlockHover(hoverPosition)
      }
    } else {
      this.highlightMesh.visible = false
      if (this.lastHighlightedPosition) {
        console.log('🚫 No longer highlighting any block')
        this.lastHighlightedPosition = null
      }
      if (this.onBlockHover) {
        this.onBlockHover(null)
      }
    }
  }
  
  handleBlockInteraction(isRightClick) {
    console.log('🖱️ VoxelRenderer.handleBlockInteraction called')
    console.log('🔍 highlightMesh.visible:', this.highlightMesh.visible)
    console.log('📍 highlightMesh.position:', this.highlightMesh.position)
    
    if (!this.highlightMesh.visible) {
      console.log('❌ No highlight mesh visible, cannot place block')
      return
    }
    
    // Create completely new, non-reactive position object
    const position = {
      x: Math.floor(this.highlightMesh.position.x),
      y: Math.floor(this.highlightMesh.position.y),
      z: Math.floor(this.highlightMesh.position.z)
    }
    
    console.log('🎯 Block interaction at:', position, 'isRightClick:', isRightClick)
    
    if (this.onBlockClick) {
      this.onBlockClick(position, isRightClick)
    } else {
      console.log('❌ No onBlockClick handler set!')
    }
  }
  
  setVoxelStore(store) {
    // Use toRaw to completely remove reactivity
    this.voxelStore = toRaw(store)
    
    console.log('🔍 Raw store received:', this.voxelStore)
    console.log('🔍 Store modelDimensions property:', this.voxelStore.modelDimensions)
    
    // Create completely non-reactive copy of dimensions
    const rawDims = toRaw(store.modelDimensions)
    console.log('🔍 Raw dimensions:', rawDims)
    
    // Provide fallback values if dimensions are undefined
    this.modelDimensions = {
      width: rawDims?.width || 50,
      height: rawDims?.height || 50, 
      length: rawDims?.length || 50
    }
    
    console.log('🔍 Final model dimensions set to:', this.modelDimensions)
    
    // Create ground plane now that we have dimensions
    this.createGroundPlane()
    
    // Update camera target to center of build area  
    this.cameraTarget.set(
      this.modelDimensions.width / 2, 
      this.modelDimensions.height / 2, 
      this.modelDimensions.length / 2
    )
    this.updateCameraPosition()
    
    console.log('📷 Camera centered on build area:', this.cameraTarget)
    console.log('🏗️ Model dimensions:', this.modelDimensions)
    
    this.updateVoxels()
    
    // Now start render loop with raw data
    this.startActualRenderLoop()
  }
  
  updateDimensions(newDimensions) {
    this.modelDimensions = {
      width: newDimensions.width,
      height: newDimensions.height,
      length: newDimensions.length
    }
    
    // Recreate ground plane with new dimensions
    this.createGroundPlane()
    
    // Update camera target
    this.cameraTarget.set(
      this.modelDimensions.width / 2,
      this.modelDimensions.height / 2, 
      this.modelDimensions.length / 2
    )
    this.updateCameraPosition()
  }
  
  updateVoxels() {
    if (!this.voxelStore) return
    
    // Clear existing voxel meshes
    this.voxelGroup.clear()
    this.voxelMeshes.clear()
    
    // Get completely raw, non-reactive blocks array
    const rawStore = toRaw(this.voxelStore)
    const blocksArray = rawStore.getBlocksArray()
    const blocks = blocksArray.map(block => {
      const rawBlock = toRaw(block)
      return {
        x: rawBlock.x,
        y: rawBlock.y, 
        z: rawBlock.z,
        blockType: rawBlock.blockType,
        blockData: rawBlock.blockData || 0,
        properties: rawBlock.properties || {}
      }
    })
    
    blocks.forEach(block => {
      if (block.blockType !== 'minecraft:air') {
        this.addVoxel(block.x, block.y, block.z, block.blockType)
      }
    })
  }
  
  addVoxel(x, y, z, blockType) {
    const key = `${x},${y},${z}`
    
    console.log(`🟡 VoxelRenderer.addVoxel called: (${x},${y},${z}) type: ${blockType}`)
    
    // Remove existing voxel at this position
    if (this.voxelMeshes.has(key)) {
      console.log(`🗑️ Removing existing voxel at (${x},${y},${z}) before adding new one`)
      this.voxelGroup.remove(this.voxelMeshes.get(key))
      this.voxelMeshes.delete(key)
    }
    
    if (blockType === 'minecraft:air') {
      console.log(`💨 Not adding air block at (${x},${y},${z})`)
      return
    }
    
    // Create new voxel
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = this.getMaterial(blockType)
    const mesh = new THREE.Mesh(geometry, material)
    
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5)
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    this.voxelGroup.add(mesh)
    this.voxelMeshes.set(key, mesh)
    
    console.log(`✅ Added voxel at (${x},${y},${z}) with position (${x + 0.5}, ${y + 0.5}, ${z + 0.5})`)
    console.log(`📊 VoxelGroup now has ${this.voxelGroup.children.length} children, voxelMeshes has ${this.voxelMeshes.size} entries`)
  }
  
  removeVoxel(x, y, z) {
    const key = `${x},${y},${z}`
    if (this.voxelMeshes.has(key)) {
      this.voxelGroup.remove(this.voxelMeshes.get(key))
      this.voxelMeshes.delete(key)
    }
  }
  
  // Method to update a single block without rebuilding everything
  updateSingleBlock(x, y, z, blockType) {
    const key = `${x},${y},${z}`
    
    console.log(`🔄 VoxelRenderer.updateSingleBlock called: (${x},${y},${z}) -> ${blockType}`)
    
    // Remove existing block at this position
    if (this.voxelMeshes.has(key)) {
      console.log(`🗑️ Removing existing block at (${x},${y},${z})`)
      this.voxelGroup.remove(this.voxelMeshes.get(key))
      this.voxelMeshes.delete(key)
    }
    
    // Add new block if not air
    if (blockType && blockType !== 'minecraft:air') {
      console.log(`🧱 Adding new block at (${x},${y},${z}) type: ${blockType}`)
      this.addVoxel(x, y, z, blockType)
    } else {
      console.log(`� Block at (${x},${y},${z}) set to air (removed)`)
    }
    
    console.log(`📊 Total voxel meshes: ${this.voxelMeshes.size}`)
  }
  
  startRenderLoop() {
    // Stop render loop to prevent proxy errors
    console.log('⚠️ Initial render loop disabled - will start after store is set')
    return
  }
  
  startActualRenderLoop() {
    console.log('🎬 Starting render loop with raw data')
    
    const animate = () => {
      try {
        this.renderer.render(this.scene, this.camera)
      } catch (error) {
        console.error('Render error:', error)
        // Don't continue if there are errors
        return
      }
      requestAnimationFrame(animate)
    }
    
    animate()
  }
  
  handleResize() {
    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(width, height)
  }
  
  dispose() {
    // Clean up resources
    this.scene.clear()
    this.materials.forEach(material => material.dispose())
    this.materials.clear()
    this.voxelMeshes.clear()
    
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
    this.canvas.removeEventListener('wheel', this.onWheel)
    window.removeEventListener('keydown', this.onKeyDown)
    
    this.renderer.dispose()
  }
  
  addTestCube() {
    // Add a bright red test cube to verify rendering works
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    const testCube = new THREE.Mesh(geometry, material)
    
    testCube.position.set(20, 25, 20)
    testCube.castShadow = true
    testCube.receiveShadow = true
    
    this.scene.add(testCube)
    console.log('🔴 Test cube added at (20, 25, 20) - should be visible if rendering works')
  }
}
