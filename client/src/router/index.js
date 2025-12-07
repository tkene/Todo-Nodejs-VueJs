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
            path: '/tags',
            name: 'tags',
            component: () => import('../views/TagsPage.vue'),
        },
        {
            path: '/404',
            name: '404',
            component: () => import('../views/404.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
    ],
})

export default router