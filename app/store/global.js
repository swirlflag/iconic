import { useResizeObserver } from "@vueuse/core";

export const useGlobalStore = defineStore("global", () => {
	const $app = ref(null);
	const $page = ref(null);

	const isLoading = ref(false);
	const isPlateLoading = ref(true);
	const isScrolllock = computed(() => {
		return scroll.lock;
	});

	const screen = reactive({ width: 0, height: 0, ratio: 1 });

	const layout = reactive({
		name: "default",
	});

	const page = reactive({
		name: "",
		path: "",
		width: 0,
		height: 0,
	});

	const scroll = reactive({
		target: "window",
		el: null,
		lock: false,
		height: 0,
		y: 0,
		yRatio: 0,
		yEnd: false,
		yStart: false,
	});

	const lockScroll = () => {
		scroll.lock = true;
	};
	const unlockScroll = () => {
		scroll.lock = false;
	};

	const setScrollTargetApp = () => {
		if (import.meta.client) {
			scroll.target = "app";
		}
	};

	const setScrollTargetWindow = () => {
		if (import.meta.client) {
			scroll.target = "window";
		}
	};

	const loading = () => {
		isLoading.value = true;
	};
	const loaded = () => {
		isLoading.value = false;
	};

	const _calcScrollValue = () => {
		const scrollHeight = scroll.target === "app" ? scroll.height - 1 : scroll.height;
		scroll.yStart = scroll.y <= 0;
		scroll.yEnd = scroll.y >= scrollHeight - screen.height;
		scroll.yRatio = scroll.y / (scrollHeight - screen.height);
	};

	const install = () => {
		if (!import.meta.client) {
			return;
		}

		$app.value = document.querySelector("#app");
		$page.value = document.querySelector("#plate--page");

		window.addEventListener("resize", () => {
			screen.width = window.innerWidth;
			screen.height = window.innerHeight;
			screen.ratio = screen.width / screen.height;
		});

		window.addEventListener("scroll", () => {
			if (scroll.target === "window") {
				scroll.y = window.scrollY;
			}
		});

		$app.value.addEventListener("scroll", () => {
			if (scroll.target === "app") {
				scroll.y = $app.value.scrollTop;
				const yEnd = scroll.y === scroll.height - screen.height;
				if (yEnd) {
					$app.value.scrollTop = scroll.height - screen.height - 1;
				}
			}
		});

		watch(
			() => scroll.target,
			() => {
				if (scroll.target === "window") {
					$app.value.scrollTop = 0;
					$app.value.scrollLeft = 0;
					scroll.height = document.documentElement.scrollHeight;
					scroll.el = document.documentElement;
					return;
				}
				if (scroll.target === "app") {
					document.scrollingElement.scrollTop = 0;
					document.scrollingElement.scrollLeft = 0;
					scroll.height = $app.value.scrollHeight;
					scroll.el = $app.value;
					return;
				}
			},
			{ immediate: true, flush: "post" },
		);

		watch(
			() => scroll.y,
			() => {
				_calcScrollValue();
			},
		);

		useResizeObserver($page.value, () => {
			if (scroll.target === "app") {
				scroll.height = $app.value.scrollHeight;
				_calcScrollValue();
			}
		});

		useResizeObserver(document.scrollingElement, () => {
			if (scroll.target === "window") {
				scroll.height = document.scrollingElement.scrollHeight;
				_calcScrollValue();
			}
		});

		screen.width = window.innerWidth;
		screen.height = window.innerHeight;
		screen.ratio = screen.width / screen.height;
	};

	return {
		loading,
		loaded,
		isLoading,
		isPlateLoading,
		isScrolllock,
		lockScroll,
		unlockScroll,

		layout,
		page,

		screen,

		scroll,
		setScrollTargetApp,
		setScrollTargetWindow,

		install,
	};
});
