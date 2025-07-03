<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: #1a1a1a;
  color: #ffffff;
}

#app {
  width: 100vw;
  height: 100vh;
  position: relative;
}

/* Utility classes */
.btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover {
  background: #45a049;
}

.btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.btn-secondary {
  background: #666;
}

.btn-secondary:hover {
  background: #555;
}

.btn-danger {
  background: #f44336;
}

.btn-danger:hover {
  background: #da190b;
}

.input {
  background: #333;
  color: white;
  border: 1px solid #555;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #4CAF50;
}

.panel {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  color: #4CAF50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.text-center {
  text-align: center;
}

.mt-16 {
  margin-top: 16px;
}

.mb-16 {
  margin-bottom: 16px;
}

.flex {
  display: flex;
}

.gap-8 {
  gap: 8px;
}

.justify-end {
  justify-content: flex-end;
}
</style>
