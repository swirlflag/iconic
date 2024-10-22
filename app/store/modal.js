/**
 * store
 *  modalStore.create(); => item
 *  modalStore.open(uid); => item
 *  modalStore.close(uid); => void
 * modal
 *  item.create(); => this
 *  item.open(); => this
 *  item.close(); => this
 */

import gsap from "gsap";

class Modal {
	static types_system = ["alert", "confirm", "wait", "system"];
	static types_source = ["video", "image", "youtube"];
	static defaultOptions = {};
	static defaultTypeOptions = {
		alert: {
			title: "알림",
			buttonCancel: false,
		},
		confirm: {
			title: "확인",
			buttonCancel: "취소",
		},
		wait: {
			title: "잠시만 기다려주세요",
			message: "브라우저를 종료하지 마시고 잠시만 기다려 주세요.",
			buttonClose: false,
			buttonConfirm: false,
			buttonCancel: false,
			dimmedFreeze: true,
		},
		image: {},
		video: {
			veil: true,
			time: 0,
		},
		youtube: {
			veil: true,
			time: 0,
		},
	};

	constructor(options = {}) {
		this.auth = false;
		this.type = options.type || "alert";
		this.isCreated = false;
		this.isMounted = false;
		this.title = "";
		this.message = "";
		this.freeze = false;
		this.dimmedFreeze = false;
		this.dimmedColor = false;
		this.scrolllock = true;
		this.important = false;
		this.veil = false;
		this.hash = null;
		this.blur = true;
		this.buttonClose = true;
		this.buttonConfirm = "확인";
		this.buttonCancel = false;
		this.ignoreMotion = false;
		this.className = null;
		this.once = true;
		this.video = null;
		this.link = null;
		this.isOpen = false;
		this.isVisible = false;
		this.isSystem = Modal.types_system.indexOf(this.type) > -1;
		this.isSource = Modal.types_source.indexOf(this.type) > -1;
		this.isUnique = this.type.indexOf("unique-") === 0;
		this.theme = null;
		this.ignoreTodayKey = null;
		this.ignoreTodayValue = false;
		this.holdPath = false;
		this.el = {};
		this.eventList = {};
		this.isSourceReady = false;
		this.autoplay = false;
		this.controls = true;

		this.src = null;
		this.loop = true;
		this.muted = false;
		// this.time = 0;
		this.key = null;
		this.uid = -1;
		this.uniqueData = null;
		this.isClosing = false;

		const typeDefaults = Modal.defaultTypeOptions[this.type];

		if (typeDefaults) {
			Object.entries(typeDefaults).forEach(([k, v]) => {
				this[k] = v;
			});
		}

		Object.entries(options).forEach(([k, v]) => {
			this[k] = v;
		});

		this.onInit();
		this.eventFire("init");
	}

	open() {}
	close() {}
	destroy() {}
	onInit() {}
	onCreate() {
		return this;
	}
	onOpen() {
		return this;
	}
	onClose() {
		return this;
	}
	onConfirm() {
		return true;
	}
	onConfirm() {
		return true;
	}
	onCancel() {
		return true;
	}
	onOpenComplete() {
		return this;
	}
	onCloseComplete() {
		return this;
	}

	onMouseEnterDimmed() {}
	onMouseLeaveDimmed() {}

