<template>
	<div :data-uid="props.item.uid" class="modal" ref="$root" @click="onClickRoot" :class="rootClass">
		<div
			class="modal__dimmed"
			ref="$dimmed"
			:class="{ '-freeze': props.item.dimmedFreeze }"
			:style="{ backgroundColor: props.item.dimmedColor }"
			@click="onClickDimmed"
		></div>

		<div class="modal__wrap" ref="$wrap">
			<div class="modal__inner" ref="$inner">
				<div class="modal__inbox" ref="$inbox">
					<slot> </slot>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { useModalStore, useModalDefaultMotion, useGlobalStore } from "@store";

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
	class: {
		type: String,
		default: "",
	},
});

const rootClass = computed(() => ({
	[`type--${props.item.type}`]: true,
	"type--system": props.item.isSystem,
	"type--unique": props.item.isUnique,
	"type--source": props.item.isSource,
	"-freeze": props.item.freeze,
	[props.item.class]: props.item.class,
	[`theme--${props.item.theme}`]: props.item.theme,
	"-dimmed-freeze": props.item.dimmedFreeze,
}));

const route = useRoute();

const $dimmed = ref(null);
const $root = ref(null);
const $wrap = ref(null);
const $inner = ref(null);
const $inbox = ref(null);

const modalStore = useModalStore();
const globalStore = useGlobalStore();

watch(
	() => route.path,
	() => {
		if (!props.item.holdPath) {
			props.item.close();
		}
	},
);

const onClickDimmed = () => {
	if (props.item.dimmedFreeze) {
		return;
	}
	modalStore.close(props.item.uid);
};

const onClickRoot = (e) => {
	const paths = e.composedPath();
	const isClickDimmed = paths[0] === $wrap.value;

	if (isClickDimmed) {
		onClickDimmed();
	}
};

const _setupElements = () => {
	props.item.patch({
		el: {
			root: $root.value,
			wrap: $wrap.value,
			inner: $inner.value,
			inbox: $inbox.value,
		},
	});
};

if (props.item.scrolllock) {
	globalStore.lockScroll();
	props.item.on("close", () => {
		const isUnlock = !modalStore.openList.some((item) => item.scrolllock);
		if (isUnlock) {
			globalStore.unlockScroll();
		}
	});
}

onMounted(() => {
	if (props.item.blur) {
		nextTick(() => {
			document.activeElement.blur();
		});
	}
	_setupElements();
	useModalDefaultMotion(props.item);
});
</script>

<style lang="scss" scoped>
.modal {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	display: block;

	.modal__dimmed {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 0;
		pointer-events: all;
	}
}

.modal__wrap {
	height: 100%;
	box-sizing: border-box;
	pointer-events: all;
	overflow: auto;
	position: relative;
	z-index: 1;
	max-height: 100%;
	max-width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	padding: 20px;
	width: auto;
	margin: auto;
	@include mobile {
		padding: $SIZE_MO_inPadding;
	}

	.modal__inner {
		position: relative;
		box-sizing: border-box;
		margin: auto;
		display: flex;
		flex-direction: column;
		min-width: 300px;
		pointer-events: none;

		.modal.type--source & {
			max-width: 100%;
		}
		.modal.type--image & {
			// max-width: unset;
		}

		.modal__inbox {
			position: relative;
			box-sizing: border-box;
			border-radius: 20px;
			pointer-events: all;
		}
	}
}
</style>
