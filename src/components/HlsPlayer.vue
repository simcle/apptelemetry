<template>
  <div ref="container" class="group relative w-full max-w-4xl mx-auto bg-black flex items-center justify-center h-full">
    <video
      ref="video"
      muted
      class="w-full"
    ></video>
    <div v-if="isLoading" class="absolute bg-gray-950 inset-0 z-10 flex items-center justify-center">Loading...</div>
    <div class="absolute top-1 right-0 z-10">
      <ul class="">
        <li v-for="(ch, i) in store.cctvs" :key="i" class="cursor-pointer px-1.5 py-0.5">
          <div @click="selectChannel(ch)" class="rounded px-1 py-0.5 cursor-pointer" :class="controlType == ch?.type ? 'bg-blue-500/50':'bg-gray-900/30'">ch {{ ch?.type }}</div>
        </li>
      </ul>
    </div>
    <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-300" 
          :class="isPlaying ? (isFullscreen ? (showControls ? 'opacity-100' : 'opacity-0')  // fullscreen → auto hide
                : 'opacity-0 group-hover:opacity-100')         // normal → hover
            : 'opacity-100'">
      <button @click="togglePlay" class="p-3 bg-gray-900/50 h-12 w-12 flex items-center justify-center rounded-full hover:bg-blue-500 cursor-pointer">
        <i v-if="!isPlaying" class="ph ph-play text-white text-3xl"></i>
        <i v-else class="ph ph-pause text-white text-3xl"></i>
      </button>
    </div>
    <div v-show="isPlaying && controlType == 'ptz'" class="absolute flex items-center left-0 bottom-0 p-5 ml-3 mb-1.5">
        <div class="relative flex items-center justify-center">
            <button class="flex items-center hover:text-blue-500 cursor-pointer">
                <i class="ph ph-circle"></i>
            </button>
            <button @mousedown="startPan('left')" @mouseup="stopMovement"  class="absolute cursor-pointer hover:bg-blue-500 flex items-center -left-5 p-px bg-gray-50/20 rounded">
                <i class="ph ph-caret-left"></i>
            </button>
            <button @mousedown="startPan('right')" @mouseup="stopMovement"  class="absolute cursor-pointer hover:bg-blue-500 flex items-center -right-5 p-px bg-gray-50/20 rounded">
                <i class="ph ph-caret-right"></i>
            </button>
            <button @mousedown="startTilt('up')" @mouseup="stopMovement" class="absolute cursor-pointer hover:bg-blue-500 flex items-center -top-5 p-px bg-gray-50/20 rounded">
                <i class="ph ph-caret-up"></i>
            </button>
            <button @mousedown="startTilt('down')" @mouseup="stopMovement" class="absolute cursor-pointer hover:bg-blue-500 flex items-center -bottom-5 p-px bg-gray-50/20 rounded">
                <i class="ph ph-caret-down"></i>
            </button>
        </div>
    </div>
    <div v-show="isPlaying && controlType == 'ptz'" class=" absolute bottom-1.5 flex items-center space-x-1.5">
        <button @mousedown="startZoom('out')" @mouseup="stopMovement" class="cursor-pointer p-0.5 bg-gray-50/20 hover:bg-blue-500 rounded flex items-center justify-center">
            <i class="ph ph-magnifying-glass-minus"></i>
        </button>
        <button @mousedown="startZoom('in')" @mouseup="stopMovement" class="cursor-pointer p-0.5 bg-gray-50/20 hover:bg-blue-500 rounded flex items-center justify-center">
            <i class="ph ph-magnifying-glass-plus"></i>
        </button>
    </div>
    <div class=" absolute bottom-1.5 right-3">
        <button 
          v-if="!isFullscreen" 
          @click="goFullscreen" 
          class="cursor-pointer p-0.5 bg-gray-50/20 hover:bg-blue-500 rounded flex items-center justify-center"
        >
          <i class="ph ph-corners-out"></i>
        </button>
        <button 
          v-else 
          @click="exitFullscreen" 
          class="cursor-pointer p-0.5 bg-gray-50/20 hover:bg-blue-500 rounded flex items-center justify-center"
        >
          <i class="ph ph-corners-in"></i>
        </button>
    </div>
  </div>
</template>

<script setup>
import {onBeforeMount, onMounted, ref, watch } from 'vue'
import Hls from 'hls.js'
import axios from 'axios'
import { useDeviceStore } from '../store/device'
const store = useDeviceStore()
const video = ref(null)
const container = ref(null)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const showControls = ref(false)
const isLoading = ref(false)

const controlType = ref(null)
const selectChannel = (val) => {
  isLoading.value = true
  controlType.value = val?.type
  streamURL.value = val?.url
}

const streamURL = ref('') //
watch(()=> store.cctvs, (val) => {
  console.log('hallo')
  selectChannel(val[0])
}, {immediate: true,deep: true})

watch(()=> streamURL.value, (val) => {
  startPlayer()
})
let hideTimeout = null

async function sendPTZ(pan, tilt, zoom) {
	const xml = `
	<PTZData>
		<pan>${pan}</pan>
		<tilt>${tilt}</tilt>
		<zoom>${zoom}</zoom>
	</PTZData>
	`
  const cctvIp = store.device?.cctvIp
	await axios.put(`/api/ptz/${cctvIp}`, xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	})
	reloadStream()
}

function startPan(direction) {
  	if (direction === 'left') sendPTZ(-20, 0, 0)
  	if (direction === 'right') sendPTZ(20, 0, 0)
}
function startTilt(direction) {
  	if (direction === 'up') sendPTZ(0, 20, 0)
  	if (direction === 'down') sendPTZ(0, -20, 0)
}
function stopMovement() {
  	sendPTZ(0, 0, 0)
}

function startZoom(direction) {
  	if (direction === 'in') sendPTZ(0, 0, 20)
  	if (direction === 'out') sendPTZ(0, 0, -20)
}

function goFullscreen() {
  	if (container.value.requestFullscreen) {
        container.value.requestFullscreen()
  	}
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
}



let hls = null

function startPlayer() {
  if(!streamURL.value) return
  if (hls) {
    hls.destroy()
    hls = null
  }

  hls = new Hls()
  hls.loadSource(streamURL.value)
  hls.attachMedia(video.value)

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    if(isPlaying.value) {
      video.value.play()
    }
  })

  hls.on(Hls.Events.ERROR, (event, data) => {
    console.warn('HLS error:', data)
    if (data.fatal) {
      console.log('Fatal error, reloading stream...')
      setTimeout(() => {
        startPlayer()
      }, 2000) // reload setelah 2 detik
    }
  })
  video.value.oncanplay = () => {
    isLoading.value = false   // loader hilang setelah siap play
  }
}

function reloadStream() {
  if(isPlaying.value) {
    startPlayer()
  }
}

onMounted(() => {
	startPlayer()
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
    showControls.value = true
  })
  window.addEventListener('mousemove', handleMouseMove)
})

onBeforeMount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

async function togglePlay() {
  if (!isPlaying.value) {
    await video.value.play()
    isPlaying.value = true
    reloadStream()
  } else {
    video.value.pause()
    isPlaying.value = false
  }
}
function handleMouseMove() {
  if (!isFullscreen.value) return
  showControls.value = true
  clearTimeout(hideTimeout)
  hideTimeout = setTimeout(() => {
    showControls.value = false
  }, 2500)
}

</script>

<style scoped>
.video-container {
	display: flex;
	justify-content: center;
	align-items: center;
	background: #000;
}

.video-element {
	width: 100%;
	max-width: 800px;
	background: #000;
}
</style>