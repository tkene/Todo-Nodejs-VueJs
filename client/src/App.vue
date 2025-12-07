<script setup>
// Le routage est géré par vue-router
</script>

<template>
  <div id="app">
    <nav class="bg-gray-100 p-4 mb-4">
      <div class=" mx-auto flex gap-4">
        <router-link 
          to="/" 
          class="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          active-class="bg-gray-300 font-bold"
        >
          Accueil
        </router-link>
        <router-link 
          to="/tags" 
          class="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          active-class="bg-gray-300 font-bold"
        >
          Tags
        </router-link>
      </div>
    </nav>
    <router-view />
  </div>
</template>
