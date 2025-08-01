import axios from "axios";
import { defineStore } from "pinia";
import { useDeviceStore } from "./device";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token')
    }),
    getters: {
        isAuth: (state) => !!state.token
    },
    actions: {
        async login (email, password) {
            const device = useDeviceStore()
            try {
                const response = await axios.post('/api/auth/login', {email, password})
                const { token, user} = response.data
                this.token = token
                localStorage.setItem('token', token)
                axios.defaults.headers.common['Authorization'] = `Beare ${token}`
                await device.connect()
                await device.getAllDevice()
                await device.getDevice()
            } catch (error) {
                throw error
            }
        },
        logout () {
            this.token = ''
            this.user = ''
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
        }
    }
})