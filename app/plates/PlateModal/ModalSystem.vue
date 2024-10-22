<template>
	<ModalDefault :item="props.item">
		<div class="modal__box">
			<Transition>
				<div class="modal__veil" v-if="props.item.veil">
					<SpinnerSample color="#000" />
				</div>
			</Transition>
			<div class="modal__close" v-if="item.buttonClose">
				<button @click="onClickClose">
					<i class="i--x"></i>
					닫기
				</button>
			</div>

			<div class="modal__title" v-dompurify-html="props.item.title"></div>
			<div class="modal__message" v-dompurify-html="props.item.message"></div>
			<div class="modal__spinner" v-if="props.item.type === 'wait'">
				<SpinnerSample color="#000" />
			</div>

			<div class="modal__controls" v-if="isShowControls">
				<button
					class="modal__cancel"
					v-if="item.buttonCancel"
					v-dompurify-html="item.buttonCancel"
					@click="onClickCancel"
				></button>
				<button
					class="modal__confirm"
					v-if="item.buttonConfirm"
					v-dompurify-html="item.buttonConfirm"
					@click="onClickConfirm"
					:style="{ 'background-color': item.systemColor || null }"
				></button>
			</div>

			<div class="modal__slot__teleport" ref="$slot"></div>
			<div class="modal__slot__unique" v-if="uniqueComponent">
				<component :is="uniqueComponent" :item="props.item" />
			</div>
		</div>
	</ModalDefault>
</template>
<script setup>
import ModalDefault from "./ModalDefault";
import { useModalStore } from "@store";

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
});

const modalStore = useModalStore();

const $slot = ref(null);

const isShowControls = computed(() => {
	return props.item.buttonCancel || props.item.buttonConfirm;
});

const uniqueComponent = computed(() => {
	return props.item?.uniqueData?.component;
});

const onClickClose = () => {
	if (props.item.freeze) {
		return;
	}
	modalStore.close(props.item.uid);
};

const onClickConfirm = () => {
	if (props.item.freeze) {
		return;
	}
	modalStore.confirm(props.item.uid);
};

const onClickCancel = () => {
	if (props.item.freeze) {
		return;
	}
	modalStore.cancel(props.item.uid);
};

onMounted(() => {
	props.item.patch({
		el: {
			...props.item.el,
			slot: $slot.value,
		},
	});
});
</script>
<style lang="scss" scoped>
$closeSize: 22px;
$closeSize_m: 18px;
$closeGap: 10px;
.modal__box {
	background-color: #fff;
	padding: $SIZE_inPadding;
	display: flex;
	position: relative;
	flex-wrap: wrap;
	flex-direction: column;
	box-sizing: border-box;
	justify-content: center;
	border: 1px solid rgba(0, 0, 0, 1);
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
	max-width: 850px;
	@include hardSelect {
		color: #000;
		font-weight: 500;
	}
	@include mobile {
		padding: $SIZE_MO_inPadding;
		font-size: 14px;
	}

	.modal__veil {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		box-sizing: border-box;
		backdrop-filter: blur(10px);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: opacity 300ms ease;
		opacity: 1;
		z-index: 2;
		background-color: rgba(255, 255, 255, 0.5);

		&.v-enter-from,
		&.v-leave-to {
			opacity: 0;
		}
	}

	.modal__close {
		vertical-align: top;
		position: sticky;
		box-sizing: border-box;
		display: inline-block;
		height: 0 !important;
		position: absolute;
		right: 0;
		top: 0;
		z-index: 2;

		@include hidetext;

		button {
			box-sizing: border-box;
			width: $closeSize;
			height: $closeSize;
			top: $closeGap;
			right: $closeGap;
			position: absolute;

			@include mobile {
				width: $closeSize_m;
				height: $closeSize_m;
			}

			i {
				width: 100%;
				height: 100%;
				display: inline-block;
				background-color: #000;
			}
		}
	}

	.modal__title {
		font-size: 20px;
		margin-top: -0.08em;
		font-weight: 700;
		@include mobile {
			font-size: 16px;
		}
	}
	.modal__message {
		margin-top: 10px;
		@include mobile {
			margin-top: 5px;
		}
	}

	.modal__spinner {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
		margin-top: 10px;
	}

	.modal__controls {
		display: flex;
		gap: #{$SIZE_inPadding * 0.5};
		margin-top: $SIZE_inPadding;
		justify-content: flex-end;
		@include mobile {
			gap: $SIZE_MO_inPadding;
			margin-top: $SIZE_MO_inPadding;
		}

		button {
			display: inline-flex;
			padding: 4px 15px;
			min-width: 60px;
			// flex: 1;
			text-align: center;
			justify-content: center;
			align-items: center;
			border: 1px solid rgba(0, 0, 0, 1);
			@include hover {
				background-color: #000;
				color: #fff;
			}
			@include mobile {
				padding: 4px 12px;
				min-width: 50px;
			}
		}
	}
}
</style>
