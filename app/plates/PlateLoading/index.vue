<template>
	<Transition>
		<div id="plate--loading" v-if="isLoading">
			<SpinnerSample color="rgba(255,255,255,1)" />
		</div>
	</Transition>
</template>

<script setup>
import { useGlobalStore } from "@store";

const globalStore = useGlobalStore();
const isLoading = computed(() => {
	return globalStore.isLoading || globalStore.isPlateLoading;
});
</script>
<style lang="scss" scoped>
#plate--loading {
	position: fixed;
	left: 0;
	top: 0;
	width: var(--window-width);
	height: var(--window-height);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	z-index: 5000;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(100px);
	opacity: 1;
	transition: opacity 600ms ease;
	gap: 20px;
	font-weight: 700;
	&.v-leave-to,
	&.v-enter-from {
		opacity: 0;
	}
	&.v-enter-active {
		transition-duration: 100ms !important;
	}
}
</style>
