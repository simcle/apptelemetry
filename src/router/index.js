import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../view/dashboar.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../view/login.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const store = useAuthStore()
    if(to.meta.auth && !store.isAuth) {
        next('/login')
    } else if (to.path === '/login' && store.isAuth) {
        next('/')
    } else {
        next()
    }
})

export default router