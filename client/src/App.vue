<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'Login')
</script>

<template>
  <div id="app" class="app-container">
    <Sidebar v-if="!isLoginPage" />
    <main :class="['main-content', { 'main-content-full': isLoginPage }]">
      <router-view />
    </main>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  min-height: 100vh;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
  margin-left: 200px;
}

.main-content-full {
  margin-left: 0;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
