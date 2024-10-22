export const useNavStore = defineStore("nav", () => {
	const route = useRoute();
	const gnb = reactive({
		use: false,
		gap: false,
		height: 0,
		open: false,
		paths: {},
	});

	const nexonGnb = reactive({
		use: false,
		gap: false,
		height: 0,
		hide: false,
		fix: false,
		paths: {},
	});

	watchEffect(() => {
		const path = gnb.paths?.[route.path];
		path?.use !== undefined && (gnb.use = path.use);
		path?.gap !== undefined && (gnb.gap = path.gap);
	});

	watchEffect(() => {
		const path = nexonGnb.paths?.[route.path];
		path?.use !== undefined && (nexonGnb.use = path.use);
		path?.gap !== undefined && (nexonGnb.gap = path.gap);
		path?.fix !== undefined && (nexonGnb.fix = path.fix);
	});

	const useGnb = async ($payload = {}) => {
		await nextTick();
		const path = $payload.path || route.path;
		gnb.paths[path] = {
			...gnb.paths[path],
			use: true,
			gap: true,
			...$payload,
		};
	};
	const unuseGnb = async ($payload = {}) => {
		await nextTick();
		const path = $payload.path || route.path;
		gnb.paths[path] = {
			...gnb.paths[path],
			use: false,
			gap: false,
			...$payload,
		};
	};
	const openGnb = () => {
		gnb.open = true;
	};
	const closeGnb = () => {
		gnb.open = false;
	};

	const showNexonGnb = () => {
		nexonGnb.hide = false;
	};
	const hideNexonGnb = () => {
		nexonGnb.hide = true;
	};

	const useNexonGnb = async ($payload = {}) => {
		await nextTick();
		const path = $payload.path || route.path;
		nexonGnb.paths[path] = {
			...nexonGnb.paths[path],
			use: true,
			gap: true,
			// fix: false,
			...$payload,
		};
	};
	const unuseNexonGnb = async ($payload = {}) => {
		await nextTick();
		const path = $payload.path || route.path;
		nexonGnb.paths[path] = {
			...nexonGnb.paths[path],
			use: false,
			gap: false,
		};
	};

	const navtopHeight = computed(() => {
		const gnbHeight = gnb.use && gnb.gap ? gnb.height : 0;
		const nexonGnbHeight = nexonGnb.use && nexonGnb.gap ? nexonGnb.height : 0;
		return gnbHeight + nexonGnbHeight;
	});

	return {
		gnb,
		useGnb,
		unuseGnb,
		openGnb,
		closeGnb,
		nexonGnb,
		showNexonGnb,
		hideNexonGnb,
		useNexonGnb,
		unuseNexonGnb,
		navtopHeight,
	};
});
