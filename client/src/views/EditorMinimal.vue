<template>
  <div class="minimal-editor">
    <h1>Minimal Editor</h1>
    <p>Model ID: {{ modelId }}</p>
  </div>
</template>

<script>
console.log('📦 Editor.vue: MINIMAL MODULE LOADED!');

export default {
  name: 'Editor',
  props: {
    modelId: String
  },
  setup(props) {
    console.log('🚀 Editor: MINIMAL SETUP CALLED!', props);
    return {};
  },
  mounted() {
    console.log('🎯 Editor: MINIMAL MOUNTED!');
  }
}
</script>

<style scoped>
.minimal-editor {
  padding: 20px;
  background: #1a1a1a;
  color: white;
  height: 100vh;
}
</style>
