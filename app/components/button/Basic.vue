<template>
	<component
		:is="tagName"
		:target="isLink ? '_blank' : null"
		:href="isLink ? props.to : null"
		class="button--basic"
		:class="{
			[`color--${props.color}`]: props.color,
			'-fit': props.fit,
			[`type--${props.type}`]: props.type,
			'-hover': status.isHover,
			'-disabled': props.disabled,
			[`hover--${props.hover}`]: props.hover,
		}"
		:disabled="props.disabled"
		@pointerenter="onPointerEnter"
		@pointerleave="onPointerLeave"
	>
		<div class="_shape">
			<div><span></span></div>
			<div><span></span></div>
		</div>

		<slot></slot>
	</component>
</template>

<script setup>
import gsap from "gsap";

const props = defineProps({
	to: {
		type: String,
		default: null,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	type: {
		type: String,
		default: "default",
	},

	color: {
		type: String,
		default: "default",
	},
	hover: {
		type: String,
		default: "default",
	},
});

const status = reactive({
	isHover: false,
});

const isLink = computed(() => {
	return !!props.to;
});

const tagName = computed(() => {
	return isLink.value ? "a" : "button";
});

const onPointerEnter = () => {
	status.isHover = true;
};
const onPointerLeave = () => {
	status.isHover = false;
};
</script>

<style lang="scss" scoped>
.button--basic {
	border: 1px solid #000;
	font-size: 16px;
	background-color: #fff;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	padding: 5px 12px;
	min-height: 36px;
	box-sizing: border-box;
	border-radius: 3px;
	width: auto;
	vertical-align: top;
	transition: background-color 180ms ease, color 180ms ease, border-color 180ms, opacity 180ms ease, filter 300ms ease;
	@include hover {
		background-color: #000;
		color: #fff;
	}
	&.-disabled {
		opacity: 0.65;
		pointer-events: none;
		filter: grayscale(0.75) saturate(0.75) contrast(0.65);
	}
	&.hover--blue {
		@include hover {
			background-color: COLOR_blue_400();
			border-color: COLOR_blue_400();
		}
	}
	&.hover--red {
		@include hover {
			background-color: COLOR_red_400();
			border-color: COLOR_red_400();
		}
	}
}
</style>
