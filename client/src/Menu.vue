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
  <nav class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Menu</h2>
      </div>
      <div class="sidebar-links">
        <router-link
          v-for="route in menuRoutes"
          :key="route.name"
          :to="route.path"
          class="sidebar-link"
          active-class="sidebar-link-active"
        >
          <span class="sidebar-link-text">{{ formatRouteName(route.name) }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 200px;
  background-color: var(--dark-light);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
}

.sidebar-content {
  padding: 1rem;
}

.sidebar-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--dark);
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-link:hover {
  background-color: var(--dark);
  color: var(--primary);
  transform: translateX(5px);
}

.sidebar-link-active {
  background-color: var(--primary);
  color: white;
  font-weight: 600;
}

.sidebar-link-active:hover {
  background-color: var(--accent);
  color: white;
}

.sidebar-link-text {
  font-size: 1rem;
}

</style>
