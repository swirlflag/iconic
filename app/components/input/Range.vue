<template>
	<label class="input--range">
		<input
			type="range"
			v-model="model"
			:step="props.step"
			:min="props.min"
			:max="props.max"
			draggable="false"
			@dragstart.prevent
		/>
		<div class="_line">
			<span :style="{ 'mask-image': `linear-gradient(90deg, transparent ${ratio}%, #000 ${ratio}%)` }"></span>
			<span :style="{ transform: `scaleX(${ratio}%)` }"></span>
		</div>
	</label>
</template>
<script setup>
const model = defineModel({ default: 50 });

const props = defineProps({
	step: {
		type: [Number, String],
		default: 1,
	},
	min: {
		type: [Number, String],
		default: 0,
	},
	max: {
		type: [Number, String],
		default: 100,
	},
});
const ratio = computed(() => {
	return +model.value;
});
</script>
<style lang="scss" scoped>
// Range Slider

$size: 24px;

label.input--range {
	background-color: #fff;
	border: 1px solid #000;
	border-radius: 3px;
	box-sizing: border-box;
	overflow: hidden;
	position: relative;
	display: inline-flex;
	cursor: pointer;

	input[type="range"] {
		vertical-align: top;
		-webkit-appearance: none;
		width: 100%;
		height: 100%;
		cursor: pointer;
		border-radius: 3px;
		outline: none;
		padding: 0;
		box-sizing: border-box;
		margin: 0;
		z-index: 1;

		&::-webkit-slider-thumb {
			appearance: none;
			width: $size;
			height: $size;
			border-radius: 9999px;
			transform: scale(0.875);
			background-color: #000;
			box-sizing: content-box;
			cursor: pointer;
			transition: transform 240ms $EASE_outBack2;
		}

		&:active::-webkit-slider-thumb {
			transform: scale(0.8);
		}
	}

	._bg {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #000;
		left: 0;
		top: 0;
		box-sizing: border-box;
		z-index: 0;
		pointer-events: none;
	}

	> ._line {
		display: inline-block;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		width: calc(100% - $size * 0.95);
		left: $size * 0.475;
		pointer-events: none;

		&::before,
		&::after {
			content: "";
			width: 1px;
			height: 100%;
			background-color: #000;
			position: absolute;
			display: inline-block;
			transform: scaleY(0.36);
			margin-top: 1px;
		}
		&::before {
			left: 0;
		}
		&::after {
			right: 0;
		}
		> span {
			display: inline-block;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			position: absolute;
			height: 0px;
			box-sizing: border-box;
			top: 50%;
			pointer-events: none;

			&:nth-child(1) {
				opacity: 0.75;
				border-top: 1px dashed #000;
			}
			&:nth-child(2) {
				opacity: 1;
				border-top: 1px solid #000;
				transform-origin: 0 50%;
			}
		}
	}

	@include hover {
		input {
			&::-webkit-slider-thumb {
				// opacity: 0.75;
			}
		}
	}
}
</style>
