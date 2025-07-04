<template>
  <div class="editor-test">
    <h1>Editor Test Component</h1>
    <p>Model ID: {{ $route.params.modelId }}</p>
  </div>
</template>

<script>
console.log('📦 EditorTest.vue: Module loaded!');

export default {
  name: 'EditorTest',
  mounted() {
    console.log('🎯 EditorTest: Component mounted!');
    console.log('🎯 EditorTest: Route params:', this.$route.params);
  }
}
</script>

<style scoped>
.editor-test {
  padding: 20px;
  background: #1a1a1a;
  color: white;
  height: 100vh;
}
</style>
