<template>
	<div class="selector" :class="[`type--${props.type}`]" ref="$root">
		<select ref="$select" @change="onChangeSelect" :disabled="props.disabled" v-if="props.list.length">
			<template v-for="item in renderList" :key="item.value">
				<option :value="item.value" :selected="item.selected">{{ item.name }}</option>
			</template>
		</select>
		<ClientOnly>
			<Transition @enter="onEnter" @leave="onLeave" :css="false">
				<div
					class="selector__box"
					:class="{
						'-open': isOpen,
						'-animated': isAnimated,
						'-disabled': props.disabled,
						[`type--${props.type}`]: true,
					}"
					ref="$box"
					v-if="isOpen"
				>
					<span class="selector__dimmed" @click="onClickDimmed" ref="$dimmed"></span>

					<div class="selector__transform" ref="$transform">
						<div class="selector__content" ref="$content">
							<template v-if="props.list.length">
								<ul>
									<template v-for="(item, idx) in renderList">
										<li
											@click="() => onClickItem(idx)"
											:class="{
												'-selected': selectedIndex === idx,
												'-disabled': item.disabled,
												'-parent': item.parent,
												[`depth--${item.depth}`]: item.depth > 0,
											}"
											ref="$items"
											v-if="!item.isHide"
										>
											<span v-dompurify-html="item.name"></span>
										</li>
									</template>
								</ul>
							</template>
							<template v-else-if="$slots.default">
								<slot></slot>
							</template>
						</div>
					</div>
				</div>
			</Transition>
		</ClientOnly>
	</div>
</template>

<script setup>
import gsap from "gsap";

const props = defineProps({
	/** @type { [
		{ name: String, value: String }
	] }*/
	list: {
		type: Array,
		default: [],
	},
	clickTarget: {
		type: null,
		default: null,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	type: {
		type: String,
		default: "fly",
	},
	button: {
		type: [Boolean, String],
		default: false,
	},
});

const model = defineModel({ default: -1 });
const modelName = defineModel("name");
const modelValue = defineModel("value");

const emits = defineEmits(["change"]);

const $root = ref(null);
const $box = ref(null);
const $transform = ref(null);
const $content = ref(null);
const $select = ref(null);
const $parent = ref(null);
const $dimmed = ref(null);
const $close = ref(null);
const $clickTarget = ref(null);
const $items = ref(null);

let tl = null;

const size = reactive({
	min: 0,
	max: 0,
	adjustY: 0,
	item: 0,
});

const pressStatus = reactive({
	start: 0,
	distance: 0,
	isPress: false,
});

const isOpen = ref(false);
const isAnimated = ref(false);
const isIgnoreClickTarget = ref(false);
const beforeIndex = ref(-1);
const selectedIndex = ref(0);

const renderList = computed(() => {
	const result =
		props?.list.map((item) => {
			return isObjectOrArray(item)
				? { name: item?.name || item, value: item?.name || item, ...item }
				: { name: item, value: item };
		}) || [];
	return result;
});

watch(
	() => modelName.value,
	(now) => {
		const findIndex = renderList.value.findIndex((item) => item.name === now);
		if (findIndex === selectedIndex.value) {
			return;
		}
		selectedIndex.value = findIndex;
		model.value = findIndex;
	},
	{ immediate: true },
);

watch(
	() => modelValue.value,
	(now) => {
		const findIndex = renderList.value.findIndex((item) => item.value === now);
		if (findIndex === selectedIndex.value) {
			return;
		}
		selectedIndex.value = findIndex;
		model.value = findIndex;
	},
	{ immediate: true },
);

watch(
	() => model.value,
	(now) => {
		if (model.value === selectedIndex.value) {
			return;
		}
		selectedIndex.value = now;
	},
	{ immediate: true },
);

watch(
	() => selectedIndex.value,
	(now, old) => {
		beforeIndex.value = old;
		model.value = now;
		emits("change", props.list?.[now], now, props.list);

		if (!$select.value) {
			return;
		}

		const { name, value } = renderList.value[now];

		modelName.value = name;
		modelValue.value = value;

		$select.value.selectedIndex = now;
		const trigger = new Event("change");
		$select.value.dispatchEvent(trigger);
	},
);

const _calcSize = () => {
	if (!$content.value) {
		return;
	}
	size.max = 0;
	size.min = 0;
	size.adjustY = 0;

	const gap = 14;
	const WH = window.innerHeight;
	const limitHeight = window.innerHeight - gap * 2;
	const rect = $root.value.getBoundingClientRect();

	let maxHeight = 0;

	if (props.type === "fly") {
		maxHeight = Math.min(limitHeight, Math.round(rect.height));
		const adjustY = maxHeight + rect.top + gap - WH;
		if (adjustY > 0) {
			size.adjustY = adjustY * -1;
		}
	} else {
		maxHeight = Math.round(rect.height);
	}

	if (maxHeight > 0) {
		size.max = maxHeight;
		$content.value.style.maxHeight = maxHeight + "px";
	}
};

const onEnter = async (el, done) => {
	_calcSize();

	tl.pause();
	tl.clear();

	const limitHeight = window.innerHeight - 28;

	$transform.value.style.height = 0;
	isAnimated.value = true;

	if ($items.value) {
		const item = $items.value[selectedIndex.value];
		if (item) {
			$content.value.scrollTop = item.offsetTop - $content.value.offsetHeight / 2;
		}
	}

	if (props.type === "fly") {
		tl.add(() => {
			window.addEventListener("click", onClickWindow);
		});
	}

	if (size.adjustY !== 0) {
		tl.to($root.value, { y: size.adjustY, overwrite: true }, 0);
	}

	tl.to($transform.value, { height: size.max, overwrite: true }, 0);
	tl.add(() => {
		isAnimated.value = false;
	});

	await tl.play();

	done();
};

const onLeave = async (el, done) => {
	_calcSize();

	tl.pause();
	tl.clear();

	const transform = el.querySelector(".selector__transform");
	tl.to($root.value, { y: 0, duration: 0.4 }, 0);
	tl.to(transform, { height: 0, y: 0, duration: 0.4 }, 0);
	tl.to(transform, { opacity: 0, duration: 0.15 }, 0.25);

	isAnimated.value = true;
	await tl.play();
	isAnimated.value = false;
	done();
};

const open = () => {
	isOpen.value = true;
};
const close = () => {
	isOpen.value = false;
};
const toggle = () => {
	isOpen.value ? close() : open();
};

const _setupElement = () => {
	$parent.value = $root.value.parentElement;

	if (props.clickTarget && unref(props.clickTarget) instanceof HTMLElement) {
		$clickTarget.value = props.clickTarget;
	} else {
		$clickTarget.value = $parent.value;
	}

	if ($clickTarget.value.style.position === "") {
		$clickTarget.value.style.position = "relative";
	}
};

const _setupList = () => {
	const detectIndex = model.value > -1 ? model.value : props.list.findIndex((item) => item.selected);

	if (detectIndex > -1) {
		selectedIndex.value = detectIndex;
		return;
	}

	selectedIndex.value = +model.value;
};

watch(
	() => props.list,
	(now) => {
		_setupList();
	},
	{ immediate: true },
);

const onChangeSelect = (event) => {
	const index = event.target.selectedIndex;
	select(index);
};

const onClickItem = (index) => {
	if (props.disabled) {
		return;
	}
	select(index);
	isIgnoreClickTarget.value = true;
	close();
};

const onClickDimmed = () => {
	if (props.disabled) {
		return;
	}
	isIgnoreClickTarget.value = true;
	close();
};

const onClickTarget = async (e) => {
	if (props.disabled) {
		return;
	}

	const isRoot = checkComposedPath(e, $root.value);

	if (isRoot || isIgnoreClickTarget.value) {
		isIgnoreClickTarget.value = false;
		return;
	}

	toggle();
};

const select = (idx) => {
	if (props.disabled) {
		return;
	}
	selectedIndex.value = idx;
};

const onClickWindow = (e) => {
	const isClickSelf = checkComposedPath(e, $content.value);

	if (isClickSelf) {
		return;
	}

	close();
	window.removeEventListener("click", onClickWindow);
};

onMounted(async () => {
	tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.5, autoRound: false } });
	_setupElement();
	_setupList();
	_calcSize();
	$clickTarget.value.addEventListener("click", onClickTarget);
});

