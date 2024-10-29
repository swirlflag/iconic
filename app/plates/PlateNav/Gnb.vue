<template>
	<nav id="gnb" :class="{ '-viewless': !isUse, '-open': isOpen }" ref="$root">
		<div class="gnb-panel" ref="$panel">
			<div class="gnb-static" ref="$static">
				<NuxtLink class="gnb-logo" to="/main">
					<!-- <i class="i--logo-nnp"> </i> -->
					<span>Iconic</span>
				</NuxtLink>

				<button class="gnb-toggle-menu" @click="onClickToggleMenu">
					<span></span>
					<span></span>
					<span></span>
					메뉴
				</button>
			</div>
			<div class="gnb-extend" ref="$extend">
				<div class="templinks">
					테스트 임시 네비게이션
					<div>
						<!-- <NuxtLink to="/t/community">community</NuxtLink>
						<NuxtLink to="/t/threads">threads</NuxtLink>
						<NuxtLink to="/t/components">components</NuxtLink> -->
					</div>
				</div>
			</div>
		</div>
	</nav>
</template>
<script setup>
import gsap from "gsap";
import { useNavStore } from "@store";

const route = useRoute();

const $root = ref(null);
const $panel = ref(null);
const $static = ref(null);
const $extend = ref(null);

const navStore = useNavStore();

const status = computed(() => {
	return navStore.status["gnb"];
});

const isUse = computed(() => {
	return status.value.use;
});

const isOpen = computed(() => {
	return status.value.open;
});

watch(isOpen, (now) => {
	if (now) {
		openMotion();
	} else {
		closeMotion();
	}
});

watch(
	() => route.fullPath,
	() => {
		navStore.patch("gnb", { open: false });
	},
);

const openMotion = () => {
	const tl = gsap.timeline();
	tl.to($panel.value, {
		duration: 0.6,
		height: "auto",
		ease: "power3.out",
		overwrite: true,
		autoRound: false,
	});
};

const closeMotion = () => {
	const tl = gsap.timeline();
	const closeHeight = $static.value.clientHeight;
	tl.to($panel.value, {
		duration: 0.3,
		height: closeHeight,
		ease: "power2.out",
		overwrite: true,
		autoRound: false,
		cleaProps: "height",
	});
};

const toggleGnb = () => {
	navStore.patch("gnb", { open: !isOpen.value });
};

const onClickToggleMenu = () => {
	toggleGnb();
};
</script>
<style lang="scss" scoped>
.templinks {
	// flex-direction: column;
	align-items: flex-start;
	background-color: #ddd;

	> div {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
		a {
			display: inline-flex;
			background-color: #aac;
			padding: 5px;
			font-weight: 700;
		}
	}
}
</style>
<style lang="scss" scoped>
$gnbSize: 40px;

#gnb {
	padding: 0;
	box-sizing: border-box;
	position: relative;
	display: block;
	width: 100%;
	box-sizing: border-box;
	overflow: visible;
	height: $gnbSize;

	&.-viewless {
		display: none;
		pointer-events: none;
		user-select: none;
	}
	&.-open,
	&.-move {
	}
}

.gnb-panel {
	background-color: #fff;
	border-bottom: 1px solid #000;
	backdrop-filter: blur(3px);
	overflow: hidden;
	display: flex;
	height: $gnbSize;
	flex-direction: column;
	box-sizing: border-box;
	will-change: height;
	max-width: 100%;
	@include layoutTarget(100%);

	.gnb-static {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: $gnbSize;
		flex: 0 0 auto;

		.gnb-logo {
			display: inline-flex;
			width: $gnbSize * 0.85;
			height: $gnbSize * 0.85;
			align-items: center;
			// @include hidetext;
			white-space: nowrap;
			i.i--logo-nnp {
				background-color: #000;
				width: 100%;
				height: 100%;
			}

			span {
				font-size: 16px;
				margin-left: 5px;
				font-weight: 600;
			}
		}
		.gnb-toggle-menu {
			margin-left: auto;
			display: inline-flex;
			width: $gnbSize * 0.55;
			height: $gnbSize * 0.7;
			position: relative;
			@include hidetext;

			> span {
				$gap: 8px;
				position: absolute;
				box-sizing: border-box;
				left: 0;
				top: 0;
				box-sizing: border-box;
				background-color: #000;
				width: 100%;
				height: 2px;
				top: calc(50% - 2px);
				will-change: margin;
				transition: transform 200ms $EASE_inCubic, margin 250ms $EASE_outCubic 200ms;
				&:nth-child(1) {
					margin-top: -$gap;
				}
				&:nth-child(2) {
					transition: transform 0ms linear 200ms;
				}
				&:nth-child(3) {
					margin-top: $gap;
				}
			}

			#gnb.-open & {
				> span {
					transition: transform 500ms $EASE_outBack 140ms, margin 140ms $EASE_inCubic;
					&:nth-child(1) {
						transform: rotate(45deg);
						margin-top: 0;
					}
					&:nth-child(2) {
						transform: scaleX(0);
						transition: transform 0ms linear 140ms;
					}
					&:nth-child(3) {
						margin-top: 0;
						transform: rotate(-45deg);
					}
				}
			}
		}
	}

	.gnb-extend {
		// padding: 50px;
	}
}
</style>
