<template>
	<ClientOnly>
		<div id="plate--toast" :class="{ '-active': toastStore.isOpen }" ref="$root">
			<TransitionGroup :css="false" @enter="onEnter" @leave="onLeave">
				<template v-for="item in toastStore.openList" :key="item.uid">
					<div class="toast" :data-uid="item.uid" :class="{ [`type--${item.type}`]: true }">
						<div class="toast__box">
							<template v-if="item.type === 'error'">
								<i class="i--warning"></i>
							</template>
							<div class="_message" v-dompurify-html="item.message"></div>
							<button class="_close" @click="() => closeToast(item.uid)">
								<i class="i--x2"></i>
								닫기
							</button>
							<span class="_progress"></span>
						</div>
					</div>
				</template>
			</TransitionGroup>
		</div>
	</ClientOnly>
</template>

<script setup>
import gsap from "gsap";
import { useToastStore } from "@store";
const toastStore = useToastStore();

const $root = ref(null);

const onEnter = (el, done) => {
	const uid = el.dataset.uid;
	const item = toastStore.toasts[uid];
	const progress = el.querySelector("._progress");
	const tl = gsap.timeline();

	const rootWidth = $root.value.offsetWidth;
	const isFirst = toastStore.openList.length <= 1;
	if (!isFirst) {
		tl.from(
			el,
			{
				height: 0,
				ease: "power3.out",
				duration: 0.35,
				autoRound: false,
			},
			0,
		);
	}

	tl.from(
		el,
		{ x: rootWidth, ease: "power4.out", duration: 0.7, autoRound: false, clearProps: "all", onComplete: done },
		0.15,
	);

	if (item.second > 0) {
		tl.from(
			progress,
			{
				scaleX: 0,
				ease: "linear",
				duration: item.second,
				onComplete: () => {
					if (item.isOpen) {
						closeToast(uid);
					}
				},
				onUpdate: () => {
					if (!item.isOpen) {
						tl.kill();
					}
				},
			},
			0.2,
		);
	} else {
		progress.style.display = "none";
	}
};

const onLeave = (el, done) => {
	const uid = el.dataset.uid;
	const item = toastStore.toasts[uid];
	const tl = gsap.timeline();

	const rootWidth = $root.value.offsetWidth;

	el.classList.add("-hide");
	tl.to(
		el,
		{
			x: rootWidth,
			ease: "power2.in",
			duration: 0.25,
			autoRound: false,
		},
		0,
	);

	tl.to(el, {
		height: 0,
		margin: 0,
		duration: 0.4,
		ease: "power3.inOut",
		autoRound: false,
		onComplete: () => {
			item.eventFire("closeComplete");
			done();
		},
	});
};

const closeToast = (uid) => {
	toastStore.close(uid);
};
</script>

<style lang="scss" scoped>
#plate--toast {
	position: fixed;
	bottom: 0;
	right: 0;
	padding: $SIZE_MO_inPadding;
	pointer-events: none;
	display: flex;
	box-sizing: border-box;
	flex-direction: column;
	justify-content: flex-end;
	align-items: flex-end;
	max-height: 100%;
	overflow: hidden;
	will-change: height;

	@include mobile {
		width: 100%;
	}

	.toast {
		pointer-events: all;
		margin-top: $SIZE_MO_inPadding * 0.5;
		display: flex;
		align-items: center;
		flex-direction: column;
		will-change: height, margin;
		z-index: 2;
		width: auto;
		@include mobile {
			width: 100%;
		}

		&.-hide {
			z-index: 1;
		}
		.toast__box {
			box-sizing: border-box;
			display: flex;
			align-items: center;
			padding: $SIZE_inPadding $SIZE_inPadding;
			min-width: 300px;
			max-width: 800px;
			width: 100%;
			height: auto;
			flex: 0 0 auto;
			color: #000;
			letter-spacing: 0;
			gap: 10px;
			position: relative;
			overflow: hidden;
			border: 1px solid #000;
			background-color: #fff;
			@include mobile {
				min-width: unset;
				padding: $SIZE_MO_inPadding;
				max-width: $SIZE_MO_contentWidth;
				gap: 8px;
			}

			._progress {
				width: 100%;
				height: 6px;
				left: 0;
				bottom: 0;
				position: absolute;
				z-index: 0;
				transform-origin: left;
				background-color: #000;
				will-change: transform;
				@include mobile {
					height: 5px;
				}
			}

			i.i--warning {
				z-index: 2;
				position: relative;
				flex: 0 0 auto;
				display: inline-block;
				width: 20px;
				height: 20px;
				background-color: COLOR_red_400();
				@include mobile {
					width: 16px;
					height: 16px;
				}
			}
			._message {
				font-size: 16px;
				font-weight: 500;
				margin-right: 20px;
				display: flex;
				z-index: 1;
				position: relative;
				align-items: center;
				@include mobile {
					font-size: 15px;
					margin-right: 10px;
				}
			}

			._close {
				margin-left: auto;
				margin-bottom: -2px;
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				@include hidetext;
				i.i--x2 {
					width: 14px;
					height: 14px;
					background-color: #000;
					@include mobile {
						width: 12px;
						height: 12px;
					}
				}
			}
		}

		&.type--success {
			color: COLOR_blue_400();
			._progress {
				background-color: COLOR_blue_400();
			}
		}
		&.type--error {
			._progress {
				background-color: COLOR_red_400();
			}
		}
	}
}
</style>
