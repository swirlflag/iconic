<template>
	<div id="plate--page">
		<slot></slot>
	</div>
</template>
<script setup>
import { useGlobalStore } from "@store";
const globalStore = useGlobalStore();
const _defaultLoadingTime = async () => {
	await delay(10);
	globalStore.$patch((state) => {
		state.isPlateLoading = false;
	});
};
onMounted(() => {
	_defaultLoadingTime();
});
</script>
<style lang="scss" scoped>
#plate--page {
}
</style>
