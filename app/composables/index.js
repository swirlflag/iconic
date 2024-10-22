// vue 문법의 컴포저블 함수들을 작성합니다. (react hooks와 유사)
// https://v3-docs.vuejs-korea.org/guide/reusability/composables.html
import dayjs from "dayjs";
import gsap from "gsap";
import { useNexonStore, useModalStore, useAsyncStore, useInfoStore, useCommunityStore, useGlobalStore } from "@store";
import {
	usePointer,
	useWindowScroll,
	useWindowSize,
	useClipboard,
	useTimestamp,
	useScroll,
	useThrottleFn,
} from "@vueuse/core";

// 현재 환경 env 값 획득
export const useEnv = () => {
	const config = useRuntimeConfig();
	const env = config?.public?.env;
	return env;
};

export const useAuthGuard = (options = {}) => {
	// [MEMO] 커뮤니티 자동 가입 로직 추가로 기본 depth를 nexon으로 변경
	const { to = null, depth = "nexon", modal = true } = options;

	const nexonStore = useNexonStore();
	const modalStore = useModalStore();
	const AS = useAsyncStore();
	const isNexonSignIn = nexonStore.checkSignIn(to);
	const isClient = import.meta.client;

	if (AS.inface.isPending) {
		modalStore.open("인증 정보를 확인 중입니다.<br>잠시 후 다시 시도해 주세요.");
		return { type: "install", block: true, server: !isClient };
	}

	if (!isNexonSignIn) {
		const isUseModal = modal && isClient;
		if (isUseModal) {
			modalStore.open({
				type: "confirm",
				title: "로그인 필요",
				message: "로그인이 필요한 서비스입니다.<br>로그인 화면으로 이동하시겠습니까?",
				onConfirm: () => {
					const redirect = to ? window.origin + to : location.href;
					const payload = { redirect_uri: redirect };
					nexonStore.gotoSignIn(payload);
				},
			});
		}
		return { type: "nexon", block: true, server: !isClient };
	}

	// [MEMO] 커뮤니티 자동 가입 로직 추가로 커뮤니티 정보 확인용으로만 사용
	const needCheckCommunity = isClient && depth === "community";
	if (needCheckCommunity) {
		const communityStore = useCommunityStore();
		if (!communityStore.isSignIn) {
			const modalStore = useModalStore();
			modalStore.open("커뮤니티 정보를 확인 중입니다.<br/>잠시 후 다시 시도해 주세요.");
		}
		return { type: "community", block: true, server: detectStore.isServer };
	}

	return { type: "ok", block: false, server: import.meta.server };
};

