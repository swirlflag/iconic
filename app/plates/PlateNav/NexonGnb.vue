<template>
	<div id="nexon-gnb" ref="$root" :class="{ '-viewless': !isUse, '-hide': isHide, '-fix': isFix }">
		<Transition>
			<span v-if="!isInstall" class="nexon-gnb__veil" ref="$veil">
				<SpinnerSample />
				<h1>넥슨</h1>
			</span>
		</Transition>
		<div class="nexon-gnb__wrapper">
			<span id="nexon-gnb-trigger" class="nexon-gnb__trigger"></span>
		</div>
	</div>
</template>
<script setup>
import gsap from "gsap";
import { useNavStore, useAsyncStore } from "@store";

const AS = useAsyncStore();
const navStore = useNavStore();
const detector = useDetector();

const $root = ref(null);

const isInstall = computed(() => AS.nexonGnb.isSuccess);

const isUse = computed(() => {
	return navStore.nexonGnb.use;
});
const isFix = computed(() => {
	return navStore.nexonGnb.fix;
});
const isHide = computed(() => {
	return isFix && navStore.nexonGnb.hide;
});

const _watchMounted = () => {
	watch(
		[() => detector.scroll.y, () => navStore.nexonGnb.height, () => navStore.nexonGnb.fix],
		() => {
			const isFix = navStore.nexonGnb.fix;
			if (isFix) {
				return;
			}
			const rootHeight = $root.value.offsetHeight;
			const v = Math.min(detector.scroll.y, rootHeight);
			$root.value.style.marginTop = `-${v}px`;
		},
		{ immediate: true },
	);

	watch(
		() => navStore.nexonGnb.hide,
		(now) => {
			if (!navStore.nexonGnb.fix) {
				return;
			}
			gsap.to($root.value, {
				marginTop: now ? -navStore.nexonGnb.height : 0,
				ease: "power3.out",
				duration: 0.4,
				autoRound: false,
				overwrite: true,
			});
		},
		{ immediate: true },
	);
};

onMounted(() => {
	_watchMounted();
});
</script>
<style lang="scss" scoped>
#nexon-gnb {
	width: 100%;
	height: auto;
	box-sizing: border-box;
	display: flex;
	position: relative;
	will-change: margin-top;
	pointer-events: all;
	z-index: 210;

	&.-viewless {
		display: none;
	}

	@include device-mobile {
		display: none !important;
	}

	&.-hide {
		// transform: translate3d(0,-100%,0);
	}

	.nexon-gnb__veil {
		z-index: 2;
		background-color: #fff;
		width: 100%;
		height: 100%;
		position: absolute;
		display: inline-block;
		left: 0;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;

		box-sizing: border-box;
		transition: opacity 600ms ease;
		&.v-leave-to {
			opacity: 0;
		}
		h1 {
			font-size: 0;
			opacity: 0;
			width: 0;
			height: 0;
			color: transparent;
		}
	}

	.nexon-gnb__wrapper {
		// height: 63px;
		// height: v-bind(nexonGnbHeight);
		height: auto;
		display: flex;
		justify-content: center;
		width: 100%;
		z-index: 1;

		.nexon-gnb__trigger {
			width: 0 !important;
			height: 0 !important;
			overflow: hidden;
			opacity: 0 !important;
			visibility: hidden;
			display: inline-block;
		}
		#nexon-gnb-trigger {
			height: 0;
			overflow: hidden;
			display: inline-block;
			box-sizing: border-box;
			vertical-align: top;
		}
	}
}
</style>
