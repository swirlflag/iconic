const isDev = import.meta.dev;
const isClient = import.meta.client;
const isServer = import.meta.server;

console.stackTrace = () => {
	var err = new Error();
	let result = err.stack.split("\n")[3].trim();
	console.log(`%c↑ ${result}`, "font-weight: 700; background-color: #000; padding: 1px");
};

const setConsole = () => {
	console.dev = (...log) => {
		if (!isDev) {
			console.clear();
			return;
		}
		console.log(...log);
		console.stackTrace();
	};

	console.devcolor = (first, ...log) => {
		if (!isDev) {
			console.clear();
			return;
		}
		console.log(`%c${first}`, "font-weight: 700;padding: 2px;background: rgb(8, 32, 99); color: #fff", ...log);
		console.stackTrace();
	};

	console.deverror = (first, ...log) => {
		if (!isDev) {
			console.clear();
			return;
		}
		console.log(`%c${first}`, "font-weight: 700;padding: 2px;background: rgb(180, 40, 40); color: #fff", ...log);
		console.stackTrace();
	};

	console.client = (...log) => {
		if (!isClient) {
			console.clear();
			return;
		}
		console.log(...log);
		console.stackTrace();
	};

	console.server = (...log) => {
		if (!isServer) {
			console.clear();
			return;
		}
		console.log(...log);
		console.stackTrace();
	};
};

const setGlobalModel = (nuxtApp) => {
	nextTick(() => {
		if (!isDev) {
			return;
		}
		if (!isClient) {
			return;
		}

		let _window = globalThis || {};
		if (!_window) {
			return;
		}
		_window.NM = nuxtApp;
		_window.VM = nuxtApp.vueApp;
	});
};

const setStore = (nuxtApp) => {
	// nextTick(() => {
	// 	if (!isDev) {
	// 		return;
	// 	}
	// 	if (!isClient) {
	// 		return;
	// 	}
	// 	const testStores = {
	// 		modalStore: useModalStore(),
	// 		detectStore: useDetectStore(),
	// 		globalStore: useGlobalStore(),
	// 		nexonStore: useNexonStore(),
	// 		mouseStore: useMouseStore(),
	// 		audioStore: useAudioStore(),
	// 		toastStore: useToastStore(),
	// 	};
	// 	console.devcolor("개발 환경이 감지되어 스토어를 설치합니다. =>", testStores);
	// 	nuxtApp.provide("store", testStores);
	// });
};

const devinit = (nuxtApp) => {
	setConsole(nuxtApp);

	// client window에 nuxt root model 참조
	setGlobalModel(nuxtApp);

	// 개발모드일시 글로벌에 스토어 참조
	// setStore(nuxtApp);
};

export default defineNuxtPlugin(devinit);
