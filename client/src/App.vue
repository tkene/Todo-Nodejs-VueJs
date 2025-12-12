<script setup>
import Menu from './Menu.vue'
// Le routage est géré par vue-router
</script>

<template>
  <div id="app" class="app-container">
    <Menu />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
}

.main-content {
  width: calc(100% - 200px);
  margin-left: 200px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .main-content {
    width: 100%;
    margin-left: 0;
  }
}
</style>