export const useAsyncStatus = (options = { name: null, status: null, log: false, methods: true }) => {
	const INITIAL = "initial";
	const PENDING = "pending";
	const SUCCESS = "success";
	const FAILURE = "failure";

	const error = ref(null);
	const status = ref(options.status || INITIAL);
	const name = ref(options.name);

	const isTimeout = ref(false);
	const isLock = ref(false);

	const isInitial = computed(() => status.value === INITIAL);
	const isPending = computed(() => status.value === PENDING);
	const isSuccess = computed(() => status.value === SUCCESS);
	const isFailure = computed(() => status.value === FAILURE);
	const isCustom = computed(() => !isInitial.value && !isPending.value && !isSuccess.value && !isFailure.value);

	const initial = () => {
		if (isLock.value) {
			return;
		}
		status.value = INITIAL;
		error.value = null;
	};

	const pending = () => {
		if (isLock.value) {
			return;
		}
		status.value = PENDING;
		error.value = null;
	};

	const success = () => {
		if (isLock.value) {
			return;
		}
		status.value = SUCCESS;
		error.value = null;
	};

	const failure = (newError = null) => {
		if (isLock.value) {
			return;
		}
		status.value = FAILURE;
		error.value = newError;
	};

	const custom = (customType) => {
		if (isLock.value) {
			return;
		}
		status.value = customType;
		error.value = null;
		return customType;
	};

	const lock = () => {
		isLock.value = true;
	};

	const unlock = () => {
		isLock.value = false;
	};

	const stay = (types = [SUCCESS, FAILURE], limitTime = 10) => {
		// [MEMO] types는 성공,실패 에 대한 대기를 기본값으로 처리

		if (typeof types === "string") {
			types = [types];
		}

		return new Promise((resolve) => {
			if (types.includes(status.value)) {
				isTimeout.value = false;
				resolve({ timeout: false, immediate: true });
				return;
			}

			const timeout = setTimeout(() => {
				unwatch();
				isTimeout.value = true;
				console.devcolor(`[AS stay timeout] ${name.value}: ${status.value}`);
				resolve({ timeout: true, immediate: false });
			}, limitTime * 1000);

			const unwatch = watch(status, (now) => {
				if (types.includes(now)) {
					unwatch();
					clearTimeout(timeout);
					isTimeout.value = false;
					resolve({ timeout: false, immediate: false });
				}
			});
		});
	};

	const stayFinally = () => {
		//
	};

	watch(status, (now) => {
		if (options.log) {
			console.devcolor(`useAsyncStatus: ${name.value}의 상태가 ${now}로 변경되었습니다.`);
		}
	});

	return {
		status,
		name,
		error,
		isInitial,
		isPending,
		isSuccess,
		isFailure,
		isCustom,
		isTimeout,
		initial,
		pending,
		success,
		failure,
		lock,
		unlock,
		custom,
		stay,
		// stayFinally,
	};
};

// useDetector. 화면 상에서 감지되는 값중 자주 사용하는 것들을 모아두었습니다.
// scroll, screen 은 globalStore에 저장되어 있고, 이를 참조하여 사용합니다.
// pointer는 vueuse의 usePointer를 사용하고 있으며 60fps의 쓰로틀링이 적용됩니다.
export const useDetector = () => {
	const globalStore = useGlobalStore();
	const pointerData = usePointer();

	const screen = globalStore.screen;
	const scroll = globalStore.scroll;

	const pointer = reactive({
		x: 0,
		y: 0,
		rx: 0,
		ry: 0,
		cx: 0,
		cy: 0,
	});

	const _updatePointer = () => {
		const x = pointerData.x.value;
		const y = pointerData.y.value;

		pointer.x = x;
		pointer.y = y;
		pointer.rx = x / (screen.width || 1);
		pointer.ry = y / (screen.height || 1);
		pointer.cx = pointer.rx - 0.5;
		pointer.cy = pointer.ry - 0.5;
	};

	const _throttledUpdatePointer = useThrottleFn(_updatePointer, 16, { leading: true, trailing: true });

	watch(
		[pointerData.x, pointerData.y],
		() => {
			_throttledUpdatePointer();
		},
		{ flush: "sync" },
	);

	return {
		pointer,
		screen,
		scroll,
	};
};

export const useCopyURL = async () => {
	if (!import.meta.browser) {
		return;
	}
	const source = location.href;
	const clipboard = useClipboard({ source });
	await clipboard.copy();
	return true;
};

export const useCopy = async (copyString) => {
	if (!import.meta.browser) {
		return;
	}
	const source = copyString;
	const clipboard = useClipboard({ source });
	await clipboard.copy();
	return true;
};

export const useTimer = (limitTime) => {
	const check = ref(checkRelease(limitTime));
	const isBefore = ref(null);
	const isRelease = ref(null);
	const leftTime = ref(null);
	const timeout = ref(null);

	const tick = () => {
		if (!check.value.isBefore) {
			timeout.value && clearTimeout(timeout.value);
			return;
		}
		check.value = checkRelease(limitTime);
		isBefore.value = check.value.isBefore;
		isRelease.value = check.value.isRelease;
		leftTime.value = check.value.leftTime;
		timeout.value = setTimeout(tick, 1000);
	};

	tick();

	onUnmounted(() => {
		timeout.value && clearTimeout(timeout.value);
	});

	return {
		isBefore,
		isRelease,
		leftTime,
	};
};

