/**
 * Socket.IO service for real-time collaboration
 */
export function setupSocketIO(io) {
  
  // Store active rooms and users
  const activeRooms = new Map();
  
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    
    // Join a model editing room
    socket.on('join-model', (modelId, userName) => {
      const roomName = `model-${modelId}`;
      
      console.log(`🏠 User ${socket.id} attempting to join model ${modelId} as ${userName}`);
      
      // Leave any previous rooms
      Array.from(socket.rooms).forEach(room => {
        if (room !== socket.id && room.startsWith('model-')) {
          socket.leave(room);
          console.log(`🚪 User ${socket.id} left room ${room}`);
        }
      });
      
      // Join the new room
      socket.join(roomName);
      console.log(`✅ User ${socket.id} joined room ${roomName}`);
      
      // Track user in room
      if (!activeRooms.has(roomName)) {
        activeRooms.set(roomName, new Map());
      }
      
      activeRooms.get(roomName).set(socket.id, {
        userName: userName || `User-${socket.id.substring(0, 6)}`,
        joinedAt: new Date()
      });
      
      // Notify others in the room
      const roomUsers = Array.from(activeRooms.get(roomName).values());
      socket.to(roomName).emit('user-joined', {
        userId: socket.id,
        userName: userName || `User-${socket.id.substring(0, 6)}`,
        activeUsers: roomUsers
      });
      
      // Send current active users to the joining user
      socket.emit('room-users', roomUsers);
      
      console.log(`👥 User ${socket.id} joined model ${modelId}, room has ${roomUsers.length} users`);
    });
    
    // Handle block placement/removal
    socket.on('block-change', (modelId, data) => {
      const { x, y, z, blockType, blockData, properties } = data;
      const roomName = `model-${modelId}`;
      
      console.log(`🧱 Received block change for model ${modelId}:`, data);
      
      // Validate block position and type
      if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) {
        socket.emit('error', { message: 'Invalid block coordinates' });
        return;
      }
      
      // Get user info
      const userName = activeRooms.get(roomName)?.get(socket.id)?.userName || `User-${socket.id.substring(0, 6)}`;
      
      // Broadcast block change to other users in the room
      socket.to(roomName).emit('block-changed', {
        x, y, z, blockType, blockData, properties,
        userId: socket.id,
        userName: userName,
        timestamp: new Date()
      });
      
      console.log(`🧱 Block change in model ${modelId}: (${x},${y},${z}) -> ${blockType} by ${userName}`);
    });
    
    // Handle cursor/selection updates
    socket.on('cursor-update', (data) => {
      const { modelId, position, selection } = data;
      const roomName = `model-${modelId}`;
      
      socket.to(roomName).emit('cursor-updated', {
        userId: socket.id,
        position,
        selection,
        timestamp: new Date()
      });
    });
    
    // Handle bulk operations (copy, paste, fill, etc.)
    socket.on('bulk-operation', (data) => {
      const { modelId, operation, blocks, area, userName } = data;
      const roomName = `model-${modelId}`;
      
      socket.to(roomName).emit('bulk-operation-applied', {
        operation,
        blocks,
        area,
        userId: socket.id,
        userName: userName || `User-${socket.id.substring(0, 6)}`,
        timestamp: new Date()
      });
      
      console.log(`⚡ Bulk operation in model ${modelId}: ${operation}`);
    });
    
    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { modelId, message, userName } = data;
      const roomName = `model-${modelId}`;
      
      if (!message || message.trim().length === 0) return;
      
      const chatData = {
        userId: socket.id,
        userName: userName || `User-${socket.id.substring(0, 6)}`,
        message: message.trim(),
        timestamp: new Date()
      };
      
      // Broadcast to all users in the room (including sender)
      io.to(roomName).emit('chat-message', chatData);
      
      console.log(`💬 Chat in model ${modelId}: ${userName}: ${message}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      
      // Remove user from all rooms
      activeRooms.forEach((users, roomName) => {
        if (users.has(socket.id)) {
          const userData = users.get(socket.id);
          users.delete(socket.id);
          
          // Notify others in the room
          socket.to(roomName).emit('user-left', {
            userId: socket.id,
            userName: userData.userName,
            activeUsers: Array.from(users.values())
          });
          
          // Clean up empty rooms
          if (users.size === 0) {
            activeRooms.delete(roomName);
          }
        }
      });
    });
    
    // Handle explicit leave room
    socket.on('leave-model', (modelId) => {
      const roomName = `model-${modelId}`;
      socket.leave(roomName);
      
      if (activeRooms.has(roomName)) {
        const users = activeRooms.get(roomName);
        if (users.has(socket.id)) {
          const userData = users.get(socket.id);
          users.delete(socket.id);
          
          socket.to(roomName).emit('user-left', {
            userId: socket.id,
            userName: userData.userName,
            activeUsers: Array.from(users.values())
          });
          
          if (users.size === 0) {
            activeRooms.delete(roomName);
          }
        }
      }
      
      console.log(`🚪 User ${socket.id} left model ${modelId}`);
    });
  });
  
  // Utility function to get room statistics
  io.getRoomStats = () => {
    const stats = {};
    activeRooms.forEach((users, roomName) => {
      stats[roomName] = {
        userCount: users.size,
        users: Array.from(users.values())
      };
    });
    return stats;
  };
  
  console.log('🔌 Socket.IO service initialized');
}
