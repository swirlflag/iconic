<template>
	<template v-if="!ssr">
		<ClientOnly>
			<slot name="initial" v-if="isShowinitial"></slot>
			<slot name="pending" v-if="isShowPending">
				<div class="asc-block asc-pending" :class="{ '-fit': props.fit, '-noborder': props.noborder }">
					<SpinnerSample />
				</div>
			</slot>
			<slot v-if="isShowSuccess"></slot>
			<slot name="success" v-if="isShowSuccess"></slot>
			<slot name="failure" v-if="isShowFailure">
				<div class="asc-block asc-failure" :class="{ '-fit': props.fit, '-noborder': props.noborder }">
					<div class="asc-failure__wrap">
						<svg width="62" height="52" viewBox="0 0 62 52" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M61.5757 47.5244L61.5931 47.5136L33.4994 1.42388L33.4819 1.43368C32.9753 0.578573 32.0579 0 31 0C29.9809 0 29.0887 0.532483 28.5694 1.33562L28.5529 1.32582L0.459188 47.4155L0.475656 47.4253C0.177281 47.8882 0 48.4383 0 49.0316C0 50.6565 1.30103 51.9735 2.90625 51.9735C2.91497 51.9735 2.92369 51.9706 2.93241 51.9706V52H59.1199V51.9706C60.7125 51.9559 62 50.6477 62 49.0316C62 48.4785 61.8402 47.9667 61.5757 47.5244ZM31 46.0897C28.86 46.0897 27.125 44.3334 27.125 42.1672C27.125 40.001 28.86 38.2447 31 38.2447C33.14 38.2447 34.875 40.001 34.875 42.1672C34.875 44.3334 33.14 46.0897 31 46.0897ZM34.875 31.3802C34.875 33.5465 33.14 35.3028 31 35.3028C28.86 35.3028 27.125 33.5465 27.125 31.3802V16.6708C27.125 14.5045 28.86 12.7482 31 12.7482C33.14 12.7482 34.875 14.5045 34.875 16.6708V31.3802Z"
							/>
						</svg>
						<p>{{ props.failureMessage }}</p>
					</div>
				</div>
			</slot>
		</ClientOnly>
	</template>
	<template v-else>
		<slot name="initial" v-if="isShowinitial"></slot>
		<slot name="pending" v-if="isShowPending">
			<div class="asc-block asc-pending" :class="{ '-fit': props.fit, '-noborder': props.noborder }">
				<SpinnerSample />
			</div>
		</slot>
		<slot v-if="isShowSuccess"></slot>
		<slot name="success" v-if="isShowSuccess"></slot>
		<slot name="failure" v-if="isShowFailure">
			<div class="asc-block asc-failure" :class="{ '-fit': props.fit, '-noborder': props.noborder }">
				<div class="asc-failure__wrap">
					<svg width="62" height="52" viewBox="0 0 62 52" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M61.5757 47.5244L61.5931 47.5136L33.4994 1.42388L33.4819 1.43368C32.9753 0.578573 32.0579 0 31 0C29.9809 0 29.0887 0.532483 28.5694 1.33562L28.5529 1.32582L0.459188 47.4155L0.475656 47.4253C0.177281 47.8882 0 48.4383 0 49.0316C0 50.6565 1.30103 51.9735 2.90625 51.9735C2.91497 51.9735 2.92369 51.9706 2.93241 51.9706V52H59.1199V51.9706C60.7125 51.9559 62 50.6477 62 49.0316C62 48.4785 61.8402 47.9667 61.5757 47.5244ZM31 46.0897C28.86 46.0897 27.125 44.3334 27.125 42.1672C27.125 40.001 28.86 38.2447 31 38.2447C33.14 38.2447 34.875 40.001 34.875 42.1672C34.875 44.3334 33.14 46.0897 31 46.0897ZM34.875 31.3802C34.875 33.5465 33.14 35.3028 31 35.3028C28.86 35.3028 27.125 33.5465 27.125 31.3802V16.6708C27.125 14.5045 28.86 12.7482 31 12.7482C33.14 12.7482 34.875 14.5045 34.875 16.6708V31.3802Z"
						/>
					</svg>
					<p>{{ props.failureMessage }}</p>
				</div>
			</div>
		</slot>
	</template>
</template>

<script setup>
const INITIAL = "initial";
const PENDING = "pending";
const SUCCESS = "success";
const FAILURE = "failure";