onUnmounted(() => {
	tl && tl.kill();
	if ($clickTarget.value) {
		$clickTarget.value.removeEventListener("click", onClickTarget);
	}

	window.removeEventListener("click", onClickWindow);
});

defineExpose({
	open,
	close,
});
</script>

<style lang="scss" scoped>
.selector {
	display: flex;
	box-sizing: border-box;
	position: absolute;
	top: 100%;
	left: 0;
	margin-top: 5px;
	width: auto;
	z-index: 100;
	cursor: default;

	@include mobile {
		overflow: hidden;
	}

	&.type--accordion {
		position: relative;
		margin: 0;
		top: 5px;
	}
}

.selector__box {
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	pointer-events: none;
	width: 100%;
	touch-action: pan-y;
	left: 0;
	top: 0;
	opacity: 0;
	visibility: hidden;
	position: relative;

	&.-open,
	&.-animated {
		visibility: visible;
		opacity: 1;
	}

	&.-open {
		pointer-events: all;
	}
}

select {
	display: none !important;
	cursor: pointer !important;
	pointer-events: none !important;
	@include hidetext;
}
.selector__dimmed {
	display: none;
	pointer-events: none;
	opacity: 0;

	.selector__box.-open & {
		// opacity: 1;
		pointer-events: all;
	}
}

.selector__transform {
	overflow: hidden;
	box-sizing: border-box;
	border-radius: 3px;
	background-color: #fff;
	z-index: 2;
	position: relative;
	display: flex;
	flex-direction: column;
	border: 1px solid #000;
	width: auto;
}

.selector__content {
	box-sizing: border-box;
	border-radius: 3px;
	overflow-y: overlay;
	display: flex;
	flex-direction: column;
	width: 100%;
	flex: 0 0 auto;
	min-height: 0;
	max-height: inherit;
	background-color: #fff;
}

ul {
	width: 100%;
	height: auto;
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	white-space: nowrap;

	li {
		padding: 4px 10px;
		box-sizing: border-box;
		vertical-align: top;
		font-size: 16px;
		color: #000;
		min-height: 32px;

		width: 100%;
		height: 100%;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		transition: background-color 140ms ease, color 140ms ease;

		+ li {
			border-top: 1px solid rgba(0, 0, 0, 0.1);
		}
		@include hover {
			color: #000;
			background-color: rgba(0, 0, 0, 0.1);
		}

		> span {
			display: inline-flex;
			box-sizing: border-box;
		}

		&.-selected {
			background-color: #000;
			color: #fff;
		}

		&.-disabled {
			pointer-events: none;
			opacity: 0.5;
		}

		&.depth--1 {
			padding-left: 20px;
		}
	}
}
</style>
