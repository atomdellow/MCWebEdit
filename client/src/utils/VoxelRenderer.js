import * as THREE from 'three'
import { getBlockColor, isTransparent } from './blockTypes'

export default class VoxelRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.voxelStore = null
    
    // Three.js objects
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
    
    // Camera controls (RTS-style)
    this.cameraDistance = 20
    this.cameraAngleX = Math.PI / 4 // 45 degrees
    this.cameraAngleY = Math.PI / 4 // 45 degrees
    this.cameraTarget = new THREE.Vector3(8, 8, 8)
    
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
    
    // Setup ground plane for reference
    this.createGroundPlane()
    
    // Add event listeners
    this.addEventListeners()
    
    // Initial resize
    this.handleResize()
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -50
    directionalLight.shadow.camera.right = 50
    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.bottom = -50
    this.scene.add(directionalLight)
    
    // Point light for better illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.4, 100)
    pointLight.position.set(20, 30, 20)
    this.scene.add(pointLight)
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
    if (!this.voxelStore) return
    
    const dims = this.voxelStore.modelDimensions
    const geometry = new THREE.PlaneGeometry(dims.width, dims.length)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.1,
      side: THREE.DoubleSide
    })
    
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI / 2
    plane.position.set(dims.width / 2 - 0.5, -0.01, dims.length / 2 - 0.5)
    this.scene.add(plane)
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(
      Math.max(dims.width, dims.length), 
      Math.max(dims.width, dims.length),
      0x444444, 
      0x222222
    )
    gridHelper.position.set(dims.width / 2 - 0.5, 0, dims.length / 2 - 0.5)
    this.scene.add(gridHelper)
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
      // Block hovering
      this.handleBlockHover()
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
      this.onCameraMove(
        { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z },
        { x: this.cameraTarget.x, y: this.cameraTarget.y, z: this.cameraTarget.z }
      )
    }
  }
  
  handleBlockHover() {
    if (!this.voxelStore) return
    
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    // Create invisible collision boxes for all possible positions
    const dims = this.voxelStore.modelDimensions
    const intersects = []
    
    // Raycast against existing blocks and empty spaces
    for (let x = 0; x < dims.width; x++) {
      for (let y = 0; y < dims.height; y++) {
        for (let z = 0; z < dims.length; z++) {
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
    
    if (intersects.length > 0) {
      // Sort by distance and take the closest
      intersects.sort((a, b) => a.distance - b.distance)
      const closest = intersects[0]
      
      this.highlightMesh.position.set(
        closest.position.x + 0.5,
        closest.position.y + 0.5,
        closest.position.z + 0.5
      )
      this.highlightMesh.visible = true
      
      if (this.onBlockHover) {
        this.onBlockHover(closest.position)
      }
    } else {
      this.highlightMesh.visible = false
      if (this.onBlockHover) {
        this.onBlockHover(null)
      }
    }
  }
  
  handleBlockInteraction(isRightClick) {
    if (!this.highlightMesh.visible) return
    
    const position = {
      x: Math.floor(this.highlightMesh.position.x),
      y: Math.floor(this.highlightMesh.position.y),
      z: Math.floor(this.highlightMesh.position.z)
    }
    
    if (this.onBlockClick) {
      this.onBlockClick(position, isRightClick)
    }
  }
  
  setVoxelStore(store) {
    this.voxelStore = store
    this.updateVoxels()
  }
  
  updateVoxels() {
    if (!this.voxelStore) return
    
    // Clear existing voxel meshes
    this.voxelGroup.clear()
    this.voxelMeshes.clear()
    
    // Add all blocks from store
    const blocks = this.voxelStore.getBlocksArray()
    blocks.forEach(block => {
      if (block.blockType !== 'minecraft:air') {
        this.addVoxel(block.x, block.y, block.z, block.blockType)
      }
    })
  }
  
  addVoxel(x, y, z, blockType) {
    const key = `${x},${y},${z}`
    
    // Remove existing voxel at this position
    if (this.voxelMeshes.has(key)) {
      this.voxelGroup.remove(this.voxelMeshes.get(key))
      this.voxelMeshes.delete(key)
    }
    
    if (blockType === 'minecraft:air') return
    
    // Create new voxel
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = this.getMaterial(blockType)
    const mesh = new THREE.Mesh(geometry, material)
    
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5)
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    this.voxelGroup.add(mesh)
    this.voxelMeshes.set(key, mesh)
  }
  
  removeVoxel(x, y, z) {
    const key = `${x},${y},${z}`
    if (this.voxelMeshes.has(key)) {
      this.voxelGroup.remove(this.voxelMeshes.get(key))
      this.voxelMeshes.delete(key)
    }
  }
  
  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate)
      this.renderer.render(this.scene, this.camera)
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
}
