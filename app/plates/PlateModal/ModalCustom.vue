<template>
	<ModalDefault :item="item">
		<template v-if="uniqueComponent">
			<component :is="uniqueComponent" :item="item" />
		</template>
		<template v-else>
			<div class="modal__slot" ref="$slot"></div>
		</template>
	</ModalDefault>
</template>

<script setup>
import ModalDefault from "./ModalDefault.vue";
import { useModalStore } from "@store";

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
});

const uniqueComponent = computed(() => {
	return props.item?.uniqueData?.component;
});

const modalStore = useModalStore();

const $slot = ref(null);

onMounted(() => {
	if ($slot.value) {
		props.item.el.slot = $slot.value;
	}
});
</script>
