// App init 시 필요한 코드를 작성합니다.

import { useInfoStore, useGlobalStore } from "@store";
import VueDOMPurifyHTML from "vue-dompurify-html";

const _setupGlobalBodyClass = ($payloads) => {
	const { route, infoStore, globalStore } = $payloads;

	const detectClassList = computed(() => {
		const list = [];
		const layout = route?.meta?.layout;
		const { isWebview, mode, isUseTouch, isUseMouse, device, os, browser } = infoStore;

		const { isScrolllock, scroll } = globalStore;

		list.push(`path--${route.name}`);
		layout && list.push(`layout--${layout}`);
		isWebview && list.push(`-webview`);
		// list.push(`-freeze`);
		isScrolllock && list.push(`-scrolllock`);
		mode && list.push(`mode--${mode}`);
		isUseTouch && list.push(`use--touch`);
		isUseMouse && list.push("use--mouse");
		device && list.push(`device--${device}`);
		os && list.push(`os--${os}`);
		browser && list.push(`browser--${browser}`);
		list.push(`scroll--${scroll.target}`);
		return list;
	});

	useHead({
		bodyAttrs: {
			class: detectClassList,
		},
	});
};

export default defineNuxtPlugin((nuxtApp) => {
	const route = useRoute();
	const infoStore = useInfoStore();
	const globalStore = useGlobalStore();
	const setupPayloads = {
		route,
		infoStore,
		globalStore,
	};
	// html <body> 태그 클래스에 앱에서 감지중인 환경 값에 대한 클래스명을 부여
	_setupGlobalBodyClass(setupPayloads);

	// VueDOMPurifyHTML 플러그인 설치
	nuxtApp.vueApp.use(VueDOMPurifyHTML);
});
