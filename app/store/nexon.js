import { API_getUserProfile } from "@api";
import { useAsyncStore } from "./async";
import { useInfoStore } from "./info";

export const useNexonStore = defineStore("nexon", () => {
	const infoStore = useInfoStore();
	const isClient = infoStore.isClient;
	const route = useRoute();
	const env = useEnv();
	const AS = useAsyncStore();

	const isSignIn = ref(false);
	const isIdentity = computed(() => {
		return profile.value?.local_session_props?.main_atl !== 1 && !!profile.value?.local_session_props?.identity_sn;
	});
	const profile = ref({});

	const installed = reactive({
		inface: false,
		ps: false,
		gnb: false,
	});

	const checkSignIn = (payload) => {
		// [MEMO] 서버일떄는 쿠키로 판별, 클라이언트에서는 inface 호출 메소드로 판별
		let result = false;

		if (isClient) {
			const isFailOrUnset = AS.inface.isFailure || !window.inface;
			if (isFailOrUnset) {
				result = null;
			} else {
				result = globalThis.inface.auth.isSignedIn(payload);
			}
		} else {
			const ifwt = useCookie("_ifwt").value;
			result = !!ifwt;
		}

		isSignIn.value = result;
		return result;
	};

	const gotoSignIn = (payload) => {
		if (!isClient) {
			return;
		}
		if (!globalThis.inface) {
			return 1;
		}
		globalThis.inface.auth.gotoSignIn(payload);
	};

	const gotoSignOut = (payload = {}) => {
		if (!isClient) {
			return;
		}
		if (!globalThis.inface) {
			return 1;
		}
		globalThis.inface.auth.gotoSignOut(payload);
	};

	const gotoSignUp = (payload) => {
		if (!isClient) {
			return;
		}
		if (!globalThis.inface) {
			return 1;
		}
		globalThis.inface.auth.gotoSignUp(payload);
	};

	const gotoAccount = (payload) => {
		if (!isClient) {
			return;
		}
		if (!globalThis.inface) {
			return 1;
		}
		globalThis.inface.auth.gotoAccount(payload);
	};

	const gotoIdentity = (payload) => {
		window.open("https://member.nexon.com/html/pop_realname.html", `support`, "width=540,height=300,resizable=1");
	};

	const getProfile = async (payload) => {
		if (!isClient) {
			return;
		}

		await AS.inface.stay();

		const response = await API_getUserProfile();

		const result = response.data;

		profile.value = result;
		return result;
	};

	const startGame = async (options = { auth: true }) => {
		if (!isClient) {
			return;
		}

		if (!globalThis.PS) {
			return;
		}

		if (options.auth) {
			const authGuard = useAuthGuard();
			if (authGuard.block) {
				return;
			}
		}

		const gameCode = env.GAMECODE;
		const gameCodeOBD = env.GAMECODE_OBD;
		const gameCodeString = `${gameCode}${gameCodeOBD}`;

		PS.game.startGame({
			gameCode: gameCodeString,
			// restoreInstall: true,
		});
	};

	const installInface = () => {
		/**
		 * // https://docs.nexon.com/onboarding/insign/web-auth/
		 * [MEMO] inface는 server부터 스크립트를 추가하지만 init은 client에서만 실행합니다.
		 * 스크립트 추가: server
		 * 스크립트 init: client
		 */
		if (installed.inface) {
			return;
		}

		const infaceJS = env.NEXON_INFACE_JS;
		const headData = {
			script: {
				src: infaceJS,
			},
		};

		useHead(headData);

		if (!isClient) {
			return;
		}

		AS.inface.pending();

		const infaceSuccess = async () => {
			const isSignin = checkSignIn();
			if (isSignin) {
				getProfile();
			}

			installed.inface = true;
			AS.inface.success();
		};

		const infaceFailure = () => {
			AS.inface.failure();
		};

		const infaceInit = () => {
			const inface = globalThis.inface;
			if (!inface) {
				setTimeout(infaceInit, 1000);
				return;
			}

			const isLive = env.MODE === "LIVE";
			const envName = isLive ? "live" : "test";
			const gid = isLive ? env.NEXON_SERVICE_ID : 0;

			inface.auth.init({
				env: envName, // 환경값 (dev, test, live)
				gid,
				platform: "krpc",
				callbackOk: infaceSuccess,
				callbackFail: infaceFailure,
			});
		};

		infaceInit();
	};

	const installPS = () => {
		/**
		 * // https://docs.gamescale.io/ko/doc/36/categories/12777
		 * [MEMO] PS는 server부터 스크립트 추가가 이뤄지며 스크립트 호출시 자동으로 init합니다.
		 * - 스크립트 추가: server
		 * - 스크립트 init: 호출시 자동
		 */
		if (installed.ps) {
			return;
		}

		const headData = {
			script: {
				src: env.NEXON_PS_JS,
				"data-name": "PS",
				"data-ngm": "true",
				"data-nxlogin": "true",
			},
		};

		useHead(headData);
		installed.ps = true;
	};

	const installGnb = () => {
		/**
		 * // https://docs.gamescale.io/ko/doc/36/categories/12769
		 * [MEMO] 넥슨 공통 GNB는 client 전용이며 스크립트 호출시 자동으로 init합니다.
		 * - 스크립트 추가: client
		 * - 스크립트 init: 호출시 자동
		 */

		if (installed.gnb) {
			return;
		}
		if (!isClient) {
			return;
		}

		AS.nexonGnb.pending();

		const isIndexPage = route.path === "/" || route.path === "/main";

		globalThis.NEXONWEB_installNexonGnb = () => {
			globalThis.NEXONWEB_installNexonGnb = null;
			installed.gnb = true;
			AS.nexonGnb.success();
		};

		const headData = {
			script: {
				src: env.NEXON_GNB_JS,
				hid: "nexon",
				"data-gamecode": env.GAMECODE,
				"data-minwidth": "0",
				"data-skiptocontentsid": "nexon-gnb-trigger", // id="nexon-gnb-trigger" 위치에 배치
				"data-oncomplete": "NEXONWEB_installNexonGnb",
				"data-showpcbangmenu": "true",
				"data-ispublicbanner": isIndexPage ? "true" : "false",
			},
		};
		useHead(headData);
	};

	const install = (targets) => {
		if (!targets) {
			targets = {
				inface: true,
				ps: true,
				gnb: true,
			};
		}
		if (targets.inface) {
			installInface();
		}
		if (targets.ps) {
			installPS();
		}
		if (targets.gnb) {
			installGnb();
		}
	};
	return {
		install,
		installed,
		installInface,
		installPS,
		installGnb,
		isSignIn,
		isIdentity,
		profile,
		checkSignIn,
		gotoSignIn,
		gotoSignOut,
		gotoSignUp,
		gotoAccount,
		gotoIdentity,
		getProfile,
		startGame,
	};
});
