import { createApp } from 'vue'
import router from './router'
import axios from 'axios'
import { createPinia } from 'pinia'
import { useAuthStore } from './store/auth'
import './style.css'
import '@phosphor-icons/web/regular'

import App from './App.vue'
axios.defaults.baseURL = import.meta.env.VITE_API_URL

const app = createApp(App)
const token = localStorage.getItem('token')
if(token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
axios.interceptors.response.use(
    response => response,
    error => {
        if(error.response && error.response.status === 401) {
            const auth = useAuthStore()
            auth.logout()
            router.push('/login')
            return Promise.reject(error)
        }
        return Promise.reject(error)
    }
)
app.use(createPinia())
app.use(router)
app.mount('#app')
