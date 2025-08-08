<template>
    <div class="relative overflow-hidden">
        <form @submit.prevent="onSubmit">
            <div class="mb-3">
                <label class="text-gray-400" for="station">Nama Stasiun <span class="text-red-500">*</span></label>
                <div class="mt-1.5">
                    <input v-model="form.name" @keydown="errors.name = ''" :class="{'border-red-500': errors.name}" type="text" id="station" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="Nama stasiun" autocomplete="off">
                </div>
                <samp class="text-red-500 text-xs">{{ errors.name }}</samp>
            </div>
            <div class="grid grid-cols-2 gap-5">
                <div class="col-span-1">
                    <div class="mb-3">
                        <label class="text-gray-400" for="loggerTipe">Tipe Logger <span class="text-red-500">*</span></label>
                        <div class="mt-1.5">
                            <input v-model="form.logger.loggerType" @keydown="errors.loggerType = ''" :class="{'border-red-500':errors.loggerType}" type="text" id="loggerTipe" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="Tipe logger RUT605" autocomplete="off">
                        </div>
                        <span class="text-red-500 text-xs">{{  errors.loggerType }}</span>
                    </div>
                    <div class="mb-3">
                        <label class="text-gray-400" for="serialNumber">Serial Number <span class="text-red-500">*</span></label>
                        <div class="mt-1.5">
                            <input v-model="form.serialNumber" @keydown="errors.serialNumber = ''" :class="{'border-red-500':errors.serialNumber}" type="text" id="serialNumber" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="Serial Number 6000949067" autocomplete="off">
                        </div>
                        <span class="text-red-500 text-xs">{{ errors.serialNumber }}</span>
                    </div>
                    
                    <div class="mb-3">
                        <label class="text-gray-400" for="noGsm">No GSM <span class="text-red-500">*</span></label>
                        <div class="mt-1.5">
                            <input v-model="form.gsmNumber" @keydown="errors.gsmNumber = ''" :class="{'border-red-500':errors.gsmNumber}" type="text" id="noGsm" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="No GSM 085316677889" autocomplete="off">
                        </div>
                        <span class="text-red-500 text-xs">{{ errors.gsmNumber }}</span>
                    </div>
                </div>
                <div class="col-span-1">
                    <div class="mb-3">
                        <label class="text-gray-400" for="cctvIp">IP cctv <span class="text-red-500">*</span></label>
                        <div class="mt-1.5">
                            <input v-model="form.cctvIp" @keydown="errors.cctvIp = ''" :class="{'border-red-500':errors.cctvIp}" type="text" id="cctvIp" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="IP CCTV 192.168.0.64" autocomplete="off">
                        </div>
                        <span class="text-red-500 text-xs">{{ errors.cctvIp }}</span>
                    </div>
                    <div class="mb-3">
                        <label class="text-gray-400" for="loggerIp">IP Logger <span class="text-red-500">*</span></label>
                        <div class="mt-1.5">
                            <input v-model="form.logger.loggerIp" @keydown="errors.loggerIp = ''" :class="{'border-red-500':errors.loggerIp}" type="text" id="loggerIp" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="Alamat ip 192.168.2.1" autocomplete="off">
                        </div>
                        <span class="text-red-500 text-xs">{{ errors.loggerIp }}</span>
                    </div>
                    <div class="mb-3">
                        <label class="text-gray-400" for="sensorType">Tipe Sensor <span class="text-red-500">*</span></label>
                        <div class="mt-1.5">
                            <input v-model="form.sensorType" @keydown="errors.sensorType = ''" :class="{'border-red-500':errors.sensorType}" type="text" id="sensorType" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="Tipe Sensor FMR6001" autocomplete="off">
                        </div>
                        <span class="text-red-500 text-xs">{{ errors.sensorType }}</span>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="text-gray-400" for="address">Alamat <span class="text-red-500">*</span></label>
                <div class="mt-1.5">
                    <input v-model="form.location.address" @keydown="errors.address = ''" :class="{'border-red-500':errors.address}" type="text" id="address" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="Alamat lengkap" autocomplete="off">
                </div>
                <span class="text-red-500 text-xs">{{ errors.address }}</span>
            </div>
            <div class="grid grid-cols-3 gap-5 mb-3">
                <div>
                    <label class="text-gray-400" for="latitude">Elevasi ( mdpl )<span class="text-red-500">*</span></label>
                    <div class="mt-1.5">
                        <input v-model="form.elevasi" @keydown="errors.elevasi = ''" :class="{'border-red-500':errors.elevasi}" type="text" id="elevasi" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="20" autocomplete="off">
                    </div>
                    <span class="text-red-500 text-xs">{{ errors.elevasi }}</span>
                </div>
                <div>
                    <label class="text-gray-400" for="latitude">Garis Lintang ( latitude ) <span class="text-red-500">*</span></label>
                    <div class="mt-1.5">
                        <input v-model="form.location.coordinates[0]" @keydown="errors.latitude = ''" :class="{'border-red-500':errors.latitude}" type="text" id="latitude" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="-6.2000" autocomplete="off">
                    </div>
                    <span class="text-red-500 text-xs">{{ errors.latitude }}</span>
                </div>
                <div>
                    <label class="text-gray-400" for="longitude">Garis Bujur ( longitude ) <span class="text-red-500">*</span></label>
                    <div class="mt-1.5">
                        <input v-model="form.location.coordinates[1]" @keydown="errors.longitude = ''" :class="{'border-red-500':errors.longitude}" type="text" id="longitude" class="w-full h-9 px-3 bg-gray-950 border rounded focus:outline-none border-gray-700 placeholder:text-gray-700" placeholder="106.8167" autocomplete="off">
                    </div>
                    <span class="text-red-500 text-xs">{{ errors.longitude }}</span>
                </div>
            </div>
            <div class="text-right space-x-1.5">
                <button type="submit" class="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-blue-50 rounded cursor-pointer">Simpan</button>
            </div>
        </form>
        <div v-if="isLoading" class="flex items-center justify-center absolute z-50 w-full h-full top-0 left-0 bg-gray-700/30 backdrop-blur-[1px]">
            <div class="loader"></div>
        </div>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import axios from 'axios';
    import { useDeviceStore } from '../../store/device';
    import { useAlertStore } from '../../store/alert';
    const store = useDeviceStore()
    const alert = useAlertStore()
    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        }
    })
    
    const emit = defineEmits(['close', 'done'])

    const deviceId = ref(null)
    const form = ref({
        name: store.device?.name || '',
        serialNumber: store?.device?.serialNumber || '',
        logger: {
            loggerType: store.device?.logger?.loggerType || '',
            loggerIp: store.device?.logger?.loggerIp || ''
        },
        gsmNumber: store.device?.gsmNumber || '',
        cctvIp: store.device?.cctvIp || '',
        elevasi: store.device?.elevasi,
        location: {
            address: store?.device?.location?.address || '',
            coordinates: store.device?.location?.coordinates || []
        },
        sensorType: store.device?.sensorType || ''
    })
    watch(() => store.device, (newDevice) => {
        if(!newDevice) return
        deviceId.value = newDevice?._id
        form.value = {
            name: newDevice?.name || '',
            serialNumber: newDevice.serialNumber || '',
            logger: {
                loggerType: newDevice?.logger?.loggerType || '',
                loggerIp: newDevice?.logger?.loggerIp || ''
            },
            gsmNumber: newDevice?.gsmNumber || '',
            cctvIp: newDevice?.cctvIp || '',
            elevasi: newDevice?.elevasi || '',
            location: {
                address: newDevice?.location?.address || '',
                coordinates: newDevice?.location?.coordinates || []
            },
            sensorType: newDevice?.sensorType || ''
        }
    }, {
        immediate: true,
        deep: true
    })
    const errors = ref({})
    const isLoading = ref(false)
    const onSubmit = () => {
        errors.value = {}
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)){3}$/;
        if (!form.value.name.trim()) {
            errors.value.name = 'Nama stasiun wajib diisi';
        }

        if (!form.value.serialNumber.trim()) {
            errors.value.serialNumber = 'Serial Number wajib diisi';
        }

        if (!form.value.logger.loggerType.trim()) {
            errors.value.loggerType = 'Tipe logger wajib diisi';
        }

        if (!form.value.logger.loggerIp.trim()) {
            errors.value.loggerIp = 'IP Logger wajib diisi';
        }
        if (!ipRegex.test(form.value.logger.loggerIp)) {
            errors.value.loggerIp = 'IP Logger tidak valid';
        }

        if (!form.value.gsmNumber.trim()) {
            errors.value.gsmNumber = 'No GSM wajib diisi';
        }

        if(!form.value.cctvIp.trim()) {
            errors.value.cctvIp = 'IP cctv Wajib diisi'
        }
        if (!ipRegex.test(form.value.cctvIp)) {
            errors.value.cctvIp = 'IP CCTV tidak valid';
        }
        if(!form.value.elevasi.trim()) {
            errors.value.elevasi = 'Elevasi wajib diisi'
        }

        if (!form.value.location.address.trim()) {
            errors.value.address = 'Alamat wajib diisi';
        }

        if (!form.value.sensorType.trim()) {
            errors.value.sensorType = 'Tipe sensor wajib diisi';
        }

        // Validasi koordinat
        const latitude = form.value.location.coordinates[0] ?? '';
        const longitude = form.value.location.coordinates[1] ?? '';
        console.log(latitude)

        if (latitude === undefined || latitude === null || latitude === '') {
            errors.value.latitude = 'Garis lintang wajib diisi';
        } else if (isNaN(parseFloat(latitude))) {
            errors.value.latitude = 'Garis lintang harus berupa angka';
        }

        if (longitude === undefined || longitude === null || longitude === '') {
            errors.value.longitude = 'Garis bujur wajib diisi';
        } else if (isNaN(parseFloat(longitude))) {
            errors.value.longitude = 'Garis bujur harus berupa angka';
        }

        // Jika ada error, hentikan submit
        if (Object.keys(errors.value).length > 0) {
            return;
        }

        isLoading.value = true
        axios.put('/api/telemetry/'+deviceId.value, form.value)
        .then(() => {
            store.getDevice(deviceId.value)
            store.getAllDevice()
            alert.newAlert({message: 'Perubahan Perangkat berhasil disimpan', type: 'success'})
        })
        .catch(err => {
            if(err.response.status == 409) {
                errors.value.serialNumber = 'Serial number already exists'
            }
        })
        .finally(() => {
            isLoading.value = false
        })
    }
    const clearForm = () => {
        form.value = {
            name: '',
            serialNumber: '',
            logger: {
                loggerType: '',
                loggerIp: ''
            },
            gsmNumber: '',
            cctvIp: '',
            location: {
                address: '',
                coordinates: []
            },
            sensorType: ''
        }
    }
    const close = () => {
        clearForm()
        errors.value = {}
    }
</script>