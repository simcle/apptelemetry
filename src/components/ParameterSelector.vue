<template>
    <div class="flex items-center space-x-1 bg-gray-800 p-1 rounded">
        <button v-for="option in options"
            :key="option.value"
            @click="selected = option.value"
            :class="[
                'px-1.5 py-1 text-xs rounded cursor-pointer text-gray-200',
                selected === option.value 
                ? ` ${option.color}`
                : 'hover:bg-gray-500'
            ]"
            >
            {{ option.label }}
        </button>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        default: () => [
            {label: 'Level', value: 'level', color: 'bg-orange-500'},
            {label: 'Kecepatan', value: 'kecepatan', color: 'bg-sky-500'},
            {label: 'Volume', value: 'volume', color: 'bg-teal-500'}
        ]
    }
})

const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
    selected.value = val
})

watch(selected, (val) => {
    emit('update:modelValue', val)
})

</script>