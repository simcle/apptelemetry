<template>
    <div class="flex flex-col h-full overflow-hidden">
        <div class=" h-72 bg-blue-500/25">
            <hls-player></hls-player>
        </div>
        <div class="overflow-hidden h-full max-h-full grid grid-rows-2">
            <!-- NOTIFIKASI -->
            <div class="row-span-1 h-full flex flex-col max-h-full overflow-hidden">
                <div class="flex items-center px-3 py-2.5 border-t border-b border-gray-800 space-x-1.5"><i class="ph ph-notification"></i> <span>NOTIFIKASI</span></div>
                <ul ref="refAlert" v-show="store.alerts.length > 0" class="text-xs h-full overflow-y-scroll hover-scroll">
                    <li v-for="(alert, i) in store.alerts" :key="i" class="px-3 py-1.5">
                        <div v-if="alert?.type === 'DEVICE ONLINE' || alert?.type === 'DEVICE OFFLINE'">
                            <div  class="flex items-center justify-between">
                                <div :class="alert?.color">PERINGATAN {{ alert?.type }}</div>
                                <div class="text-gray-500">{{ getRelativeTime(alert?.timestamp) }}</div>
                            </div>
                            <div class=" text-xs">
                                <div><span class="text-gray-400">Waktu :</span> {{ getFormatDate(alert?.timestamp) }}</div>
                                <div>{{ alert?.message }}</div>
                            </div>
                        </div>
                        <div v-else>
                            <div  class="flex items-center justify-between">
                                <div :class="alert?.color">PERINGATAN {{ alert?.type }}</div>
                                <div class="text-gray-500">{{ getRelativeTime(alert?.timestamp) }}</div>
                            </div>
                            <div class=" text-xs">
                                <div><span class="text-gray-400">Ketinggian air :</span> {{ alert?.level }}</div>
                                <div><span class="text-gray-400">Waktu :</span> {{ getFormatDate(alert?.timestamp) }}</div>
                                <div>{{ alert?.message }}</div>
                            </div>
                        </div>
                    </li>
                </ul>
                <div v-show="store.alerts.length == 0" class="flex items-center justify-center h-full w-full">
                    <div class="flex items-center justify-center flex-col">
                        <div>
                            <i class="ph ph-notification text-3xl text-gray-800"></i>
                        </div>
                        <div class="text-gray-700 text-base">Belum ada notifikasi</div>
                    </div>
                </div>
            </div>
            <!-- SMS INBOX -->
            <div class="row-span-1 h-full flex flex-col max-h-full overflow-hidden">
                <div class="flex items-center px-3 py-2.5 border-t border-b border-gray-800 space-x-1.5"><i class="ph ph-envelope-simple"></i><span>KOTAK MASUK SMS</span></div>
                <ul ref="refSms" v-show="store.sms.length > 0" class="text-xs h-full overflow-y-scroll hover-scroll divide-gray-800 p-1.5 space-y-1.5">
                    <li v-for="(sms, i) in store.sms" :key="i" class="px-3 py-1.5 bg-gray-900 rounded">
                        <div class="flex items-center justify-between"><span>{{ sms?.sender }}</span> <span class="text-gray-500" style="font-size: 9px;">{{ getFormatDate(sms?.createdAt) }}</span></div>
                        <div class=" text-xs text-gray-400">
                           {{ sms?.message }}
                        </div>
                    </li>
                </ul>
                <div v-show="store.sms.length == 0" class="flex items-center justify-center h-full w-full">
                    <div class="flex items-center justify-center flex-col">
                        <div>
                            <i class="ph ph-envelope-simple text-3xl text-gray-800"></i>
                        </div>
                        <div class="text-gray-700 text-base">Belum ada notifikasi</div>
                    </div>
                </div>
            </div>
          
        </div>
    </div>
</template>

<script setup>
import HlsPlayer from './HlsPlayer.vue';
import { useDeviceStore } from '../store/device';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/id'
import { onMounted, onUnmounted, ref, watch } from 'vue';

    const store = useDeviceStore()
    dayjs.extend(relativeTime)
    dayjs.locale('id')

    const refAlert = ref(null)
    watch(()=> store.alerts, () => {
        refAlert.value.scrollTo({ top: 0, behavior: 'smooth' })
    }, {deep: true})

    const refSms = ref(null)
    watch(()=> store.sms, () => {
        refSms.value.scrollTo({top: 0, behavior: 'smooth'})
    }, {deep: true})
    
    const now = ref(dayjs())
    const updateNow = () => {
        now.value = dayjs()
    }
    let interval 
    onMounted(() => {
        interval = setInterval(updateNow, 30000)
    })
    onUnmounted(() => {
        clearInterval(interval)
    })
    const getRelativeTime = (time) => {
        return dayjs(time).from(now.value)
    }
    const getFormatDate = (t) => {
        return dayjs(t).format('DD/MM/YY HH:mm')
    }
</script>