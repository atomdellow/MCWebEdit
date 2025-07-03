import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.currentModelId = null
    this.userName = null
    this.eventHandlers = new Map()
  }
  
  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket?.connected) {
      console.log('🔌 Already connected to server')
      this.emit('connection-status', true)
      return this.socket
    }
    
    console.log('🔌 Connecting to server at', serverUrl)
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    })
    
    this.setupEventListeners()
    return this.socket
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.currentModelId = null
    }
  }
  
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to server')
      this.emit('connection-status', true)
    })
    
    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server')
      this.emit('connection-status', false)
    })
    
    this.socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data.userName)
      this.emit('user-joined', data)
    })
    
    this.socket.on('user-left', (data) => {
      console.log('👋 User left:', data.userName)
      this.emit('user-left', data)
    })
    
    this.socket.on('room-users', (users) => {
      this.emit('room-users', users)
    })
    
    this.socket.on('block-changed', (data) => {
      console.log('🧱 Block changed:', data)
      this.emit('block-changed', data)
    })
    
    this.socket.on('bulk-operation-applied', (data) => {
      console.log('⚡ Bulk operation:', data.operation)
      this.emit('bulk-operation-applied', data)
    })
    
    this.socket.on('cursor-updated', (data) => {
      this.emit('cursor-updated', data)
    })
    
    this.socket.on('chat-message', (data) => {
      this.emit('chat-message', data)
    })
    
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
      this.emit('error', error)
    })
  }
  
  joinModel(modelId, userName = null) {
    if (!this.socket?.connected) {
      console.error('❌ Cannot join model: Socket not connected')
      throw new Error('Socket not connected')
    }
    
    this.currentModelId = modelId
    this.userName = userName || `User-${Date.now()}`
    
    console.log('🏠 Joining model room:', modelId, 'as', this.userName)
    this.socket.emit('join-model', modelId, this.userName)
  }
  
  leaveModel() {
    if (this.socket?.connected && this.currentModelId) {
      this.socket.emit('leave-model', this.currentModelId)
      this.currentModelId = null
    }
  }
  
  sendBlockChange(x, y, z, blockType, blockData = 0, properties = {}) {
    if (!this.socket?.connected || !this.currentModelId) {
      console.error('❌ Cannot send block change: Socket not connected or no model joined')
      throw new Error('Socket not connected or no model joined')
    }
    
    const data = { x, y, z, blockType, blockData, properties }
    console.log('🧱 Sending block change:', data)
    this.socket.emit('block-change', this.currentModelId, data)
  }
  
  sendBulkOperation(operation, blocks, area = null) {
    if (!this.socket?.connected || !this.currentModelId) {
      throw new Error('Not connected to a model')
    }
    
    this.socket.emit('bulk-operation', {
      modelId: this.currentModelId,
      operation, blocks, area,
      userName: this.userName
    })
  }
  
  sendCursorUpdate(position, selection = null) {
    if (!this.socket?.connected || !this.currentModelId) {
      return // Don't throw error for cursor updates
    }
    
    this.socket.emit('cursor-update', {
      modelId: this.currentModelId,
      position, selection
    })
  }
  
  sendChatMessage(message) {
    if (!this.socket?.connected || !this.currentModelId) {
      throw new Error('Not connected to a model')
    }
    
    this.socket.emit('chat-message', {
      modelId: this.currentModelId,
      message,
      userName: this.userName
    })
  }
  
  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event).add(handler)
  }
  
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler)
    }
  }
  
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }
  
  // Getters
  get connected() {
    return this.socket?.connected || false
  }
  
  get socketId() {
    return this.socket?.id
  }
}

// Export singleton instance
export const socketService = new SocketService()
export default socketService
