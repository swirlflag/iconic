<template>
	<client-only>
		<Teleport :to="modal?.el.slot" v-if="modal?.isVisible">
			<slot></slot>
		</Teleport>
	</client-only>
</template>

<script setup>
import { useModalStore } from "@store";

const props = defineProps({
	isOpen: {
		type: Boolean,
		default: false,
	},
	hash: {
		type: [String, null],
		default: null,
	},
	class: {
		type: String,
		default: null,
	},
	options: {
		type: Object,
		default: {},
	},
});

const model = defineModel({ default: false });

const emits = defineEmits(["open", "close", "mouseEnterDimmed", "mouseLeaveDimmed", "setMotion"]);

const modalStore = useModalStore();

const modal = ref(null);

const _setupModal = () => {
	const item = modalStore.create({
		type: "custom",
		hash: props.hash,
		class: props.class,
		once: false,
		buttonClose: false,

		onCreate: async (target) => {
			await nextTick();
			target.on("open", () => {
				model.value = true;
				emits("open");
			});
			target.on("close", () => {
				model.value = false;
				emits("close");
			});
			target.on("mouseEnterDimmed", () => {
				emits("mouseEnterDimmed");
			});
			target.on("mouseLeaveDimmed", () => {
				emits("mouseLeaveDimmed");
			});
		},
		...props.options,
	});

	emits("setMotion", item);

	if (model.value) {
		item.open();
	}

	modal.value = item;
};

const _cleanupModal = () => {
	modal.value.ignoreMotion = true;
	modalStore.destroy(modal.value.uid);
};

const open = () => {
	if (modal.value.isOpen) {
		return;
	}
	modal.value.open();
};

const close = () => {
	if (!modal.value.isOpen) {
		return;
	}
	modal.value.close();
};

watch(model, (now) => {
	now ? open() : close();
});

onMounted(() => {
	nextTick(_setupModal);
});

onUnmounted(() => {
	_cleanupModal();
});

defineExpose({
	open,
	close,
	modal,
});
</script>
