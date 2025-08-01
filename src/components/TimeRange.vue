<template>
    <div class="flex items-center space-x-1 bg-gray-800 p-1 rounded">
        <button v-for="option in options" 
            :key="option.value"
            @click="selected = option.value"
            :class="[
                'px-1.5 py-1 text-xs rounded cursor-pointer',
                selected === option.value 
                ? 'bg-gray-700 border border-gray-400'
                : 'hover:bg-gray-700 border border-transparent'
            ]"
            >
            {{ option.label }}
        </button>
        <div class="border-l h-3.5  border-gray-700"></div>
        <div ref="menuRef" class="relative">
            <button @click="toggleDownlowd" class="px-1.5 py-1 rounded cursor-pointer hover:bg-gray-700 flex items-center justify-center relative">
                <i class="ph ph-dots-three text-lg"></i>
            </button>
            <div v-show="showDownload" class="absolute bg-gray-800 top-8 z-10 -right-1 rounded">
                <ul class="py-1.5">
                    <li @click="handleDownload('grafik')" class="px-3 py-1.5 whitespace-nowrap flex items-center space-x-2.5 hover:bg-gray-700 cursor-pointer"><i class="ph ph-file-pdf text-lg"></i><div>Unduh grafik</div></li>
                    <li @click="handleDownload('data')" class="px-3 py-1.5 whitespace-nowrap flex items-center space-x-2.5 hover:bg-gray-700 cursor-pointer"><i class="ph ph-file-xls text-lg"></i><div>Unduh data</div></li>
                </ul>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, watch} from 'vue'
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        default: () => [
            {label: 'Waktu nyata', value: 'real'},
            {label: '1H', value: '1D'},
            {label: '7H', value: '7D'},
            {label: '1B', value: '1B'},
            {label: '3B', value: '3B'},
            {label: '1T', value: '1T'}
        ]
    }
})

const emit = defineEmits(['update:modelValue', 'download'])
const selected = ref(props.modelValue)
const showDownload = ref(false)
const menuRef = ref(null)
watch(() => props.modelValue, (val) => {
    selected.value = val
})

watch(selected, (val) => {
    emit('update:modelValue', val)
})

const toggleDownlowd = () => {
    showDownload.value = !showDownload.value
}

const handleDownload = (type) => {
    emit('download', type)
    showDownload.value = false
}

const handleClickOutside = (e) => {
    if (menuRef.value && !menuRef.value.contains(e.target)) {
        showDownload.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeMount(() => {
    document.removeEventListener('click', handleClickOutside)
})

</script>