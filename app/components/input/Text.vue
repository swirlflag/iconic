<template>
	<label
		class="input--text"
		:class="{ '-focus': status.focus, [`-right`]: props.right, '-disabled': props.disabled }"
	>
		<span class="_prefix" v-if="props.prefix">{{ props.prefix }}</span>
		<div class="_input">
			<input
				type="text"
				ref="$input"
				:placeholder="props.placeholder"
				v-model="model"
				@focus="onFocus"
				@blur="onBlur"
				@input="onInput"
				:disabled="props.disabled"
			/>
		</div>
		<span class="_suffix" v-if="props.suffix">{{ props.suffix }}</span>
	</label>
</template>

<script setup>
const props = defineProps({
	placeholder: {
		type: String,
		default: "텍스트를 입력해주세요.",
	},
	prefix: {
		type: String,
		default: "",
	},
	suffix: {
		type: String,
		default: "",
	},
	pattern: {
		type: String,
		default: "",
	},
	validate: {
		type: String,
		default: "",
	},
	right: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const model = defineModel({ default: "" });
const modelValid = defineModel("valid");
const emits = defineEmits(["input", "focus", "blur"]);

const formText = ref(model.value);

const $input = ref(null);

const status = reactive({
	focus: false,
});

const isValidate = computed(() => {
	if (props.validate) {
		return regexValidate.value.test(formText.value);
	}
	return false;
});

const regexPattern = computed(() => {
	return new RegExp(props.pattern);
});

const regexValidate = computed(() => {
	return new RegExp(props.validate);
});

watch(
	() => model.value,
	(now) => {
		formText.value = now;
	},
);

watch(isValidate, (value) => {
	modelValid.value = value;
});

const onClickRoot = () => {
	$input.value.focus();
};

const onFocus = (e) => {
	status.focus = true;
	emits("focus", e, { value: model.value, model });
};

const onBlur = (e) => {
	status.focus = false;
	emits("blur", e, { value: model.value, model });
};

const onInput = (e) => {
	onInputValue(e.target.value);
};

const onInputValue = (value) => {
	let newValue = "";

	for (let i = 1; i <= value.length; i++) {
		const substr = value.substring(0, i);
		if (regexPattern.value.test(substr)) {
			newValue = substr;
		} else {
			break;
		}
	}

	formText.value = newValue;

	model.value = formText.value;
};

onMounted(() => {
	onInputValue(model.value);
});
</script>

<style lang="scss" scoped>
$size: 34px;

.input--text {
	font-size: 16px;
	display: flex;
	align-items: center;
	cursor: text;
	box-sizing: border-box;
	border: 1px solid #000;
	border-radius: 3px;
	transition: background-color 200ms ease, color 200ms ease;
	background-color: #fff;
	color: #000;
	&.-disabled {
		opacity: 0.65;
		pointer-events: none;
		filter: grayscale(0.75) saturate(0.75) contrast(0.65);
	}

	._suffix,
	._prefix {
		display: inline-flex;
		flex-wrap: nowrap;
		align-items: center;
		width: auto;
		box-sizing: border-box;
		align-items: center;
		padding: 6px;
		flex: 0 0 auto;
		white-space: nowrap;
		font-size: 14px;
		align-self: stretch;
	}
	._prefix {
		border-right: 1px solid currentColor;
	}
	._suffix {
		border-left: 1px solid currentColor;
	}

	._input {
		display: flex;
		flex: 1;

		input[type="text"] {
			width: 100%;
			height: $size;
			padding: 0 8px;
			border-radius: 3px;
			box-sizing: border-box;
			line-height: $size;
			outline: none;
			background-color: transparent;
			color: inherit;
			transition: border-color 300ms ease;

			&::placeholder {
				opacity: 0.5;
				color: inherit;
				filter: saturate(0.75);
			}
		}
	}

	@include hover {
		background-color: rgba(0, 0, 0, 0.2);
		._input {
		}
	}
	&.-focus {
		background-color: #000;
		color: #fff;
		._input {
		}
	}

	&.-right {
		input {
			text-align: right;
		}
	}
}
</style>
