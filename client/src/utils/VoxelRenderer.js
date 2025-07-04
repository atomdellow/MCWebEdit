import * as THREE from 'three'
import { getBlockColor, isTransparent } from './blockTypes'
import { toRaw } from 'vue'

export default class VoxelRenderer {
  constructor(container) {
    this.container = container
    this.voxelStore = null
    this.modelDimensions = { width: 16, height: 16, length: 16 } // Non-reactive copy
    
    // Three.js objects - completely isolated from Vue
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    })
    
    // Append renderer canvas to container
    this.container.appendChild(this.renderer.domElement)
    this.canvas = this.renderer.domElement
    
    // Make canvas fill the container
    this.canvas.style.display = 'block'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    
    // Controls and interaction
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.isMouseDown = false
    this.lastMousePosition = { x: 0, y: 0 }
    this.lastHighlightedPosition = null
    this.lastHoverCheck = 0
    this.clickStartPosition = null
    
    // Camera controls (RTS-style) with smooth movement
    this.cameraDistance = 30
    this.cameraAngleX = Math.PI / 4 // 45 degrees
    this.cameraAngleY = Math.PI / 4 // 45 degrees
    this.cameraTarget = new THREE.Vector3(25, 25, 25) // Center on the build area
    this.targetCameraTarget = new THREE.Vector3(25, 25, 25) // Target for smooth movement
    this.cameraVelocity = new THREE.Vector3(0, 0, 0)
    this.cameraAcceleration = 0.2
    this.cameraDamping = 0.85
    this.maxCameraSpeed = 3
    
    // Movement state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      // Camera panning
      panLeft: false,
      panRight: false,
      panUp: false,
      panDown: false
    }
    
    // Manual highlight positioning
    this.manualHighlightMode = false
    this.manualHighlightPosition = { x: 25, y: 10, z: 25 }
    
    // Voxel objects
    this.voxelGroup = new THREE.Group()
    this.voxelMeshes = new Map() // "x,y,z" -> mesh
    this.highlightMesh = null
    this.selectionBox = null // For showing selection area
    
    // Materials
    this.materials = new Map()
    this.wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x666666 })
    this.selectionMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    })
    
    // Event callbacks
    this.onBlockHover = null
    this.onBlockClick = null
    this.onCameraMove = null
    
    // Animation loop
    this.isAnimating = false
    
    this.init()
  }
  
  init() {
    // Setup renderer size first
    const width = this.container.clientWidth || 800
    const height = this.container.clientHeight || 600
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
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
    
    // Start animation loop
    this.startAnimationLoop()
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
    console.log(`🎨 getMaterial called with blockType: ${blockType}`)
    
    if (this.materials.has(blockType)) {
      console.log(`🎨 Returning cached material for ${blockType}`)
      return this.materials.get(blockType)
    }
    
    const color = getBlockColor(blockType)
    const transparent = isTransparent(blockType)
    
    console.log(`🎨 Creating material for ${blockType}: color=0x${color.toString(16).padStart(6, '0')}, transparent=${transparent}`)
    
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
    
    // Keyboard events for smooth movement
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keyup', this.onKeyUp.bind(this))
    
    // Start animation loop for smooth camera movement
    this.startAnimationLoop()
  }
  
  onMouseDown(event) {
    this.isMouseDown = true
    this.lastMousePosition = { x: event.clientX, y: event.clientY }
    
    // Handle block clicking ONLY for left/right click WITHOUT dragging
    if (event.button === 0 || event.button === 2) { // Left or right click
      this.updateMousePosition(event)
      // Store click position to detect if this was a drag or click
      this.clickStartPosition = { x: event.clientX, y: event.clientY }
    }
  }
  
  onMouseMove(event) {
    this.updateMousePosition(event)
    
    // Camera rotation with MIDDLE mouse button or SHIFT + left mouse
    if (this.isMouseDown && (
      (event.buttons & 4) || // Middle mouse button
      (event.buttons & 1 && event.shiftKey) // Shift + left mouse
    )) {
      const deltaX = event.clientX - this.lastMousePosition.x
      const deltaY = event.clientY - this.lastMousePosition.y
      
      this.cameraAngleY -= deltaX * 0.01
      this.cameraAngleX = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraAngleX + deltaY * 0.01))
      
      this.updateCameraPosition()
      this.lastMousePosition = { x: event.clientX, y: event.clientY }
    }
    // Camera panning with MIDDLE mouse + SHIFT
    else if (this.isMouseDown && (event.buttons & 4) && event.shiftKey) {
      const deltaX = event.clientX - this.lastMousePosition.x
      const deltaY = event.clientY - this.lastMousePosition.y
      
      // Convert screen movement to world movement
      const panSpeed = 0.05
      const rightVector = new THREE.Vector3()
      const upVector = new THREE.Vector3()
      
      this.camera.getWorldDirection(new THREE.Vector3())
      rightVector.setFromMatrixColumn(this.camera.matrixWorld, 0)
      upVector.setFromMatrixColumn(this.camera.matrixWorld, 1)
      
      this.targetCameraTarget.addScaledVector(rightVector, -deltaX * panSpeed)
      this.targetCameraTarget.addScaledVector(upVector, deltaY * panSpeed)
      
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
    // Only handle block interaction if this was a click, not a drag
    if (this.clickStartPosition && 
        Math.abs(event.clientX - this.clickStartPosition.x) < 5 &&
        Math.abs(event.clientY - this.clickStartPosition.y) < 5) {
      
      if (event.button === 0 || event.button === 2) { // Left or right click
        this.onBlockInteraction(event.button === 2) // true for right click
      }
    }
    
    this.isMouseDown = false
    this.clickStartPosition = null
  }
  
  onWheel(event) {
    event.preventDefault()
    this.cameraDistance = Math.max(5, Math.min(100, this.cameraDistance + event.deltaY * 0.01))
    this.updateCameraPosition()
  }
  
  onKeyDown(event) {
    // Don't consume keys if user is typing in an input field
    const activeElement = document.activeElement
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.contentEditable === 'true'
    )) {
      return
    }
    
    // Prevent default for movement keys to avoid page scrolling
    const movementKeys = ['w', 'a', 's', 'd', 'q', 'e', 'W', 'A', 'S', 'D', 'Q', 'E', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Insert', 'Delete', 'Home', 'End', 'Enter', ' ']
    if (movementKeys.includes(event.key)) {
      event.preventDefault()
    }
    
    // Check for modifier keys to determine mode
    const isCtrl = event.ctrlKey
    
    switch(event.key.toLowerCase()) {
      // WASD camera movement (simple, no modifiers)
      case 'w':
        this.keys.forward = true
        break
      case 's':
        this.keys.backward = true
        break
      case 'a':
        this.keys.left = true
        break
      case 'd':
        this.keys.right = true
        break
      case 'q':
        this.keys.down = true
        break
      case 'e':
        this.keys.up = true
        break
        
      // Manual highlight positioning
      case 'arrowleft':
        if (this.manualHighlightMode) {
          this.moveHighlightManually(-1, 0, 0)
          event.preventDefault()
        }
        break
      case 'arrowright':
        if (this.manualHighlightMode) {
          this.moveHighlightManually(1, 0, 0)
          event.preventDefault()
        }
        break
      case 'arrowup':
        if (this.manualHighlightMode) {
          this.moveHighlightManually(0, 0, -1)
          event.preventDefault()
        }
        break
      case 'arrowdown':
        if (this.manualHighlightMode) {
          this.moveHighlightManually(0, 0, 1)
          event.preventDefault()
        }
        break
      case 'insert':
        if (this.manualHighlightMode) {
          this.moveHighlightManually(0, 1, 0)
          event.preventDefault()
        }
        break
      case 'delete':
        if (this.manualHighlightMode) {
          this.moveHighlightManually(0, -1, 0)
          event.preventDefault()
        }
        break
        
      // Toggle manual highlight mode
      case 'enter':
        this.toggleManualHighlightMode()
        event.preventDefault()
        break
        
      // Place block with spacebar in manual mode
      case ' ':
        if (this.manualHighlightMode) {
          this.onBlockInteraction(false) // false = left click (place block)
          event.preventDefault()
        }
        break
        
      case 'r':
        // Reset camera to center
        this.targetCameraTarget.set(
          this.modelDimensions.width / 2,
          this.modelDimensions.height / 2,
          this.modelDimensions.length / 2
        )
        this.cameraAngleX = Math.PI / 4
        this.cameraAngleY = Math.PI / 4
        this.cameraDistance = 30
        break
      case 'f':
        // Focus on center quickly
        this.cameraTarget.copy(this.targetCameraTarget)
        this.updateCameraPosition()
        break
    }
  }
  
  onKeyUp(event) {
    // Don't consume keys if user is typing in an input field
    const activeElement = document.activeElement
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.contentEditable === 'true'
    )) {
      return
    }
    
    switch(event.key.toLowerCase()) {
      case 'w':
        this.keys.forward = false
        this.keys.panUp = false
        break
      case 's':
        this.keys.backward = false
        this.keys.panDown = false
        break
      case 'a':
        this.keys.left = false
        this.keys.panLeft = false
        break
      case 'd':
        this.keys.right = false
        this.keys.panRight = false
        break
      case 'q':
        this.keys.down = false
        break
      case 'e':
        this.keys.up = false
        break
    }
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
    // Skip raycast hover if in manual highlight mode
    if (this.manualHighlightMode) {
      return
    }
    
    if (!this.modelDimensions) {
      return
    }
    
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    const dims = this.modelDimensions
    
    // More efficient approach: raycast against existing blocks and ground plane
    const intersectableObjects = []
    
    // Add all existing voxel meshes
    this.voxelGroup.children.forEach(mesh => {
      intersectableObjects.push(mesh)
    })
    
    // Add ground plane for placing blocks on empty space
    if (this.groundPlane) {
      intersectableObjects.push(this.groundPlane)
    }
    
    const intersects = this.raycaster.intersectObjects(intersectableObjects, false)
    
    if (intersects.length > 0) {
      const intersect = intersects[0]
      let targetPosition = null
      
      if (intersect.object === this.groundPlane) {
        // Intersected with ground plane - place on top
        targetPosition = {
          x: Math.floor(intersect.point.x),
          y: 0,
          z: Math.floor(intersect.point.z)
        }
      } else {
        // Intersected with existing block - place adjacent based on face normal
        const face = intersect.face
        const normal = face.normal.clone()
        
        // Transform normal to world space
        normal.transformDirection(intersect.object.matrixWorld)
        
        // Get the position of the intersected block
        const blockPos = {
          x: Math.floor(intersect.object.position.x),
          y: Math.floor(intersect.object.position.y),
          z: Math.floor(intersect.object.position.z)
        }
        
        // Calculate adjacent position based on normal
        targetPosition = {
          x: blockPos.x + Math.round(normal.x),
          y: blockPos.y + Math.round(normal.y),
          z: blockPos.z + Math.round(normal.z)
        }
      }
      
      // Validate position is within bounds
      if (targetPosition && 
          targetPosition.x >= 0 && targetPosition.x < dims.width &&
          targetPosition.y >= 0 && targetPosition.y < dims.height &&
          targetPosition.z >= 0 && targetPosition.z < dims.length) {
        
        this.highlightMesh.position.set(
          targetPosition.x + 0.5,
          targetPosition.y + 0.5,
          targetPosition.z + 0.5
        )
        this.highlightMesh.visible = true
        
        // Only log if we just started highlighting a new position
        if (!this.lastHighlightedPosition || 
            this.lastHighlightedPosition.x !== targetPosition.x ||
            this.lastHighlightedPosition.y !== targetPosition.y ||
            this.lastHighlightedPosition.z !== targetPosition.z) {
          this.lastHighlightedPosition = targetPosition
        }
        
        if (this.onBlockHover) {
          // Create completely new, non-reactive position object
          const hoverPosition = {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z
          }
          this.onBlockHover(hoverPosition)
        }
      } else {
        this.highlightMesh.visible = false
      }
    } else {
      this.highlightMesh.visible = false
      if (this.lastHighlightedPosition) {
        this.lastHighlightedPosition = null
      }
      if (this.onBlockHover) {
        this.onBlockHover(null)
      }
    }
  }
  
  onBlockSelect(start, end) {
    if (!this.selectionBox) {
      // Create selection box helper
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = this.selectionMaterial
      this.selectionBox = new THREE.Mesh(geometry, material)
      this.scene.add(this.selectionBox)
    }
    
    // Calculate center and size of the selection box
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    
    center.addVectors(start, end).multiplyScalar(0.5)
    size.subVectors(end, start).abs()
    
    this.selectionBox.position.copy(center)
    this.selectionBox.scale.set(size.x, size.y, size.z)
    this.selectionBox.visible = true
  }
  
  showSelection(start, end) {
    this.clearSelection()
    
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)
    const minZ = Math.min(start.z, end.z)
    const maxZ = Math.max(start.z, end.z)
    
    // Create wireframe box for selection
    const width = maxX - minX + 1
    const height = maxY - minY + 1
    const depth = maxZ - minZ + 1
    
    const geometry = new THREE.BoxGeometry(width, height, depth)
    const edges = new THREE.EdgesGeometry(geometry)
    this.selectionBox = new THREE.LineSegments(edges, this.selectionMaterial)
    
    // Position the box at the center of the selection
    this.selectionBox.position.set(
      minX + width / 2,
      minY + height / 2,
      minZ + depth / 2
    )
    
    this.scene.add(this.selectionBox)
  }
  
  clearSelection() {
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox)
      this.selectionBox.geometry.dispose()
      this.selectionBox = null
    }
  }
  
  onBlockInteraction(isRightClick) {
    if (!this.highlightMesh.visible) {
      return
    }
    
    // Use manual position if in manual mode, otherwise use highlight mesh position
    let position
    if (this.manualHighlightMode) {
      position = { ...this.manualHighlightPosition }
    } else {
      position = {
        x: Math.floor(this.highlightMesh.position.x),
        y: Math.floor(this.highlightMesh.position.y),
        z: Math.floor(this.highlightMesh.position.z)
      }
    }
    
    if (this.onBlockClick) {
      this.onBlockClick(position, isRightClick)
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
  
  startAnimationLoop() {
    if (this.isAnimating) return
    
    this.isAnimating = true
    
    const animate = () => {
      if (!this.isAnimating) return
      
      this.updateSmoothMovement()
      this.render()
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }
  
  render() {
    try {
      this.renderer.render(this.scene, this.camera)
    } catch (error) {
      console.error('❌ Render error:', error)
    }
  }
  
  stopAnimationLoop() {
    this.isAnimating = false
  }
  
  updateSmoothMovement() {
    // Calculate movement direction based on pressed keys
    const movement = new THREE.Vector3(0, 0, 0)
    const panMovement = new THREE.Vector3(0, 0, 0)
    
    if (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right || this.keys.up || this.keys.down) {
      const forward = new THREE.Vector3()
      const right = new THREE.Vector3()
      const up = new THREE.Vector3(0, 1, 0)
      
      // Get camera direction vectors
      this.camera.getWorldDirection(forward)
      right.crossVectors(forward, up).normalize()
      
      // Project forward vector onto horizontal plane
      forward.y = 0
      forward.normalize()
      
      if (this.keys.forward) movement.addScaledVector(forward, 1)
      if (this.keys.backward) movement.addScaledVector(forward, -1)
      if (this.keys.left) movement.addScaledVector(right, -1)
      if (this.keys.right) movement.addScaledVector(right, 1)
      if (this.keys.up) movement.addScaledVector(up, 1)
      if (this.keys.down) movement.addScaledVector(up, -1)
      
      movement.normalize()
    }
    
    // Handle camera panning
    if (this.keys.panLeft || this.keys.panRight || this.keys.panUp || this.keys.panDown) {
      const rightVector = new THREE.Vector3()
      const upVector = new THREE.Vector3()
      
      rightVector.setFromMatrixColumn(this.camera.matrixWorld, 0)
      upVector.setFromMatrixColumn(this.camera.matrixWorld, 1)
      
      const panSpeed = 0.5
      
      if (this.keys.panLeft) panMovement.addScaledVector(rightVector, -panSpeed)
      if (this.keys.panRight) panMovement.addScaledVector(rightVector, panSpeed)
      if (this.keys.panUp) panMovement.addScaledVector(upVector, panSpeed)
      if (this.keys.panDown) panMovement.addScaledVector(upVector, -panSpeed)
    }
    
    // Apply acceleration for movement
    this.cameraVelocity.addScaledVector(movement, this.cameraAcceleration)
    
    // Limit speed
    if (this.cameraVelocity.length() > this.maxCameraSpeed) {
      this.cameraVelocity.normalize().multiplyScalar(this.maxCameraSpeed)
    }
    
    // Apply damping
    this.cameraVelocity.multiplyScalar(this.cameraDamping)
    
    // Update target position with movement
    this.targetCameraTarget.add(this.cameraVelocity)
    
    // Apply panning movement directly (no acceleration/damping for precise control)
    this.targetCameraTarget.add(panMovement)
    
    // Smooth interpolation towards target
    this.cameraTarget.lerp(this.targetCameraTarget, 0.1)
    
    // Update camera position to apply the movement
    this.updateCameraPosition()
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
    // Stop animation
    this.isAnimating = false
    
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
    
    // Remove canvas from container
    if (this.container && this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas)
    }
    
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
  
  moveHighlightManually(deltaX, deltaY, deltaZ) {
    if (!this.modelDimensions) return
    
    const dims = this.modelDimensions
    
    // Update manual highlight position
    this.manualHighlightPosition.x = Math.max(0, Math.min(dims.width - 1, this.manualHighlightPosition.x + deltaX))
    this.manualHighlightPosition.y = Math.max(0, Math.min(dims.height - 1, this.manualHighlightPosition.y + deltaY))
    this.manualHighlightPosition.z = Math.max(0, Math.min(dims.length - 1, this.manualHighlightPosition.z + deltaZ))
    
    // Enable manual mode
    this.manualHighlightMode = true
    
    // Update highlight position
    this.highlightMesh.position.set(
      this.manualHighlightPosition.x + 0.5,
      this.manualHighlightPosition.y + 0.5,
      this.manualHighlightPosition.z + 0.5
    )
    this.highlightMesh.visible = true
    
    // Update last highlighted position
    this.lastHighlightedPosition = { ...this.manualHighlightPosition }
    
    // Trigger hover callback
    if (this.onBlockHover) {
      this.onBlockHover({ ...this.manualHighlightPosition })
    }
    
    console.log(`📍 Manual highlight moved to: (${this.manualHighlightPosition.x}, ${this.manualHighlightPosition.y}, ${this.manualHighlightPosition.z})`)
  }
  
  toggleManualHighlightMode() {
    this.manualHighlightMode = !this.manualHighlightMode
    
    if (this.manualHighlightMode) {
      // Initialize manual position to current camera target or center
      this.manualHighlightPosition = {
        x: Math.floor(this.cameraTarget.x),
        y: Math.floor(this.cameraTarget.y),
        z: Math.floor(this.cameraTarget.z)
      }
      
      // Clamp to bounds
      const dims = this.modelDimensions
      this.manualHighlightPosition.x = Math.max(0, Math.min(dims.width - 1, this.manualHighlightPosition.x))
      this.manualHighlightPosition.y = Math.max(0, Math.min(dims.height - 1, this.manualHighlightPosition.y))
      this.manualHighlightPosition.z = Math.max(0, Math.min(dims.length - 1, this.manualHighlightPosition.z))
      
      this.highlightMesh.position.set(
        this.manualHighlightPosition.x + 0.5,
        this.manualHighlightPosition.y + 0.5,
        this.manualHighlightPosition.z + 0.5
      )
      this.highlightMesh.visible = true
      
      console.log('🎯 Manual highlight mode ENABLED - Use Arrow keys to move highlight, Insert/Delete for up/down')
      
      // Update last highlighted position and trigger hover callback
      this.lastHighlightedPosition = { ...this.manualHighlightPosition }
      if (this.onBlockHover) {
        this.onBlockHover({ ...this.manualHighlightPosition })
      }
    } else {
      console.log('🎯 Manual highlight mode DISABLED - Returning to mouse hover')
      // Clear the last highlighted position so mouse hover can take over
      this.lastHighlightedPosition = null
    }
  }
}
