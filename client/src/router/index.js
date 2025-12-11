import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomePage.vue'),
        },
        {
            path: '/job-alerts',
            name: 'job alerts',
            component: () => import('../views/Jobs/JobAlerts.vue'),
        },
        {
            path: '/job-details/:id',
            name: 'job details',
            component: () => import('../views/Jobs/JobDetails.vue'),
            meta: { hideInMenu: true },
        },
        {
            path: '/todo',
            name: 'todo',
            component: () => import('../views/Todo.vue'),
        },
        {
            path: '/tags',
            name: 'tags',
            component: () => import('../views/TagsPage.vue'),
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

export default router