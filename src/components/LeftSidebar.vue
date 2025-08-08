<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class="space-y-3 mb-3">
            <div class="flex items-center justify-between px-3.5 pt-3.5">
                <div class="flex items-center space-x-1.5">
                    <i class="ph ph-waves"></i>
                    <div v-if="store.device?.name" class=" font-semibold text-base uppercase">{{ store.device?.name }}</div>
                    <div v-else class=" font-semibold text-base uppercase text-transparent bg-gray-800">NAMA STASIUN</div>
                    
                </div>
                <div class="flex items-center space-x-1.5">
                    <div
                        class="h-2.5 w-2.5 rounded-full"
                        :class="store.device?.isOnline ? 'bg-green-500' : 'bg-gray-500'"
                    ></div>
                    <div class="text-sm">
                        {{ store.device?.isOnline ? 'Online' : 'Offline' }}
                    </div>
                </div>
            </div>
            <div class="flex justify-between px-3.5">
                <div class=" text-2xl font-mono font-semibold">{{ store.waterStat?.lastWaterLevel?.toFixed(2) || 0 }} <span class="text-sm">mdpl</span></div>
                <div v-if="percentageChange < 0" class="flex items-center space-x-1.5 text-xs text-green-500">
                    <i class="ph ph-caret-down"></i>
                    <div class="font-mono">{{ percentageChange?.toFixed(2) }}%</div>
                    <div>(24 Jam)</div>
                </div>
                <div v-else class="flex items-center space-x-1.5 text-xs text-red-500">
                    <i class="ph ph-caret-up"></i>
                    <div>+{{ percentageChange?.toFixed(2) || 0 }}%</div>
                    <div>(24 Jam)</div>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-1.5 text-xs text-gray-400 px-3.5">
                <div class="border border-gray-800 rounded p-1.5 text-center">
                    <div>Max</div>
                    <div class="text-red-500">{{ store.waterStat?.maxWaterLevel?.toFixed(2) || 0 }} cm</div>
                </div>
                <div class="border border-gray-800 rounded p-1.5 text-center">
                    <div>Rata-rata</div>
                    <div class="text-yellow-500">{{ store.waterStat?.avgWaterLevel?.toFixed(2) || 0 }} cm</div>
                </div>
                <div class="border border-gray-800 rounded p-1.5 text-center">
                    <div>Min</div>
                    <div class="text-green-500">{{ store.waterStat?.minWaterLevel?.toFixed(2) || 0 }} cm</div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-5 text-base px-3.5 pb-3.5">
                <div class="border-b-4 border-sky-500 flex justify-between">
                    <div class="text-xs text-gray-400">Kecepatan</div>
                    <div class="flex space-x-1.5"><span class="font-mono">{{ store.realTimeFlowRate?.toFixed(2) || 0 }}</span><span class=" text-xs font-light text-gray-400">m/s</span></div>
                </div>
                <div class="border-b-4 border-teal-500 flex  justify-between">
                    <div class="text-xs text-gray-400">Debit</div>
                    <div class="flex space-x-1.5"><span class="font-mono">{{ store.instantTraffic?.toFixed(2) || 0 }}</span><span class=" text-xs font-light text-gray-400">m³/s</span></div>
                </div>
            </div>
        </div>
        <div class="h-full overflow-y-scroll hover-scroll space-y-5">
            <div class="w-full px-3.5">
                <div class="flex items-end justify-between mb-1.5">
                    <div class="flex items-center space-x-1.5 text-sm"> <i class="ph ph-cell-tower"></i> <div>GSM Seluler</div></div>
                    <div class="flex items-end space-x-2">
                        <div>{{ getOperatorName(store.gsm?.opernum) }}</div>
                        <div>{{ getConnectionType(store.gsm?.conntype) }}</div>
                        <div class="flex items-end space-x-0.5 pb-1">
                            <div v-for="n in 4" :key="n" class="w-1" :class="[{'h-1':n==1, 'h-2': n==2, 'h-3': n==3, 'h-4':n==4}, mapRSSItoLevel(store?.gsm?.rssi) >= n ? 'bg-green-500': 'bg-gray-500']"></div>
                        </div>
                    </div>
                </div>
                <div class="w-full border border-gray-800 rounded overflow-hidden">
                    <div class="bg-gray-900 w-full flex items-center justify-between px-3 py-1.5">
                        <div>Penggunaan data</div>
                        <button @click="getQuota" class="text-orange-50 cursor-pointer text-xs flex items-center justify-center bg-orange-600 hover:bg-orange-700 px-1 py-0.5 rounded-xs">Cek Kuota</button>
                    </div>
                    <table class="w-full">
                        <tbody class="divide-y divide-gray-900 text-xs">
                            <tr>
                                <td class="px-3 py-1.5">Hari ini</td>
                                <td class="px-3 py-1.5 text-right">{{ currentMobileUsageToMB(store.mobile?.usage) }}</td>
                            </tr>
                            <tr>
                                <td class="px-3 py-1.5">Kemarin</td>
                                <td class="px-3 py-1.5 text-right">{{ currentMobileUsageToMB(store.mobile?.yesterday) }}</td>
                            </tr>
                            <tr>
                                <td class="px-3 py-1.5">7 hari terakhir</td>
                                <td class="px-3 py-1.5 text-right">{{ currentMobileUsageToMB(store.mobile?.total7d) }}</td>
                            </tr>
                            <tr>
                                <td class="px-3 py-1.5">30 hari terakhir</td>
                                <td class="px-3 py-1.5 text-right">{{ currentMobileUsageToMB(store.mobile?.total30d) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="px-3">
                <div class="flex items-center justify-between border-b border-gray-800">
                    <div class="flex items-center space-x-1.5 mb-1.5"><i class="ph ph-solar-panel"></i><span>Solar Panel</span></div>
                    <div class="text-xs text-yellow-500">Powered by Solar Nusantara</div>
                </div>
                <div class="grid grid-cols-5 pt-2 gap-1.5">
                    <div class="col-span-1 border-2 mt-3 rounded-lg border-gray-700 flex items-center justify-center relative p-0.5">
                        <div class="w-full h-full relative overflow-hidden rounded flex items-center justify-center z-20 bg-gray-800">
                            <div class="absolute bottom-0 w-full bg-green-500/80" :style="{height: store?.battery?.soc +'%'}"></div>
                            <div class="absolute flex items-center">
                                <div>{{store.battery?.soc}}%</div>
                            </div>
                        </div>
                        <div class="absolute -top-3 w-6 bg-gray-700 h-2.5 rounded-t"></div>
                    </div>
                    <div class="col-span-4 border border-gray-700 rounded overflow-hidden text-xs">
                        <div class="grid grid-cols-3 text-xs divide-x divide-gray-800">
                            <div>
                                <div class="w-full py-1 bg-purple-600 text-center">Panel Surya</div>
                                <div class="text-center p-1">{{ store.panelSurya?.voltage }} v</div>
                                <div class="text-center p-1">{{ store.panelSurya?.current }} A</div>
                                <div class="text-center p-1">{{ store.panelSurya?.power }} w</div>
                            </div>
                            <div>
                                <div class="w-full py-1 bg-blue-600 text-center">Baterai</div>
                                <div class="text-center p-1">{{ store.battery?.voltage }} v</div>
                                <div class="text-center p-1">{{ store.battery?.current }} A</div>
                                <div class="text-center p-1">{{ store.battery?.temperature }} &#8451;</div>
                            </div>
                            <div>
                                <div class="w-full py-1 bg-yellow-600 text-center">Beban</div>
                                <div class="text-center p-1">{{ store.load?.voltage }} v</div>
                                <div class="text-center p-1">{{ store.load?.current }} A</div>
                                <div class="text-center p-1">{{ store.load?.power }} w</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full bg-gray-900/70 p-3">
                <div class="flex items-center space-x-1.5 mb-1.5"><i class="ph ph-info"></i><span>STASIUN</span></div>
                <table class="w-full text-xs">
                    <tbody>
                        <tr>
                            <td class="text-gray-400 py-1" style="width: 30%">ID Perangkat</td>
                            <td class="py-1">{{ store.device?._id }}</td>
                        </tr>
                        <tr>
                            <td class="text-gray-400 py-1" style="width: 30%">Serial Number</td>
                            <td class="py-1">{{ store.device?.serialNumber }}</td>
                        </tr>
                        <tr>
                            <td class="text-gray-400 py-1" style="width: 30%">No GSM</td>
                            <td class="py-1">{{ store.device?.gsmNumber }}</td>
                        </tr>
                        <tr>
                            <td class="text-gray-400 py-1 flex items-start w-full" style="width: 30%">Alamat</td>
                            <td class="py-1">{{ store.device?.location?.address }}</td>
                        </tr>
                        <tr>
                            <td class="text-gray-400 py-1 flex items-start w-full" style="width: 30%">Elevasi</td>
                            <td class="py-1">{{ store.device?.elevasi }} mdpl</td>
                        </tr>
                        <tr>
                             <td class="text-gray-400 py-1 flex items-start w-full" style="width: 30%">Koordinat</td>
                            <td class="py-1">{{ store.device?.location?.coordinates[0] }} {{ store.device?.location?.coordinates[1] }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="flex-1/12 bg-gray-900 flex items-center">
            <button @click="showModalSetting=true" class="bg-blue-600 hover:bg-blue-700 text-blue-50 h-full w-full cursor-pointer flex items-center px-3">
                <i class="ph ph-gear mr-1.5"></i>
                <div>Pengaturan</div>
            </button>
        </div>

        <modal-setting :show="showModalSetting" @close="showModalSetting = false" />

        <modal :show="modalQuota">
            <div class=" w-2/6 bg-gray-900 rounded h-96 flex flex-col">
                <div class="m-3 bg-black h-full relative">
                    <div v-show="!isLoading" class="p-3">{{ message }}</div>
                    <div v-show="isLoading" class="h-full flex items-center justify-center bg-gray-800 top-0 absolute w-full">
                        <div class=" flex flex-col items-center justify-center space-y-3">
                            <div class="loader"></div>
                            <div>{{ message }}</div>
                        </div>
                    </div>
                </div>
                <div class="mx-3 mb-3 text-right">
                    <button @click="modalQuota=false" class="h-9 px-5 bg-blue-500 rounded cursor-pointer hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed" :disabled="isLoading">Tutup</button>
                </div>
            </div>
        </modal>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useDeviceStore } from '../store/device'
import ModalSetting from './ModalSetting.vue';
import Modal from './Modal.vue';
import axios from 'axios';
    const store = useDeviceStore()
    const percentageChange = computed(() => {
        if(!store.waterStat?.avgWaterLevel) return null
        return ((store.waterStat?.lastWaterLevel - store.waterStat?.avgWaterLevel) / store.waterStat?.avgWaterLevel) * 100
    })
    const operatorMap = {
        '51010': 'Telkomsel',
        '51011': 'Indosat Ooredoo',
        '51001': 'Indosat (lama)',
        '51021': 'XL Axiata',
        '51028': 'Smartfren',
        '51089': 'Tri (3 Indonesia)',
        '51008': 'Net1 Indonesia',
        '51009': 'PSN (Satelit Nusantara)',
        '51099': 'Kominfo (Testing)'
    }
    const getOperatorName = (operatorCode) => {
        return operatorMap[operatorCode] || 'Tidak dikenal';
    }

    const connectionTypes = [
        { type: 'gsm',      name: 'GSM',            generation: '2G' },
        { type: 'gprs',     name: 'GPRS',           generation: '2G' },
        { type: 'edge',     name: 'EDGE',           generation: '2.75G' },
        { type: 'umts',     name: 'UMTS (WCDMA)',   generation: '3G' },
        { type: 'hsdpa',    name: 'HSDPA',          generation: '3.5G' },
        { type: 'hsupa',    name: 'HSUPA',          generation: '3.5G' },
        { type: 'hspa',     name: 'HSPA',           generation: '3.5G' },
        { type: 'hspa+',    name: 'HSPA+',          generation: '3.75G' },
        { type: 'lte',      name: 'LTE',            generation: '4G' },
        { type: 'lte+',     name: 'LTE Advanced',   generation: '4.5G' },
        { type: 'nr',       name: 'NR (New Radio)', generation: '5G' },
        { type: '5g',       name: '5G',             generation: '5G' },
        { type: 'no signal',name: 'No Signal',      generation: '-' },
        { type: 'unknown',  name: 'Unknown',        generation: '-' }
    ]
    const getConnectionType = (connectionCode) => {
        const conn =  connectionTypes.filter(c => c.type === connectionCode || c.name === connectionCode)
        return conn[0]?.generation || "--"
    }

    const mapRSSItoLevel = (rssi) => {
        if (rssi == null) return 0 // jika tidak ada data
        if (rssi > -65) return 4
        if (rssi > -75) return 3
        if (rssi > -85) return 2
        if (rssi > -95) return 1
        return 0
    }

    const currentMobileUsageToMB = (usage) => {
        if (usage == null || isNaN(usage)) return '0 KB';

        // convert ke KB (asumsi input dalam byte)
        const kb = usage / 1000;

        if (kb < 1000) {
            return `${kb.toFixed(2)} KB`;
        }

        const mb = kb / 1000;
        if (mb < 1000) {
            return `${mb.toFixed(2)} MB`;
        }

        const gb = mb / 1000;
        return `${gb.toFixed(2)} GB`;
    };

    const showModalSetting = ref(false)

    const isLoading = ref(false)
    const message = ref('Mohon tunggu...')
    const modalQuota = ref(false)
    let interval

    const getQuota = async () => {
        isLoading.value = true
        modalQuota.value = true
        message.value = 'Mohon tunggu...'
        axios.post('/api/sms/quota/'+store.device?._id)
        .then(() => {
            message.value = 'Permintaan anda sedang diproses ..'
        })
        .catch(() => {
            isLoading.value = false
            message.value = '[error] Mohon maaf terjadi kesalahan koneksi, silahkan coba beberapa saat lagi!'
        })
        .finally(() => {
            interval = setTimeout(() => {
                isLoading.value = false
                message.value = '[error] Mohon maaf terjadi kesalahan koneksi, silahkan coba beberapa saat lagi!'
            }, 5000)
        })
    }
    watch(()=> modalQuota.value, (val)=> {
        if(!val) {
            message.value = ''
        }
    })
    watch(() => store.sms, (val) => {
        if(val) {
            clearTimeout(interval)
            isLoading.value = false
            message.value = val[0]?.message
        }
    }, {deep: true})

</script>