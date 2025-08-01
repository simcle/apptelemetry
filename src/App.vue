<template>
	<div class="fixed h-screen w-full flex flex-col overflow-hidden bg-black text-gray-300 inset-0 text-sm">
		<!-- NAVBAR -->
		<div v-if="auth.isAuth" class="h-14 border-b border-gray-800 bg-gray-900 w-full grid grid-cols-12">
			<div class="col-span-3 h-full flex items-center px-3">
				<div class="text-xl"><span class="font-semibold text-yellow-500">AWLR</span> <span class="text-blue-500">MONITORING</span></div>
			</div>
			<div class="col-span-6 h-full flex items-center justify-center px-3">
				<div class="relative flex items-center">
					<input @click="showSerchBox = true" type="text" name="search" class=" h-9 w-96 border rounded border-gray-700 focus:outline-none pl-9 pr-3 bg-gray-950" autocomplete="off" placeholder="Cari nama stasiun pos">
					<div class="absolute left-3 text-gray-500 flex items-center">
						<i class="ph ph-magnifying-glass text-lg"></i>
					</div>
				</div>
				<search-box 
					:show="showSerchBox" 
					:items="device.devices" 
					@close="showSerchBox = false" 
					@select="onSelect"
				/>
			</div>
			<div class="col-span-3 h-full flex items-center justify-end px-3">
				<div class="pr-3 font-mono text-xs">{{ currentTime }}</div>
				<!-- <button class="rounded text-gray-400 hover:text-gray-300 flex items-center cursor-pointer">
					<i class="ph ph-corners-out text-2xl"></i>
				</button> -->
				<div ref="dropdownRef" class="h-full">
					<button @click="showDropdown = !showDropdown" class="h-full px-3 hover:bg-gray-700 cursor-pointer z-30 flex items-center relative">
						<i class="ph ph-user-circle text-2xl text-gray-400"></i>
						<ul v-if="showDropdown" class="absolute w-52 z-20 top-14 bg-gray-800 rounded border border-gray-700 right-0 py-1.5">
							<li @click="onAddDevice" class=" py-2 hover:bg-gray-700/50 flex items-center space-x-1.5 text-left px-3">
								<i class="ph ph-plus-circle text-lg"></i><span>Tambah perangkat</span>
							</li>
							<li @click="signout" class=" py-2 hover:bg-gray-700/50 flex items-center space-x-1.5 text-left px-3">
								<i class="ph ph-power text-lg"></i><span>Keluar</span>
							</li>
						</ul>
					</button>
				</div>
			</div>
		</div>

		<router-view v-slot="{ Component }">
			<transition name="fade" mode="out-in">
				<component :is="Component" />
			</transition>
		</router-view>

		<modal-add-device :show="showModalAddDevice" @done="onDoneAddDevice" @close="showModalAddDevice = false" />
		<div v-if="device.isLoading" class="absolute h-full w-full bg-white/20 backdrop-blur-[1px] top-0 left-0 flex items-center justify-center">
			<div class="loader"></div>
		</div>
		<base-alert />
	</div>
</template>

<script setup>
	import BaseAlert from './components/BaseAlert.vue';
	import SearchBox from './components/SearchBox.vue';
	import ModalAddDevice from './components/ModalAddDevice.vue';
	import { useDeviceStore} from './store/device';
	import { useAuthStore } from './store/auth';
	import { onMounted, onUnmounted, ref, watch } from 'vue';
	import { useRouter } from 'vue-router';
	import dayjs from 'dayjs';
	import 'dayjs/locale/id'
	dayjs.locale('id')

	const router = useRouter()
	const auth = useAuthStore()
	const device = useDeviceStore()
	const currentTime = ref(dayjs().format('dddd, DD MMM YYYY HH:mm:ss'))
	let timer = null

	onMounted(async () => {
		timer = setInterval(() => {
			currentTime.value = dayjs().format('dddd, DD MMM YYYY HH:mm:ss')
		})
		document.addEventListener('click', onClickOutside)
		if(auth.isAuth) {
			await device.connect()
			await getData()
			await getAllDevice()
		}
	})
	onUnmounted(() => {
		clearInterval(timer)
		document.removeEventListener('click', onClickOutside)
	})
	
	
	const showDropdown = ref(false)
	const dropdownRef = ref(null)

	const showModalAddDevice = ref(false)
	const onAddDevice = () => {
		showModalAddDevice.value = true
	}
	const onDoneAddDevice = (id) => {
		getData(id)
		getAllDevice()
	}

	const showSerchBox = ref(false)
	const onSelect = (item) => {
		if(item) getData(item.id)
	}
	const getAllDevice = async () => {
		await device.getAllDevice()
	}

	const getData = async (id) => {
		await device.getDevice(id)
	}

	const onClickOutside = (e) => {
		if (showDropdown.value && dropdownRef.value && !dropdownRef.value.contains(e.target)) {
			showDropdown.value = false
		}
	}
	const signout = () => {
		auth.logout()
		router.push('/login')
	}
</script>

