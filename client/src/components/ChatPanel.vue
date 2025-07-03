<template>
  <div class="chat-panel">
    <div class="chat-header">
      <h3>💬 Chat</h3>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message', message.type]"
      >
        <div v-if="message.type === 'system'" class="system-message">
          <span class="message-text">{{ message.message }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
        
        <div v-else class="chat-message">
          <div class="message-header">
            <span class="message-user">{{ message.userName }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-text">{{ message.message }}</div>
        </div>
      </div>
      
      <div v-if="messages.length === 0" class="empty-chat">
        No messages yet. Start the conversation!
      </div>
    </div>
    
    <div class="chat-input-container">
      <form @submit.prevent="sendMessage">
        <div class="input-group">
          <input 
            v-model="newMessage"
            class="chat-input"
            placeholder="Type a message..."
            maxlength="500"
            :disabled="!canSendMessage"
          />
          <button 
            type="submit" 
            class="send-button"
            :disabled="!canSendMessage || !newMessage.trim()"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'

export default {
  name: 'ChatPanel',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    canSendMessage: {
      type: Boolean,
      default: true
    }
  },
  emits: ['send-message'],
  setup(props, { emit }) {
    const newMessage = ref('')
    const messagesContainer = ref(null)
    
    const sendMessage = () => {
      const message = newMessage.value.trim()
      if (message && props.canSendMessage) {
        emit('send-message', message)
        newMessage.value = ''
      }
    }
    
    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }
    
    // Auto-scroll to bottom when new messages arrive
    watch(() => props.messages.length, () => {
      scrollToBottom()
    })
    
    return {
      newMessage,
      messagesContainer,
      sendMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chat-header {
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

.chat-header h3 {
  margin: 0;
  color: #4CAF50;
  font-size: 1.2rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  margin-bottom: 16px;
}

.message {
  margin-bottom: 12px;
}

.system-message {
  text-align: center;
  font-style: italic;
  color: #888;
  font-size: 0.9rem;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.chat-message {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #4CAF50;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-user {
  font-weight: 600;
  color: #4CAF50;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.8rem;
  color: #888;
}

.message-text {
  line-height: 1.4;
  word-wrap: break-word;
}

.empty-chat {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 24px;
}

.chat-input-container {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  resize: none;
}

.chat-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  padding: 10px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #45a049;
}

.send-button:disabled {
  background: #666;
  cursor: not-allowed;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
