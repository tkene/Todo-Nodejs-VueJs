import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, guestGuard } from './guards'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('../views/Login.vue'),
            meta: {
                requiresAuth: false,
                hideInMenu: true
            }
        },
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomePage.vue'),
            meta: {
                icon: 'home',
                requiresAuth: true
            },
        },
        {
            path: '/job-alerts',
            name: 'job alerts',
            component: () => import('../views/Jobs/JobAlerts.vue'),
            meta: {
                icon: 'work',
                requiresAuth: true
            },
        },
        {
            path: '/job-details/:id',
            name: 'job details',
            component: () => import('../views/Jobs/JobDetails.vue'),
            meta: { 
                hideInMenu: true,
                requiresAuth: true
            },
        },
        {
            path: '/todo',
            name: 'todo',
            component: () => import('../views/Todo.vue'),
            meta: {
                icon: 'checklist',
                requiresAuth: true
            },
        },
        {
            path: '/TheGames',
            name: 'TheGames',
            meta: {
                icon: 'beach_access',
                requiresAuth: true
            },
            children: [
                {
                    path: 'Wordle',
                    name: 'Wordle',
                    component: () => import('../views/TheGames/Wordle.vue'),
                    meta: {
                        icon: 'wordle',
                        requiresAuth: true
                    },
                },
            ],
        },
        {
            path: '/analyse-pmu',
            name: 'analyse-pmu',
            component: () => import('../views/AnalysePmu.vue'),
            meta: {
                icon: 'analytics',
                requiresAuth: true
            },
        },
        {
            path: '/configuration',
            name: 'configuration',
            redirect: '/configuration/tags',
            meta: {
                title: 'Configuration',
                icon: 'settings',
                requiresAuth: true
            },
            children: [
                {
                    path: 'tags',
                    name: 'tags',
                    component: () => import('../views/TagsPage.vue'),
                    meta: {
                        icon: 'label',
                        requiresAuth: true
                    },
                },
            ],
        },
        {
            path: '/404',
            name: '404',
            component: () => import('../views/404.vue'),
            meta: { hideInMenu: true }, // Cette route ne s'affichera pas dans le menu
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
    ],
})

// Guards de navigation
router.beforeEach(authGuard)
router.beforeEach(guestGuard)

export default router
