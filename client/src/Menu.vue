<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()

// Filtre les routes à afficher dans le menu (exclut 404, routes catch-all et celles avec hideInMenu)
const menuRoutes = computed(() => {
  return router.getRoutes().filter(route => {
    // Exclut les routes 404, catch-all, celles sans nom et celles avec hideInMenu: true
    return route.name && 
           route.name !== '404' && 
           !route.path.includes(':pathMatch') &&
           !route.meta?.hideInMenu
  })
})

// Fonction pour formater le nom de la route pour l'affichage
const formatRouteName = (name) => {
  if (!name) return ''
  // Capitalise la première lettre et remplace les tirets par des espaces
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <nav class="bg-gray-100 p-4 mb-4">
    <div class="mx-auto flex gap-4">
      <router-link
        v-for="route in menuRoutes"
        :key="route.name"
        :to="route.path"
        class="px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        active-class="bg-gray-300 font-bold"
      >
        {{ formatRouteName(route.name) }}
      </router-link>
    </div>
  </nav>
</template>
