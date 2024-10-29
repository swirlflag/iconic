<template>
	<label class="input--toggle" :class="{ '-active': model }">
		<input type="checkbox" v-model="model" />
		<div></div>
	</label>
</template>

<script setup>
const model = defineModel({ default: false });
const props = defineProps({});
</script>

<style lang="scss" scoped>
$size: 32px;
$ratio: 1.6666;
$inPadding: 6px;

label.input--toggle {
	cursor: pointer;
	display: inline-flex;
	width: auto;
	width: $size * $ratio;
	height: $size;
	border: 1px solid rgba(0, 0, 0, 1);
	box-sizing: border-box;
	background-color: #fff;
	border-radius: 3px;
	position: relative;
	transition: background-color 300ms ease;

	input {
		display: none;
	}
	> div {
		width: $size - 6px;
		height: $size - 6px;
		top: 2px;
		left: 2px;
		display: inline-block;
		position: absolute;
		border-radius: 9999px;
		position: absolute;
		background-color: rgba(0, 0, 0, 1);
		box-sizing: border-box;
		transition: transform 500ms $EASE_outExpo, background-color 200ms ease, border-color 200ms ease;
		z-index: 2;
	}

	&::before {
		content: "";
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		border: 1px solid #fff;
		position: absolute;
		left: 7px;
		top: 50%;
		transform: translate3d(0, -50%, 0);
	}

	&::after {
		content: "";
		width: 1px;
		height: 10px;
		background-color: #000;
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translate3d(0, -50%, 0);
	}

	&.-active {
		background-color: #000;

		> div {
			transform: translate3d($size * $ratio - $size, 0, 0);
			background-color: #fff;
		}
	}

	&:hover {
		> div {
			// background-color: rgba(150, 150, 150, 0.8) !important;
			opacity: 0.75;
		}
	}
}
</style>