	videoPlay() {
		if (this.type === "video") {
			if (!this.isVisible || !this?.el?.video) {
				return false;
			}
			this.el.video.play();
			return true;
		}
		if (this.type === "youtube") {
			console.log(this.isVisible, this.video);
			if (!this.isVisible || !this.player) {
				return false;
			}
			this.player.target.playVideo();
			return true;
		}
	}
	videoPause() {
		if (this.type === "video") {
			if (!this.isVisible || !this?.el?.video) {
				return false;
			}
			this.el.video.pause();
			return true;
		}
		if (this.type === "youtube") {
			if (!this.isVisible || !this.player) {
				return false;
			}
			this.player.target.pauseVideo();
			return true;
		}
	}
	videoProgress(time = 0) {
		if (this.type === "video") {
			if (!this.isVisible || !this?.el?.video) {
				return false;
			}
			const currentTime = time ?? this.time;
			this.el.video.currentTime = currentTime;
			return currentTime;
		}
		if (this.type === "youtube") {
			if (!this.isVisible || !this.player) {
				return false;
			}
			if (time) {
				this.player.target.seekTo(time);
			}
			return this.player.target.getCurrentTime();
		}
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

	patch(options = {}) {
		//
	}

	action(fn = () => {}) {
		//
	}
}

export const useModalStore = defineStore("modal", () => {
	const uidStack = ref(0);
	const openList = ref([]);
	const modals = reactive({});

	const route = useRoute();
	const router = useRouter();

	const isMounted = ref(false);
	const isOpen = computed(() => openList.value.length > 0);
	const isActive = computed(() => isMounted.value && isOpen.value);

	watch(
		[() => route.hash, uidStack],
		() => {
			const routeHash = route.hash.slice(1);

			Object.values(openList.value).forEach((item) => {
				if (!item.hash) {
					return;
				}

				if (item.hash !== routeHash && item.isOpen) {
					close(item.uid, "hash");
				}
			});

			if (!routeHash) {
				return;
			}

			nextTick(() => {
				const item = Object.values(modals).find((c) => c.hash === routeHash);

				if (item && !item.isOpen) {
					open(item.uid);
				}
			});
		},
		{ immediate: true },
	);

	const checkIgnoreCookie = (key) => {
		const noticeCookie = useCookie(`NUXT_PUBLIC_MODAL_KEY_${key}`, { maxAge: 60 * 60 * 24 });
		return noticeCookie.value;
	};

	const getOpenItem = (uid) => {
		uid = uid === undefined && openList.value.length > 0 ? openList.value[openList.value.length - 1].uid : +uid;
		const index = openList.value.map((c) => c.uid).indexOf(uid);
		if (index === -1) {
			return {};
		}
		const item = openList.value[index];
		return { item, index };
	};

	const inheritMethod = (item) => {
		item.open = () => open(item.uid);
		item.close = (closeType = "close") => close(item.uid, closeType);
		item.destroy = () => destroy(item.uid);
		item.patch = (options) => patch(item.uid, options);
		item.action = (fn) => fn(modals[item.uid]);
		item.confirm = () => close(item.uid, "confirm");
		item.cancel = () => close(item.uid, "cancel");
	};

	const create = (options, isWithOpen = false) => {
		if (options.hash) {
			const alreadyItem = Object.values(modals).find((c) => c.hash === options.hash);
			if (alreadyItem) {
				console.devcolor(
					`이미 동일한 hash를 지닌 모달이 있어 기존 모달을 삭제후 생성을 진행 합니다. {uid: ${alreadyItem.uid}, hash: "${options.hash}"}`,
				);
				destroy(alreadyItem.uid);
			}
		}

		let payload = {};

		if (typeof options === "string") {
			payload = { message: options };
		} else {
			payload = { ...options };
		}

		payload.uid = ++uidStack.value;

		if ((payload.hash && payload.once === undefined) || !isWithOpen) {
			payload.once = false;
		}

		const item = new Modal(payload);

		inheritMethod(item);
		item.isCreated = true;
		modals[payload.uid] = item;

		item.onCreate(item);
		item.eventFire("create");

		return item;
	};

	const open = (options = { once: true }) => {
		let item = null;
		const isNumber = typeof options === "number" && !isNaN(options);
		if (options.ignoreTodayKey) {
			if (checkIgnoreCookie(options.ignoreTodayKey)) {
				return;
			}
		}

		if (isNumber) {
			if (!modals[options]) {
				throw `uid ${options} : modalStore.modals 내 등록되지 않은 uid입니다.`;
			}
			if (modals[options].isOpen) {
				throw `uid ${options} : 해당 번호의 모달은 이미 열려 있습니다.`;
			}
			item = modals[options];
		} else {
			item = create(options, true);
		}

		if (item.hash) {
			router.push({ hash: `#${item.hash}` });
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
			throw `열려 있는 모달이 없습니다.`;
		}
		if (!item) {
			throw `uid ${uid} : 해당 번호로 열려있는 모달이 없습니다.`;
		}
		if (item.isClosing) {
			return;
		}

		item.isClosing = true;

		const isHashTypeButUserInterfaceClose = item.hash && item.isOpen && closeType !== "hash";
		if (isHashTypeButUserInterfaceClose) {
			router.push({ hash: "" });
		}

		openList.value.splice(index, 1);

		item.onClose(item, closeType);
		item.eventFire("close", closeType);

		if (item.ignoreTodayValue) {
			const noticeCookie = useCookie(`NUXT_PUBLIC_MODAL_KEY_${item.ignoreTodayKey}`, { maxAge: 60 * 60 * 24 });
			noticeCookie.value = true;
		}

		if (item.once && closeType !== "destroy") {
			destroy(item.uid);
		}

		item.isOpen = false;
		item.isClosing = false;

		return item;
	};

	const confirm = async (uid, options = { close: true }) => {
		const { item } = getOpenItem(uid);
		if (!isOpen || !item) {
			return false;
		}
		const confirmClose = () => close(uid, "confirm");
		const useClose = (await item.onConfirm(item, confirmClose)) !== false && options.close;
		item.eventFire("confirm");
		useClose && confirmClose();
	};

	const cancel = async (uid, options = { close: true }) => {
		const { item } = getOpenItem(uid);
		if (!isOpen || !item) {
			return false;
		}
		const cancelClose = () => close(uid, "cancel");
		const useClose = (await item.onCancel(item, cancelClose)) !== false && options.close;
		item.eventFire("cancel");
		useClose && cancelClose();
	};

	const destroy = (uid) => {
		const item = modals[uid];
		if (!item) {
			throw `uid ${uid} : 이 번호로 등록된 모달이 없습니다.`;
		}

		item.eventFire("beforeDestroy");

		if (item.isOpen) {
			item.on("closeComplete", () => {
				delete modals[uid];
			});
			if (!item.isClosing) {
				item.close();
			}
		} else {
			delete modals[uid];
		}

		item.eventFire("destroy");
	};

	const patch = (uid, options = {}) => {
		const item = modals[uid];
		if (!item) {
			throw `uid ${uid} : 이 번호로 등록된 모달이 없습니다.`;
		}

		Object.entries(options).forEach(([k, v]) => {
			if (item.hasOwnProperty(k)) {
				item[k] = v;
			}
		});
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

	return {
		openList,
		modals,
		isMounted,
		isActive,
		isOpen,
		create,
		open,
		close,
		destroy,
		patch,
		confirm,
		cancel,
		getOpenItem,
		closeAll,
	};
});

export const useModalDefaultMotion = (item) => {
	const enterMotion = () => {
		const tl = gsap.timeline();
		const isOk = item.el.root && item.el.wrap;
		if (isOk) {
			tl.fromTo(item.el.root, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.out", duration: 0.27 }, 0);
			tl.fromTo(item.el.wrap, { y: 30 }, { y: 0, ease: "power4.out", duration: 0.4, clearProps: "all" }, 0);
		}

		return tl;
	};

	const leaveMotion = () => {
		const tl = gsap.timeline();
		const isOk = item.el.root && item.el.wrap;
		if (isOk) {
			item.el.wrap.style.overflow = "hidden";
			tl.to(item.el.root, { autoAlpha: 0, ease: "power1.in", duration: 0.13 }, 0);
			tl.to(item.el.wrap, { y: -13, ease: "power1.in", duration: 0.18 }, 0);
		}
		return tl;
	};

	if (item) {
		!item.enterMotion && (item.enterMotion = enterMotion);
		!item.leaveMotion && (item.leaveMotion = leaveMotion);
	}

	return [enterMotion, leaveMotion];
};
