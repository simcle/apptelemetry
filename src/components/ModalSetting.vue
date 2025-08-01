<template>
    <div>
        <modal :show="show">
            <div class=" bg-gray-900 w-2/4 rounded">
                <div class="flex items-center justify-between">
                    <div class="px-5 py-2.5 text-base font-semibold">Pengaturan</div>
                    <button @click="close" class="px-5 py-2.5 flex items-center justify-center hover:text-red-500 cursor-pointer"><i class="ph ph-x cursor-pointer"></i></button>
                </div>
                <div class="px-5 pb-5 pt-2.5">
                    <div class="flex border-b border-gray-800 mb-5">
                        <button v-for="(tab, i) in tabs" :key="i"
                            @click="activeTab = i"
                            :class="[' flex-1 pb-2 px-5 text-center cursor-pointer', activeTab == i ? 'border-b-2 border-yellow-500 font-semibold': ' border-b-2 border-transparent text-gray-400 hover:text-gray-300']"
                        >
                            {{ tab.label }}
                        </button>
                    </div>
                    <div>
                        <component :is="tabs[activeTab].component" />
                    </div>
                </div>
            </div>
        </modal>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import Modal from './Modal.vue'
    import Device from './tabs/Device.vue';
    import WarningLevel from './tabs/WarningLevel.vue';
    const emit = defineEmits(['close'])
    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        }
    })
    const tabs = [
        { label: 'Perangkat', component: Device},
        { label: 'Level Peringatan', component: WarningLevel},
    ]
    const activeTab = ref(0)
    const close = () => {
        emit('close')
    }
</script>