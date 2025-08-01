<template>
    <div>
        <form @submit.prevent="onSubmit">
            <div v-for="(item, i) in levels" :key="i" class="mb-5">
                <div :class="item.color" class="text-base font-semibold mb-px">{{ item.name }}</div>
                <div class="grid grid-cols-2 gap-5">
                    <div>
                        <div class="text-gray-400 mb-1.5">Nilai Minimal</div>
                        <input v-model.number="item.min" type="number" step="any" class="h-9 px-3 outline-none bg-gray-950 w-full border rounded border-gray-700">
                    </div>
                    <div>
                        <div class="text-gray-400 mb-1.5">Nilai Maksimal</div>
                        <input v-model.number="item.max" type="number" step="any" class="h-9 px-3 outline-none bg-gray-950 w-full border rounded border-gray-700">
                    </div>
                </div>
            </div>
            <div class="text-right space-x-1.5">
                <button type="submit" class="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-blue-50 rounded cursor-pointer">Simpan</button>
            </div>
        </form>
        <div v-if="isLoding" class="flex items-center justify-center absolute z-50 w-full h-full top-0 left-0 bg-gray-700/30 backdrop-blur-[1px]">
            <div class="loader"></div>
        </div>
    </div>
</template>

<script setup>
import {ref, watch } from 'vue';
import { useDeviceStore } from '../../store/device';
import { useAlertStore } from '../../store/alert';
const alert = useAlertStore()
import axios from 'axios';
    const store = useDeviceStore()

    const levels = ref([
        {
            name: 'AMAN',
            min: 0,
            max: 0,
            color: 'text-green-500'
        },
        {
            name: 'WASPADA',
            min: 0,
            max: 0,
            color: 'text-blue-500'
        },
        {
            name: 'SIAGA',
            min: 0,
            max: 0,
            color: 'text-yellow-500'
        },
        {
            name: 'AWAS',
            min: 0,
            max: 0,
            color: 'text-red-500'
        },
        
    ])
    const deviceId = ref(null)
    watch(() => store.device, (newDevice) => {
        if(!newDevice) return
        deviceId.value = newDevice._id
    }, {
        immediate: true,
        deep: true
    })
    
    watch(() => store.waterCategory, (existingLevels) => {
        if (!existingLevels?.length) return

        levels.value = levels.value.map((item) => {
            const matched = existingLevels.find((e) => e.name === item.name)
            return matched ? { ...item, min: matched.min, max: matched.max } : item
        })
    }, { 
        immediate: true, 
        deep: true 
    })

    const isLoding = ref(false)
    const onSubmit = async () => {
        try {
            const payload = levels.value.map((lvl) => ({
                deviceId: deviceId.value,
                name: lvl.name,
                min: lvl.min,
                max: lvl.max
            }))
            isLoding.value = true
            axios.post('/api/threshold', payload)
            .then(() => {
                store.getDevice(deviceId.value)
                alert.newAlert({message: 'Perubahan Level Peringatan berhasil disimpan', type: 'success'})
            })
            .catch(error => {
                alert.newAlert({message: 'Error', type: 'error'})
            })
            .finally(() => {
                isLoding.value = false
            })
        } catch (error) {
            
        }
    }
</script>