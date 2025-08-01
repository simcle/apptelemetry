<template>
    <div v-if="show" @click.self="close" @keydown.esc="close" class="fixed inset-0 bg-white/20 backdrop-blur-[2px] z-10 flex items-start justify-center p-10">
        <div class="w-full max-w-xl bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div class="flex items-center border-b border-gray-800 relative">
                <input 
                    name="search"
                    type="text"
                    ref="searchInput"
                    v-model="query"
                    @keydown.down.prevent="moveSelection(1)"
                    @keydown.up.prevent="moveSelection(-1)"
                    @keydown.enter.prevent="selectItem"
                    class="w-full h-10 pl-10 pr-3 focus:outline-none text-xl placeholder:text-gray-600"
                    placeholder="Cari nama stasiun AWLR..."
                    autocomplete="off"
                >
                <div class="absolute left-3 flex items-center">
                    <i class="ph ph-magnifying-glass text-lg text-gray-400"></i>
                </div>
            </div>
            <ul class=" max-h-96 overflow-y-auto divide divide-gray-700">
                <li v-for="(item, index) in filteredItems" 
                    :key="item.id"
                    @click="hanldeSelect(item)"
                    :class="['px-3 py-1.5 cursor-pointer', index === selectedIndex ? 'bg-blue-600 text-blue-50':'hover:bg-gray-800']"
                >
                    <div class="text-base font-semibold">{{ item.label }}</div>
                    <div class="text-xs text-gray-400 font-normal">{{ item.address }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps({
    show: {type: Boolean, default: false},
    items: {type: Array, default: () => []}
})

const emit = defineEmits(['close', 'select'])

const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref(null)

const filteredItems = computed(() => {
    return props.items.filter(i => {
        return i.label?.toLowerCase().includes(query.value.toLowerCase())
    })
})

watch(() => props.show, (newVal) => {
    if(newVal) {
        query.value = ''
        selectedIndex.value = 0
        nextTick(() => {
            searchInput.value?.focus()
        })
    }
})

const moveSelection = (delta) => {
    const max = filteredItems.value.length - 1
    selectedIndex.value = Math.min(Math.max(selectedIndex.value + delta, 0), max)
}

const selectItem = () => {
    const item = filteredItems.value[selectedIndex.value]
    if(item) hanldeSelect(item)
}

const hanldeSelect = (item) => {
    emit('select', item)
    close()
}

const close = () => {
    emit('close')
}

</script>