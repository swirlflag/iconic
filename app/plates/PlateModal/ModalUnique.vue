<template>
	<ModalDefault :item="item">
		<component :is="uniqueComponent" :item="item" />
	</ModalDefault>
</template>

<script setup>
import ModalDefault from "./ModalDefault.vue";

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
});

const uniqueComponent = computed(() => {
	return props.item?.uniqueData?.component;
});

onMounted(() => {
	// useModalDefaultMotion(props.item);
	// props.item.el.slot = ref_slot.value;
});
</script>

<!-- <style lang="scss">
.modal.type--unique {
	.modal__wrap {
		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>

<style lang="scss" scoped>
.modal__inner {
	.modal__box {
		position: relative;
		box-sizing: border-box;
		width: auto;
	}
}
</style> -->

<style scoped lang="scss">
.ho {
	background-color: #3d3;
}
</style>
