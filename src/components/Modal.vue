<template>
    <div>
        <transition name="modal" mode="out-in">
            <div v-show="show" class="fixed inset-0 z-30 overflow-y-auto">
                <div class="flex justify-center">
                    <div class="fixed inset-0 bg-white/15 backdrop-blur-[1px] transition-opacity" aria-hidden="true"></div>
                    <transition name="slide" >
                        <div v-show="show" class="transform flex justify-center my-8 w-full z-10">
                            <slot></slot>
                        </div>
                    </transition>
                </div>
            </div>
        </transition>
    </div>
</template>
<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
})
</script>