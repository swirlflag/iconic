<template>
	<ModalDefault :item="props.item">
		<div class="modal__box" :class="{ [`type--${props.item.type}`]: true, '-over': isOverClose }" ref="$root">
			<Transition>
				<div class="modal__veil" v-if="props.item.veil">
					<SpinnerSample color="#fff" />
				</div>
			</Transition>
			<div class="modal__close" v-if="item.buttonClose">
				<button @click="onClickClose">
					<i class="i--x"></i>
					닫기
				</button>
			</div>

			<div class="modal__source">
				<span
					class="modal__source__ratio"
					ref="$ratio"
					:style="{ 'padding-top': ratioHeight + '%' }"
					v-if="isUseRatio"
				>
				</span>

				<template v-if="props.item.type === 'video'">
					<div class="modal__video">
						<video
							:loop="props.item.loop"
							:autoplay="props.item.autoplay"
							:muted="props.item.muted"
							playsinline
							:controls="props.item.controls"
							controlsList="nodownload"
							preload="metadata"
							ref="$video"
						>
							<source :src="props.item.src" />
						</video>
					</div>
				</template>

				<template v-else-if="props.item.type === 'youtube'">
					<div class="modal__youtube" ref="$youtube" :class="`youtube--${props.item.uid}`"></div>
				</template>

				<template v-else-if="props.item.type === 'image'">
					<component
						:is="isUseLink ? 'a' : 'div'"
						class="modal__source__image"
						:class="{ '-link': isUseLink }"
						:target="isUseLink ? '_blank' : null"
						:href="isUseLink ? props.item.link : null"
					>
						<img ref="$image" :src="props.item.src" alt="" v-if="props.item.src" />
					</component>
				</template>
			</div>
		</div>
	</ModalDefault>
</template>
<script setup>
import ModalDefault from "./ModalDefault";

import { useModalStore } from "@store";

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
});

const ratioHeight = ref(56.5);

const isLoaded = ref(false);

const detector = useDetector();

const $root = ref(null);
const $ratio = ref(null);
const $video = ref(null);
const $youtube = ref(null);
const $image = ref(null);

const modalStore = useModalStore();

const maxWidth = ref(1480);
const maxWidthPixel = ref(maxWidth.value + "px");

const isOverClose = computed(() => {
	return detector.screen.width > maxWidth.value + 100;
});

const isUseLink = computed(() => {
	return props.item.type === "image" && props.item.link;
});

const isUseRatio = computed(() => {
	const list = ["video", "youtube", "chzzk"];
	return list.includes(props.item.type);
});

const calcSize = (width, height) => {
	const heightRatio = height / width;
	ratioHeight.value = heightRatio * 100;
};

const onClickClose = () => {
	if (props.item.freeze) {
		return;
	}
	modalStore.close(props.item.uid);
};

const _setupTypes = {
	video: () => {
		props.item.patch({
			el: {
				...props.item.el,
				video: $video.value,
			},
		});
		$video.value.addEventListener("loadedmetadata", () => {
			if (!props.item.isOpen) {
				return;
			}
			calcSize($video.value.videoWidth, $video.value.videoHeight);
			props.item.videoProgress(props.item.time);
			isLoaded.value = true;
			props.item.patch({
				isSourceReady: true,
				veil: false,
			});
		});

		if (!props.item.isMounted) {
			props.item.on("close", () => {
				props.item.time = props.item.el.video.currentTime;
			});
		}
	},
	youtube: () => {
		const target = $youtube.value;
		const { key, autoplay, time } = props.item;

		const player = new YT.Player(target, {
			width: "auto",
			height: "auto",
			videoId: key,
			playsinline: 1,
			events: {
				onReady: async (player) => {
					if (!props.item.isOpen) {
						return;
					}

					const { width, height } = player.target.getSize();
					calcSize(width, height);

					props.item.patch({
						player,
					});

					if (time) {
						props.item.videoProgress(time);
					}
					if (autoplay) {
						player.target.playVideo();
					}
					isLoaded.value = true;

					props.item.patch({
						isSourceReady: true,
						veil: false,
					});
				},
			},
		});

		if (!props.item.isMounted) {
			props.item.on("close", () => {
				if (props.item.isSourceReady) {
					props.item.patch({
						time: player?.getCurrentTime() || 0,
					});
				}
			});
		}
	},
	image: () => {
		const onFinish = () => {
			isLoaded.value = true;
			props.item.patch({ veil: false });
		};
		if ($image.value.complete) {
			onFinish();
			return;
		}
		$image.value.onload = onFinish;
	},
};

