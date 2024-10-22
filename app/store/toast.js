class Toast {
	static types = ["default", "success", "error"];
	constructor(options = {}) {
		const type = options.type || "default";
		const time = options.time || options.second;

		this.type = type;
		this.second = typeof time === "undefined" ? 5 : time;
		this.once = true;
		this.progress = 0;
		this.eventList = {};
		this.onCreate = () => this;
		this.onCloseComplete = () => this;

		Object.entries(options).forEach(([k, v]) => {
			this[k] = v;
		});
	}

	on(eventName, fn) {
		if (typeof eventName === "string" && typeof fn === "function") {
			if (!this.eventList[eventName]) {
				this.eventList[eventName] = [];
			}
			this.eventList[eventName] = [...this.eventList[eventName], fn];
		}
	}
	eventFire(eventName, data) {
		if (this.eventList[eventName]) {
			this.eventList[eventName].forEach((fn) => {
				fn(this, data);
			});
		}
	}
	open() {
		open(this.uid);
	}

	close() {
		close(this.uid);
	}

	destroy() {
		destroy(this.uid);
	}

	patch(action = () => {}) {
		action(this);
	}
	onOpen() {}
	onCreate() {
		return this;
	}
	onCloseComplete() {
		return this;
	}
}

export const useToastStore = defineStore("toast", () => {
	const uidStack = ref(0);
	const openList = ref([]);
	const toasts = reactive({});

	const isOpen = computed(() => openList.value.length > 0);

	const getOpenItem = (uid) => {
		uid = uid === undefined && openList.value.length > 0 ? openList.value[openList.value.length - 1].uid : +uid;
		const index = openList.value.map((c) => c.uid).indexOf(uid);
		if (index === -1) {
			return {};
		}
		const item = openList.value[index];
		return { item, index };
	};

	const create = (options, isWithOpen = false) => {
		let payload = {};

		if (typeof options === "string") {
			payload = { message: options };
		} else {
			payload = { ...options };
		}

		payload.uid = ++uidStack.value;

		if (!isWithOpen) {
			payload.once = false;
		}

		const item = new Toast(payload);
		item.isCreated = true;
		toasts[payload.uid] = item;

		item.onCreate(item);
		item.eventFire("create");

		return item;
	};

	const open = (options = {}) => {
		let item = null;
		const isNumber = typeof options === "number" && !isNaN(options);

		if (isNumber) {
			if (!toasts[options]) {
				throw `uid ${options} : toastStore.toasts에 내 등록되지 않은 uid입니다.`;
			}
			if (toasts[options].isOpen) {
				throw `uid ${options} : 해당 번호의 토스트는 이미 열려 있습니다.`;
			}
			item = toasts[options];
		} else {
			item = create(options, true);
		}

		openList.value.push(item);
		item.onOpen(item);
		item.eventFire("open");
		item.isOpen = true;
		return item;
	};

	const close = (uid, closeType = "close") => {
		const { item, index } = getOpenItem(uid);
		if (!isOpen.value) {
			throw `열려 있는 토스트가 없습니다.`;
		}
		if (!item) {
			throw `uid ${uid} : 해당 번호로 열려있는 토스트가 없습니다.`;
		}

		item.isClosing = true;

		openList.value.splice(index, 1);
		item.onClose && item.onClose(item, closeType);
		item.eventFire("close", closeType);

		if (item.once && closeType !== "destroy") {
			destroy(item.uid);
		}

		item.isOpen = false;
		item.isClosing = false;
		return item;
	};

	const closeAll = () => {
		const uids = [];
		openList.value.forEach((item) => {
			uids.push(item.uid);
		});
		uids.forEach((uid) => {
			close(uid);
		});
	};

	const destroy = (uid) => {
		const item = toasts[uid];
		if (!item) {
			throw `uid ${uid} : 이 번호로 등록된 토스트가 없습니다.`;
		}
		item.eventFire("beforeDestroy");

		if (item.isOpen) {
			item.on("closeComplete", () => {
				delete toasts[uid];
			});
			if (!item.isClosing) {
				item.close();
			}
		} else {
			delete toasts[uid];
		}
		item.eventFire("destroy");
	};

	return {
		isOpen,
		toasts,
		openList,

		create,
		open,
		close,
		closeAll,
	};
});
