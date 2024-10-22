<template>
	<div id="plate--nav" ref="$root">
		<div class="nav__top" ref="$top">
			<NexonGnb ref="$nexonGnb" />

			<Gnb ref="$gnb" />
		</div>

		<ClientOnly>
			<!-- <button class="button--top" :class="{ '-show': isShowTopButton }" @click="onClickGotopButton">
				<i class="i--arrow-paging"></i>
				맨 위로
			</button> -->
		</ClientOnly>
	</div>
</template>

<script setup>
import NexonGnb from "./NexonGnb.vue";
import Gnb from "./Gnb.vue";

import { useNavStore, useGlobalStore } from "@store";
import { useResizeObserver } from "@vueuse/core";

const navStore = useNavStore();
const globalStore = useGlobalStore();

const detector = useDetector();

const $root = ref(null);
const $gnb = ref(null);
const $nexonGnb = ref(null);

const scrollTo = useScrollTo();

const isShowTopButton = computed(() => {
	return detector.scroll.y > 1;
});

const onClickGotopButton = () => {
	scrollTo(0);
};

const _watchMounted = () => {
	const ob = useResizeObserver($gnb.value.$el, () => {
		const height = Math.ceil($gnb.value.$el.offsetHeight);
		navStore.$patch((state) => {
			state.gnb.height = height;
			setRootStyleValue("gnb-height", height + "px");
			setRootStyleValue("gnb-gap", navStore.gnb.gap ? navStore.gnb.height + "px" : 0);
		});
	});
	useResizeObserver($nexonGnb.value.$el, () => {
		const height = Math.ceil($nexonGnb.value.$el.offsetHeight);
		navStore.$patch((state) => {
			state.nexonGnb.height = height;
			setRootStyleValue("nexon-gnb-height", height + "px");
			setRootStyleValue("nexon-gnb-gap", navStore.nexonGnb.gap ? navStore.nexonGnb.height + "px" : 0);
		});
	});

	watchEffect(() => {
		const WH = detector.screen.height;

		let navtopGap = 0;
		if (navStore.nexonGnb.gap) {
			navtopGap += navStore.nexonGnb.height;
		}
		if (navStore.gnb.gap) {
			navtopGap += navStore.gnb.height;
		}

		let navtopHeight = 0;
		if (navStore.nexonGnb.use) {
			navtopHeight += navStore.nexonGnb.height;
		}
		if (navStore.gnb.use) {
			navtopHeight += navStore.gnb.height;
		}

		const pageHeight = WH - navtopGap;

		setRootStyleValue("navtop-height", navtopHeight + "px");
		setRootStyleValue("navtop-gap", navtopGap + "px");

		setRootStyleValue("page-height", pageHeight + "px");

		globalStore.$patch((state) => {
			state.page.height = pageHeight;
		});
	});
};

onMounted(() => {
	_watchMounted();
});
</script>
<style lang="scss" scoped>
#plate--nav {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	> * {
		pointer-events: all;
	}

	.button--top {
		position: absolute;
		right: 20px;
		bottom: 20px;
		width: 50px;
		height: 50px;
		background-color: #fff;
		color: #fff;
		border: 1px solid #000;
		pointer-events: none;
		box-sizing: border-box;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		transition: opacity 200ms ease;
		@include hidetext;
		&.-show {
			opacity: 1;
			pointer-events: all;
		}
		i {
			display: block;
			width: 50%;
			height: 50%;
			background-color: #000;
			transform: rotate(90deg);
		}
	}
}

.gnb {
	z-index: 3;
}
._dimmed {
	// position: fixed;
	// width: 100%;
	// height: 100%;
	// top: 0;
	// left: 0;

	// background-color: #d3d;
}
</style>