const props = defineProps({
	AS: {
		type: Object,
		required: true,
	},
	limitTime: {
		type: Number,
		default: 10,
	},
	finally: {
		type: Boolean,
		default: false,
	},
	initial: {
		type: String,
		default: INITIAL,
		validator: (value) => [INITIAL, PENDING, SUCCESS, FAILURE].includes(value),
	},
	pending: {
		type: String,
		default: PENDING,
		validator: (value) => [INITIAL, PENDING, SUCCESS, FAILURE].includes(value),
	},
	success: {
		type: String,
		default: SUCCESS,
		validator: (value) => [INITIAL, PENDING, SUCCESS, FAILURE].includes(value),
	},
	failure: {
		type: String,
		default: FAILURE,
		validator: (value) => [INITIAL, PENDING, SUCCESS, FAILURE].includes(value),
	},
	failureMessage: {
		type: String,
		default: "오류가 발생했습니다.",
	},
	ssr: {
		type: Boolean,
		default: false,
	},
});

const computedViewStatus = computed(() => {
	if (props.AS.isInitial) {
		return props[INITIAL];
	}
	if (props.AS.isPending) {
		return props[PENDING];
	}
	if (props.AS.isSuccess) {
		return props[SUCCESS];
	}
	if (props.AS.isFailure) {
		return props[FAILURE];
	}
});
const isFinaly = computed(() => {
	return computedViewStatus.value === FAILURE && props.finally;
});
const isShowinitial = computed(() => {
	return computedViewStatus.value === INITIAL && props.initial === INITIAL;
});
const isShowPending = computed(() => {
	return computedViewStatus.value === PENDING && props.pending === PENDING;
});
const isShowSuccess = computed(() => {
	return (computedViewStatus.value === SUCCESS && props.success === SUCCESS) || isFinaly.value;
});
const isShowFailure = computed(() => {
	return computedViewStatus.value === FAILURE && props.failure === FAILURE && !isFinaly.value;
});
</script>

<style scoped lang="scss">
@keyframes asc-pending-flow {
	0% {
		transform: translate3d(0, 0, 0) skewX(-15deg);
	}
	75% {
		transform: translate3d(400%, 0, 0) skewX(-15deg);
	}
	100% {
		transform: translate3d(400%, 0, 0) skewX(-15deg);
	}
}
@keyframes asc-failure-blink {
	0% {
		opacity: 0;
	}
	5% {
		opacity: 0.7;
	}
	15% {
		opacity: 0.3;
	}
	30% {
		opacity: 0.9;
	}
	50% {
		opacity: 0.4;
	}
	65% {
		opacity: 0.8;
	}
	80% {
		opacity: 0.4;
	}
	100% {
		opacity: 0.8;
	}
}

.asc-block {
	border: 1px solid rgba(160, 160, 160, 0.25);
	background-color: rgba(190, 190, 190, 0.1);
	height: 200px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	position: relative;
	overflow: hidden;
	font-size: 13px;

	&.-fit {
		min-height: unset;
		flex: 1;
		height: 100%;
	}
	&.-noborder {
		border: none;
	}
}

.asc-pending {
	&::before {
		pointer-events: none;
		content: "";
		width: 33.33%;
		height: 100%;
		position: absolute;
		right: 100%;
		top: 0;
		background: transparent;
		background: linear-gradient(
			90deg,
			rgba(150, 150, 150, 0) 0%,
			rgba(190, 190, 190, 0.1) 50%,
			rgba(150, 150, 150, 0) 100%
		);
		animation: asc-pending-flow 1.25s linear infinite;
	}
}

.asc-failure {
	border-color: COLOR_red_400(0.25);
	background-color: COLOR_red_400(0.05);

	.asc-failure__wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: transform 300ms ease;
		position: relative;
		svg {
			width: 24px;
			height: 20px;
			animation: asc-failure-blink 320ms ease 100ms both;
			path {
				fill: COLOR_red_400(0.5);
			}
		}
		p {
			line-height: 1;
			margin-top: 6px;
			color: COLOR_red_400(0.5);
			opacity: 0;
			transition: opacity 300ms ease;
			position: absolute;
			top: 100%;
			white-space: nowrap;
		}
	}
	&:hover {
		.asc-failure__wrap {
			transform: translate3d(0, -8px, 0);
			p {
				opacity: 1;
			}
		}
	}
}
</style>
