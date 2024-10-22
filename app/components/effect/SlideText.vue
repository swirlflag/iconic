<template>
	<div class="slide-text" ref="$root" :class="{ '-fullsize': props.fullsize, 'trs--width': props.transitionWidth }">
		<template v-if="isAnimate">
			<div class="slide-text__target" ref="$target" :class="{ '-center': props.center, '-right': props.right }">
				<div class="slide-text__fly" ref="$fly" :class="{ '-reverse': props.reverse }">
					<div class="slide-text__before" v-dompurify-html="beforeText" ref="$before"></div>
					<div class="slide-text__after" v-dompurify-html="afterText" ref="$after"></div>
				</div>
				<div class="slide-text__contain" v-dompurify-html="containText" ref="$contain"></div>
			</div>
		</template>
		<template v-else>
			<div v-dompurify-html="renderText"></div>
		</template>
	</div>
</template>

<script setup>
import gsap from "gsap";

const props = defineProps({
	text: {
		type: [Number, String, 0, null],
		default: "&nbsp;",
		required: true,
	},
	speed: {
		type: [Number, String],
		default: 500,
	},
	delay: {
		type: [Number, String],
		default: 0,
	},
	// false면 컴포넌트의 텍스트를 inline화한 사이즈를 사용함. true면 외부의 사이즈에 100%로 적용
	fullsize: {
		type: Boolean,
		default: false,
	},
	// top,bottom, left, right => 미구현
	reverse: {
		type: Boolean,
		default: false,
	},
	center: {
		type: Boolean,
		default: false,
	},
	right: {
		type: Boolean,
		default: false,
	},
	transitionWidth: {
		type: Boolean,
		default: false,
	},
});

const $root = ref(null);
const $target = ref(null);
const $before = ref(null);
const $fly = ref(null);
const $after = ref(null);
const $contain = ref(null);

const beforeText = ref("");

const remainderText = ref(null);
const isAnimate = ref(false);

const renderText = computed(() => {
	if (props.text === 0) {
		return "0";
	}
	if (props.text === false) {
		return "false";
	}
	if (props.text === true) {
		return "true";
	}
	return props.text === null || props.text === undefined || props.text === "" ? "&nbsp;" : props.text;
});

const afterText = ref(props.text);
const containText = ref(props.text);

watch(
	renderText,
	(now, old) => {
		if (isAnimate.value) {
			remainderText.value = now;
			return;
		}

		beforeText.value = old || "&nbsp;";
		afterText.value = now || "&nbsp;";

		animate();
	},
	{ flush: "post" },
);

// 지연 동작
const remainderAnimate = () => {
	beforeText.value = containText.value;
	afterText.value = remainderText.value;
	remainderText.value = null;
	animate();
};

const animate = async () => {
	isAnimate.value = true;
	const duration = props.speed * 0.001;
	const delay = props.delay * 0.001;

	await nextTick();

	const ofs = {
		before: {
			width: $before.value.offsetWidth,
			height: $before.value.offsetHeight,
		},
		after: {
			width: $after.value.offsetWidth,
			height: $after.value.offsetHeight,
		},
	};

	const maxWidth = Math.max(ofs.before.width, ofs.after.width);

	containText.value = afterText.value;

	gsap.set($target.value, { css: { width: maxWidth, height: ofs.after.height } });

	const tl = gsap.timeline({ paused: true });

	const fromY = ofs.before.height * (props.reverse ? -1 : 0);
	const toY = ofs.before.height * (props.reverse ? 0 : -1);

	tl.fromTo(
		$fly.value,
		{
			y: fromY,
		},
		{
			y: toY,
			ease: "power2.out",
			duration,
			delay,
			clearProps: "all",
			overwrite: true,
			autoRound: false,
		},
		0,
	);

	if (props.transitionWidth) {
		const isGrowWidth = ofs.before.width < ofs.after.width;

		tl.fromTo(
			$target.value,
			{ width: ofs.before.width },
			{
				width: ofs.after.width,
				ease: "power4.out",
				clearProps: "all",
				overwrite: true,
				duration,
				delay: isGrowWidth ? 0 : delay,
				autoRound: false,
			},
			"<",
		);
	}

	await tl.play();

	if (remainderText.value) {
		remainderAnimate();
	} else {
		isAnimate.value = false;
	}
};
</script>

<style scoped lang="scss">
.slide-text {
	display: inline-block;
	width: auto;
	box-sizing: border-box;
	color: inherit;
	text-align: inherit;
	&.-fullsize {
		width: 100%;
		height: 100%;
		white-space: nowrap;
	}
}

.slide-text__target {
	box-sizing: border-box;
	position: relative;
	width: auto;
	height: auto;
	display: inline-block;
	vertical-align: top;
	text-align: inherit;
	overflow: hidden;
	width: 100%;
	height: auto;
	will-change: transform, width;
}

.slide-text__fly {
	box-sizing: border-box;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: auto;
	flex-direction: column;
	text-align: inherit;
	display: flex;
	pointer-events: none;
	user-select: none !important;
	transform: translateY(0);
	vertical-align: top;
	white-space: nowrap;
	align-items: flex-start;
	will-change: transform;
	.-center & {
		align-items: center;
	}
	.-right & {
		align-items: flex-end;
	}

	> div {
		vertical-align: top;
		box-sizing: border-box;
		width: auto;
		position: relative;
		display: inline;
		text-align: inherit;
		white-space: nowrap;
		flex: 1 1 auto;
		min-width: 100%;
		width: auto;
		.slide-text.trs--width & {
			min-width: unset;
		}
		// backgrousnd-color: rgba(50,255,50,0.2); &:nth-child(2) {background-color: rgba(255,0,50,0.2);}
	}

	&.-reverse {
		.slide-text__before {
			order: 2;
		}
		.slide-text__after {
			order: 1;
		}
	}
}

.slide-text__contain {
	box-sizing: border-box;
	position: relative;
	width: auto;
	opacity: 1;
	height: 100%;
	// height: auto;
	// border: 1px solid #d3d;
	display: inline-block;
	opacity: 0;
}
</style>
