<template>
    <div class="inset-0 fixed h-screen w-full bg-gray-950 z-50 flex items-center justify-center">
        <div class="w-full px-56 flex flex-row items-center justify-between space-x-32">
            <div class="flex-1 w-auto">
                <div class="text-3xl font-semibold space-x-3 mb-1.5"><span class="text-yellow-500">AWLR</span><span class="text-blue-500">MONITORING</span></div>
                <div>Sistem monitoring AWLR untuk memantau ketinggian muka air sungai secara real-time, menerima peringatan dini banjir, dan melihat status perangkat secara terpusat.</div>
            </div>
            <div>
                <div class="border border-gray-800 rounded p-5 w-96 bg-gray-900">
                    <div class="text-center text-xl mb-1.5">Masuk</div>
                    <div class="text-center text-gray-400 mb-5">Silakan login untuk mengakses dashboard monitoring.</div>
                    <form @submit.prevent="onSubmit">
                        <div class="mb-5">
                            <div class="mb-1.5 text-gray-400">Email</div>
                            <input v-model="form.email" @keydown="errors.email = ''" :class="{'border-red-500':errors.email}" type="email" name="email" class="h-9 w-full border rounded  border-gray-700 bg-gray-950 px-3 focus:outline-none placeholder:text-gray-700" placeholder="email admin@example.com" autocomplete="off">
                            <span class="text-red-500 text-xs">{{ errors.email }}</span>
                        </div>
                        <div class="mb-5">
                            <div class="mb-1.5 text-gray-400">Password</div>
                            <input v-model="form.password" @keydown="errors.password = ''" :class="{'border-red-500':errors.password}" type="password" name="email" class="h-9 w-full border rounded  border-gray-700 bg-gray-950  px-3 focus:outline-none placeholder:text-gray-700" placeholder="password" autocomplete="off">
                            <span class="text-red-500 text-xs">{{ errors.password }}</span>
                            <div v-if="errors.response" class="text-red-500 text-xs mt-1.5">{{ errors.response }}</div>
                        </div>
                        <button class="h-9 w-full bg-blue-600 hover:bg-blue-500 cursor-pointer rounded mb-5">Masuk</button>
                    </form>
                </div>
                <div class="text-center text-gray-500 mt-5 text-xs">
                    <div>Nusa Dinamika Persada @2025</div>
                </div>
            </div>
        </div>
        <div v-if="isLoading" class="h-full w-full bg-gray-800/50 absolute backdrop-blur-[1px] flex items-center justify-center">
            <div class="loader"></div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter()
const store = useAuthStore()
const isLoading = ref(false)
const form = ref({
    email: '',
    password: ''
})

const errors = ref({})

const onSubmit =  async () => {
    errors.value = {}
    if(!form.value.email.trim()) {
        errors.value.email = 'Email wajib diisi'
    }
    if(!form.value.password.trim()) {
        errors.value.password = 'Password wajib diisi'
    }

    if(Object.keys(errors.value).length > 0) {
        return
    }

    try {
        isLoading.value = true
        await store.login(form.value.email, form.value.password)
        router.push('/')
    } catch (error) {
        if(error.response.status == 400) {
            errors.value.response = error.response.data.message
        }
    } finally {
        isLoading.value = false
    }

}


</script>