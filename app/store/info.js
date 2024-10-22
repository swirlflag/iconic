export const useInfoStore = defineStore("info", () => {
	const requestURL = useRequestURL();
	const config = useRuntimeConfig();
	const requestQuery = queryToObject(requestURL.search);
	const mode = ref(import.meta.env.MODE);
	const isDev = ref(mode.value !== "live");
	const isClient = computed(() => import.meta.client);
	const isServer = computed(() => import.meta.server);

	const requestEvent = useRequestEvent();
	const userAgent = isClient.value
		? window.navigator.userAgent
		: requestEvent?.node?.req?.headers["user-agent"] || requestEvent?.node?.req?.headers?.["User-Agent"];

	const device = ref(null);
	const os = ref(null);
	const browser = ref(null);

	const isUseTouch = ref(null);
	const isUseMouse = ref(null);

	// const env = ref(config.public.env);

	const isWebview = ref(!!requestQuery.webview);
	const isMobile = computed(() => device.value === "mobile");
	const isTablet = computed(() => device.value === "tablet");
	const isDesktop = computed(() => device.value === "desktop");

	const isLiveURL = computed(() => requestURL.hostname.indexOf(config.public.LIVE_URL) === 0);
	const isIOS = computed(() => os.value === "ios");
	const isAndriod = computed(() => os.value === "android");
	const isWindow = computed(() => os.value === "window");

	if (isClient.value) {
		nextTick(() => {
			isUseTouch.value = detectUseTouch();
			isUseMouse.value = detectUseMouse();
		});
	}

	if (userAgent) {
		device.value = detectDevice(userAgent);
		os.value = detectOS(userAgent);
		browser.value = detectBrowser(userAgent);
	}

	return {
		mode,
		device,
		os,
		browser,
		isDev,
		isWebview,
		isMobile,
		isTablet,
		isDesktop,
		isLiveURL,
		isClient,
		isServer,
		isIOS,
		isAndriod,
		isWindow,
		isUseTouch,
		isUseMouse,
	};
});