onMounted(() => {
	if (_setupTypes[props.item.type]) {
		_setupTypes[props.item.type]();
	}
	nextTick(() => {
		props.item.patch({ isMounted: true });
	});
});
</script>

<style lang="scss" scoped>
$closeSize: 28px;
$closeSize_m: 22px;
$closeGap: 10px;

.modal__box {
	max-width: v-bind(maxWidthPixel);
	box-sizing: border-box;
	position: relative;
	margin-top: #{$closeSize + $closeGap};

	&.type--video,
	&.type--youtube {
		box-shadow: 0 6px 13px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(0, 0, 0, 1);
	}

	.modal__veil {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		box-sizing: border-box;
		backdrop-filter: blur(10px);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: opacity 300ms ease;
		opacity: 1;
		z-index: 2;
		background-color: rgba(0, 0, 0, 0.5);

		&.v-enter-from,
		&.v-leave-to {
			opacity: 0;
		}
	}

	.modal__close {
		box-sizing: border-box;
		display: inline-block;
		right: 0;
		bottom: 100%;
		margin-bottom: $closeGap;
		vertical-align: top;
		z-index: 2;
		width: $closeSize;
		height: $closeSize;
		position: absolute;
		@include hidetext;

		@include mobile {
			width: 20px;
			height: 20px;
		}

		button {
			width: 100%;
			height: 100%;
			margin-left: auto;
			box-sizing: border-box;

			i {
				width: 100%;
				height: 100%;
				display: inline-block;
				background-color: #fff;
			}
		}
	}

	.modal__source {
		display: flex;
		position: relative;
		box-sizing: border-box;
		transition: opacity 300ms ease;
		will-change: width, height;
		max-width: 100%;
		max-height: 100%;
		width: 100%;
		height: 100%;
		border-radius: inherit;
		overflow: hidden;

		.modal__source__ratio {
			position: relative;
			padding-top: 56.5%;
			height: 0;
			max-height: 100%;
			display: inline-block;
			pointer-events: none;
			width: 100vw;
			z-index: -1;
			box-sizing: border-box;
			transition: padding-top 400ms $EASE_outExpo;
			.modal.type--image & {
				display: none;
			}
		}

		.modal__source__image {
			display: flex;
			justify-content: center;
			vertical-align: top;
			box-sizing: border-box;
			width: auto;
			height: auto;

			&.-link {
				transition: filter 300ms ease, transform 300ms ease;
				@include hover {
					filter: contrast(1.05) brightness(1.05);
				}
			}

			img {
				width: 100%;
				height: auto;
				display: block;
				max-height: 110vh;
				object-fit: contain;
				box-sizing: border-box;
			}
		}
		.modal__video {
			video {
				width: 100%;
				height: 100%;
				position: relative;
				box-sizing: border-box;
				@include source-basic;
			}
		}

		.modal__video,
		:deep(.modal__youtube),
		:deep(.modal__twitch) {
			position: absolute;
			box-sizing: border-box;
			object-fit: cover;
			object-position: center;
			width: 100%;
			max-width: 100%;
			height: 100%;
			display: block;
			left: 50%;
			top: 50%;
			transform: translate3d(-50%, -50%, 0);
			border-radius: inherit;
		}
	}

	&.-over {
		margin-top: 0;
		.modal__close {
			width: $closeSize;
			left: 100%;
			top: 0;
			margin-bottom: 0;
			margin-left: $closeGap;
			right: unset;
		}
	}
}
</style>
