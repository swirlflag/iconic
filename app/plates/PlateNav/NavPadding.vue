<template>
	<div class="plate--nav__padding" :style="{ height: navtopHeight + 'px' }"></div>
</template>
<script setup>
import { useNavStore } from "@store";
const navStore = useNavStore();
const navtopHeight = computed(() => {
	return navStore.navtopHeight;
});
</script>
<style></style>
<style lang="scss" scoped>
.plate--nav__padding {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	opacity: 0;
	span {
		display: inline-block;
		box-sizing: border-box;
		width: 100%;
		height: auto;
	}
}
</style>
