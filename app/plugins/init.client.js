// client init 시 필요한 코드를 작성합니다.

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGlobalStore } from "@store";

const _setupHeadInstall = () => {
	const env = useEnv();
	const gtagKey_AW = env.GOOGLE_AW;
	const gtagKey_GTM = env.GOOGLE_GTM;

	const headOptions = {
		htmlAttrs: {
			lang: "ko",
		},
		noscript: [
			{
				children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtagKey_GTM}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
				body: true,
			},
		],
		script: [
			{
				children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtagKey_GTM}');
				`,
			},

			{
				src: `https://www.googletagmanager.com/gtag/js?id=${gtagKey_AW}`,
			},
			{
				children: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gtagKey_AW}'); gtag('config', '${gtagKey_AW}');`,
			},

			{
				src: "http://platform.nexon.com/ngm/js/npf_ngm.js",
			},
		],
	};

	useHead(headOptions);
};

const _setupGSAP = () => {
	gsap.registerPlugin(Flip);
	gsap.registerPlugin(ScrollTrigger);
	gsap.registerPlugin(ScrollToPlugin);
};

const _setupWindowVariable = () => {
	const detector = useDetector();
	const route = useRoute();

	watch(
		() => detector.screen.width,
		(now) => {
			setRootStyleValue("window-width", now + "px");
		},
		{ immediate: true },
	);
	watch(
		() => detector.screen.height,
		(now) => {
			setRootStyleValue("window-height", now + "px");
		},
		{ immediate: true },
	);
};

const _setupA2S = () => {
	const route = useRoute();

	watch(
		() => route.path,
		() => {
			// globalStore.setPageName(route.name);
			// globalStore.setScrollTargetWindow();
			useA2S("load");
		},
		{ immediate: true },
	);
};

const _setupStoreInstall = () => {
	const globalStore = useGlobalStore();

	globalStore.install();
};

export default defineNuxtPlugin((nuxtApp) => {
	// head 설정
	_setupHeadInstall();

	// a2s 설정
	_setupA2S();

	// window 전역 변수 설정
	_setupWindowVariable();

	// gsap 플러그인 설치
	_setupGSAP();

	// store client install들을 실행
	_setupStoreInstall();
});