export const useOpenGraph = (options = {}) => {
	const isClient = import.meta.client;
	const isServer = import.meta.server;

	let route = { path: "" };

	if (isClient) {
		route = useRoute();
	}

	const { HOST_URL, PROJECT_TITLE, PROJECT_DESCRIPTION } = useEnv();

	const defaults = {
		title: PROJECT_TITLE,
		description: PROJECT_DESCRIPTION,
		url: `https://${HOST_URL}${route.path}`,
		image: cdn("/global/og.jpg"),
	};

	const metas = {
		title: options.title || defaults.title,
		ogTitle: options.title || defaults.title,
		description: options.description || defaults.description,
		ogDescription: options.description || defaults.description,
		ogImage: options.image || defaults.image,
		ogUrl: options.url || defaults.url,
	};

	const link = [{ rel: "canonical", href: metas.ogUrl }];

	// const isNeedTail = metas.title !== defaults.title && metas.title.indexOf(`- ${defaults.title}`) === -1 && isClient;

	// if (isNeedTail) {
	// 	metas.title = metas.title ? `${metas.title} - ${defaults.title}` : defaults.title;
	// 	metas.ogTitle = metas.title ? `${metas.title} - ${defaults.title}` : defaults.title;
	// }

	useSeoMeta(metas);
	useHead({ link });
};

// https://confluence.nexon.com/display/NXCOM/A2S
export const useA2S = async (defaultType = "action", payload = {}) => {
	if (import.meta.server) {
		console.log("return server");
		return;
	}

	// [MEMO] $h 는 nexonGnb를 설치하면 자동으로 설치되기 때문에, nexonGnb의 AS를 사용합니다.

	const AS = useAsyncStore();
	await AS.nexonGnb.stay();

	if (typeof $h === "undefined") {
		return;
	}

	const env = useEnv();
	const infoStore = useInfoStore();
	const communityStore = useCommunityStore();

	const logData = {
		defaultType,
		gameCode: env.GAMECODE,
		device: infoStore.device,
		...payload,
	};

	if (communityStore?.user?.npsnUser) {
		logData.npsnCode = communityStore.user?.npsnUser;
	}

	if (defaultType === "load") {
		if (!logData.actionType) {
			logData.actionType = "load";
		}
		$h.a2s.sendContentsLog(defaultType, JSON.stringify(logData));
	} else {
		$h.a2s.sendClickLog(defaultType, JSON.stringify(logData));
	}
};

export const useGtag = (eventName, options) => {
	const isClient = import.meta.client;
	if (!isClient) {
		return;
	}

	if (!window.gtag) {
		return;
	}

	window.gtag("event", eventName, options);
};

export const useWaitModal = async (request, delay = 0) => {
	const modalStore = useModalStore();

	let isWait = false;
	let waitModal = modalStore.create({ type: "wait" });

	setTimeout(() => {
		if (isWait) {
			waitModal.open();
		}
	}, delay);

	let result = null;
	try {
		isWait = true;
		result = await request();
	} catch (error) {
		result = error;
		console.error(error);
	} finally {
		isWait = false;
		waitModal.isOpen && waitModal.close();
	}
	return result;
};

export const useScrollTo = (initScrollValue, initOptions) => {
	const globalStore = useGlobalStore();

	const action = async (value = 0, options = {}) => {
		const el = globalStore.scroll.el;

		if (!el) {
			return;
		}

		await gsap.to(el, {
			scrollTo: value,
			duration: 0.3,
			ease: "power3.out",
			overwrite: true,
			...options,
		});
	};

	if (typeof initScrollValue === "number") {
		action(initScrollValue, initOptions);
	}

	return action;
};
