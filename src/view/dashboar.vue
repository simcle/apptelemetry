<template>
    <div class="grid grid-cols-12 divide-x divide-gray-800 h-full overflow-hidden">
			<div class="col-span-3 h-full flex flex-col overflow-hidden">
				<left-sidebar></left-sidebar>
			</div>
			<div class="col-span-6 h-full flex flex-col overflow-hidden">
				<main-chart></main-chart>
			</div>
			<div class="col-span-3 h-full flex flex-col overflow-hidden">
				<right-sidebar></right-sidebar>
			</div>
		</div>
</template>

<script setup>
import LeftSidebar from '../components/LeftSidebar.vue';
import MainChart from '../components/MainChart.vue';
import RightSidebar from '../components/RightSidebar.vue';

</script>