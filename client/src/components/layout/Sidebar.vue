<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { user, logout, checkAuth, isLoading } = useAuth()

const expandedMenus = ref({})

const toggleSubmenu = (routeName) => {
  expandedMenus.value[routeName] = !expandedMenus.value[routeName]
}

// Filtre et organise les routes à afficher dans le menu
const menuRoutes = computed(() => {
  const allRoutes = router.getRoutes()
  
  // Créer un Set de tous les noms de routes enfants pour les exclure
  const childRouteNames = new Set()
  allRoutes.forEach(route => {
    if (route.children && route.children.length > 0) {
      route.children.forEach(child => {
        if (child.name) {
          childRouteNames.add(child.name)
        }
      })
    }
  })

  const routes = allRoutes.filter(route => {
    // Exclut les routes 404, catch-all, celles sans nom et celles avec hideInMenu: true
    // ET exclut les routes qui sont des enfants d'autres routes
    return route.name && 
           route.name !== '404' && 
           !route.path.includes(':pathMatch') &&
           !route.meta?.hideInMenu &&
           !route.path.includes(':id') && // Exclut les routes dynamiques
           !childRouteNames.has(route.name) // Exclut les routes enfants
  })

  // Organise les routes en groupes parent/enfant
  const organizedRoutes = []

  routes.forEach(route => {
    // Si la route a des enfants, c'est un parent
    if (route.children && route.children.length > 0) {
      const children = route.children.filter(child => 
        child.name && 
        !child.meta?.hideInMenu &&
        !child.path.includes(':id')
      )
      
      if (children.length > 0) {
        organizedRoutes.push({
          ...route,
          isParent: true,
          children: children
        })
      }
    } else {
      // Route normale sans parent
      organizedRoutes.push({
        ...route,
        isParent: false,
        children: []
      })
    }
  })

  return organizedRoutes
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

// Construit le chemin complet d'un enfant en combinant le path du parent et celui de l'enfant
const getChildFullPath = (parentPath, childPath) => {
  if (childPath.startsWith('/')) {
    return childPath // Chemin absolu
  }
  // Chemin relatif : combine parent + enfant
  const parentPathClean = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
  const childPathClean = childPath.startsWith('/') ? childPath : `/${childPath}`
  return `${parentPathClean}${childPathClean}`
}

// Vérifie si une route ou ses enfants sont actives
const isRouteActive = (parentRoute) => {
  if (parentRoute.isParent) {
    return parentRoute.children.some(child => route.name === child.name) || 
           route.path.startsWith(parentRoute.path)
  }
  return route.name === parentRoute.name
}

// Surveille les changements de route pour auto-expandre les sous-menus actifs
watch(() => route.path, () => {
  menuRoutes.value.forEach(parentRoute => {
    if (parentRoute.isParent && isRouteActive(parentRoute)) {
      expandedMenus.value[parentRoute.name] = true
    }
  })
}, { immediate: true })

// Charger les informations de l'utilisateur au montage
checkAuth()
</script>

<template>
  <nav class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <h2 class="sidebar-title flex items-center justify-center gap-2">
          <q-avatar size="150px">
            <img src="../../assets/images/JobTracker.png">
          </q-avatar>
        </h2>
      </div>
      <div class="sidebar-links">
        <div
          v-for="routeItem in menuRoutes"
          :key="routeItem.name"
          class="menu-item"
        >
          <!-- Route parent avec sous-menu -->
          <div v-if="routeItem.isParent" class="menu-parent">
            <div
              class="sidebar-link menu-parent-link"
              :class="{ 'sidebar-link-active': isRouteActive(routeItem) }"
              @click="toggleSubmenu(routeItem.name)"
            >
              <q-icon 
                v-if="routeItem.meta?.icon" 
                :name="routeItem.meta.icon" 
                size="sm" 
                class="q-mr-sm"
              />
              <span class="menu-parent-text">
                {{ formatRouteName(routeItem.name) }}
              </span>
              <span 
                class="menu-arrow" 
                :class="{ 'menu-arrow-expanded': expandedMenus[routeItem.name] }"
              >
                ▼
              </span>
            </div>
            <!-- Sous-menu -->
            <div
              v-show="expandedMenus[routeItem.name]"
              class="submenu"
            >
              <router-link
                v-for="child in routeItem.children"
                :key="child.name"
                :to="getChildFullPath(routeItem.path, child.path)"
                class="sidebar-link submenu-link"
                active-class="sidebar-link-active"
              >
                <q-icon 
                  v-if="child.meta?.icon" 
                  :name="child.meta.icon" 
                  size="sm" 
                  class="q-mr-sm"
                />
                <span class="sidebar-link-text">{{ formatRouteName(child.name) }}</span>
              </router-link>
            </div>
          </div>
          <!-- Route normale sans sous-menu -->
          <router-link
            v-else
            :to="routeItem.path"
            class="sidebar-link"
            active-class="sidebar-link-active"
          >
            <q-icon 
              v-if="routeItem.meta?.icon" 
              :name="routeItem.meta.icon" 
              size="sm" 
              class="q-mr-sm"
            />
            <span class="sidebar-link-text">{{ formatRouteName(routeItem.name) }}</span>
          </router-link>
        </div>
      </div>
      
      <!-- Section utilisateur et déconnexion -->
      <div class="sidebar-footer">
        <div v-if="user" class="user-info q-mb-sm">
          <div class="text-caption text-grey-6 q-mb-xs">Connecté en tant que :</div>
          <div 
            v-if="user.email && user.email.length > 20"
            class="text-body2 text-weight-medium user-email relative"
          >
            <q-tooltip :delay="300">{{ user.email }}</q-tooltip>
            {{ user.email }}
          </div>
          <div 
            v-else
            class="text-body2 text-weight-medium"
          >
            {{ user.email }}
          </div>
        </div>
        <q-btn
          flat
          color="negative"
          icon="logout"
          label="Déconnexion"
          no-caps
          class="logout-btn full-width"
          :loading="isLoading"
          @click="logout"
        />
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
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 2rem);
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
  flex: 1;
  overflow-y: auto;
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

.menu-item {
  display: flex;
  flex-direction: column;
}

.menu-parent {
  display: flex;
  flex-direction: column;
}

.menu-parent-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-parent-text {
  flex: 1;
  text-decoration: none;
  color: inherit;
}

.menu-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  user-select: none;
}

.menu-arrow-expanded {
  transform: rotate(180deg);
}

.submenu {
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
  border-left: 2px solid var(--dark);
}

.submenu-link {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.submenu-link:hover {
  transform: translateX(3px);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 2px solid var(--dark);
}

.user-info {
  padding: 0.5rem;
  background-color: var(--dark);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.user-email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  cursor: help;
}

.logout-btn {
  margin-top: 0.5rem;
}

.logout-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

</style>

