<template>
    <div class="fixed z-50 top-5 right-5">
        <transition-group tag="ul" enter-active-class="animate__animated animate__slideInDown animate__faster" leave-active-class="animate__animated animate__slideOutUp animate__faster" class="space-y-1.5">
            <li v-for="alert in alerts" :key="alert.id" class=" w-60 bg-gray-900 rounded overflow-hidden">
                <div class="grid grid-cols-7">
                    <div v-if="alert.type == 'success'" class="text-green-500 p-3 col-span-6 flex items-center">
                        <i class="ph ph-check-circle text-2xl"></i>
                        <div class="ml-2">{{ alert.message }}</div>
                    </div>
                    <div v-if="alert.type == 'error'" class="text-red-500 p-3 col-span-6 flex items-center">
                        <i class="ph ph-x-circle text-2xl"></i>
                        <div class="ml-2">{{ alert.message }}</div>
                    </div>
                    <div v-if="alert.type == 'warning'" class="text-yellow-500 p-3 col-span-6 flex items-center">
                        <i class="ph ph-warning-circle text-2xl"></i>
                        <div class="ml-2">{{ alert.message }}</div>
                    </div>
                    <div v-if="alert.type == 'info'" class="text-sky-500 p-3 col-span-6 flex items-center">
                        <i class="ph ph-info text-2xl"></i>
                        <div class="ml-2">{{ alert.message }}</div>
                    </div>
                    <div class=" col-span-1 bg-gray-700 flex items-center justify-center">
                        <button @click="remove(alert.id)" class="h-full w-full text-gray-400 hover:text-red-500 cursor-pointer"><i class="ph ph-x"></i></button>
                    </div>
                </div>
            </li>
        </transition-group>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAlertStore } from '../store/alert';
const alertStore = useAlertStore()
const alerts = computed(() => alertStore.alerts)

const remove = (id) => {
    alertStore.removeAlert(id)
}

</script>