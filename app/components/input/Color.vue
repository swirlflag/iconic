<template>
	<label class="input--color" :class="{ '-disabled': props.disabled }">
		<span :style="{ 'background-color': model }">
			<input type="color" v-model="model" :disabled="props.disabled" />
		</span>
		<template v-if="props.input">
			<InputText
				class="_text"
				v-model="model"
				placeholder="#000000"
				@blur="onBlurText"
				:disabled="props.disabled"
				pattern="^#([A-Fa-f0-9]{0,6})$"
			/>
		</template>
	</label>
</template>

<script setup>
const model = defineModel({ default: "#000000" });

const props = defineProps({
	input: {
		type: Boolean,
		default: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const validateAndConvertColor = (color) => {
	const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	if (hexRegex.test(color)) {
		if (color.length === 4) {
			return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
		}
		return color;
	}

	return "#000000";
};

const onBlurText = (e, value) => {
	model.value = validateAndConvertColor(value);
};
</script>

<style lang="scss" scoped>
$size: 34px;

.input--color {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: $SIZE_inPadding * 0.5;

	> span {
		width: $size;
		height: $size;
		display: inline-block;
		border: 1px solid #000;
		border-radius: 3px;
		height: 100%;
		box-sizing: border-box;
		position: relative;
		cursor: pointer;
		input[type="color"] {
			opacity: 0;
			width: 0px;
			height: 0px;
			position: absolute;
			top: 100%;
			margin-top: 5px;
			left: 0;
		}
	}
	._text {
		max-width: 80px;
	}

	&.-disabled > span {
		opacity: 0.65;
		pointer-events: none;
		filter: grayscale(0);
	}
}
</style>
