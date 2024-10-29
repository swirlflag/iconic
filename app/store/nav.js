const defaultSchema = {
	use: false,
	gap: true,
	open: false,
	hide: false,
	fix: false,
	height: 0,
	type: "unset",
	paths: {},
};

const DATA = {
	gnb: {
		type: "top",
	},
	"nexon-gnb": {
		type: "top",
	},
};

const refineData = Object.entries(DATA).reduce((p, [k, v]) => {
	const defaults = deepCopy(defaultSchema);
	p[k] = { ...defaults, ...v };
	return p;
}, {});

export const useNavStore = defineStore("nav", () => {
	const route = useRoute();

	const status = reactive({ ...refineData });

	const top = computed(() => {
		const list = Object.values(status).filter((v) => v.type === "top") || [];
		const [height, gap] = list.reduce(
			(p, c) => {
				p[0] += c.use ? c.height : 0;
				p[1] += c.use && c.gap ? c.height : 0;
				return p;
			},
			[0, 0],
		);
		return { list, height, gap };
	});

	const patch = (key, options = {}) => {
		const target = status[key];
		if (!target) {
			return;
		}

		const path = options.path || route.path;
		const before = target.paths[path] || {};
		status[key].paths[path] = {
			...before,
			...options,
		};
	};

	const use = (key, options = {}) => {
		patch(key, { use: true, ...options });
	};

	const unuse = (key) => {
		patch(key, { use: false });
	};

	watchEffect(() => {
		Object.entries(status).forEach(([k, v]) => {
			const pathOptions = v.paths?.[route.path];
			if (pathOptions) {
				status[k] = { ...status[k], ...pathOptions };
			}
		});
	});

	return {
		status,
		top,
		use,
		unuse,
		patch,
	};
});
