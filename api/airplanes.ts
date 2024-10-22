import Cookies from "universal-cookie";
import codeMessage from "./codeMessage.js";

const cookies = new Cookies();

const env = (key: string) => {
	let envs: any = null;
	if (import.meta.server) {
		envs = import.meta.env;
		key = "NUXT_PUBLIC_" + key;
	} else {
		envs = useEnv();
	}
	return envs[key];
};

const airplanes = {
	// 프론트 자체 API
	FE: () => {
		const result = {
			origin: location.origin,
			codePath: (data) => data.code,
			codeMessage: codeMessage.FE,
		};
		return result;
	},

	// TOY 커뮤니티
	TOY: ($p = { auth: false }) => {
		const result = {
			origin: env("NEXON_TOY_API_URL"),
			headers: {
				"x-inface-api-key": env("NEXON_INFACE_KEY"),
				"community-id": env("NEXON_TOY_COMMUNITY_ID"),
			},
			alias: env("NEXON_TOY_ALIAS"),
			countryCode: "KR",
			okCondition: (data) => !data?.errorCode,
			codePath: (data) => data?.errorCode,
			codeMessage: codeMessage.TOY,
		};

		const NPP = cookies.get("NPP");

		const isNeedAuth = $p.auth && NPP;

		if (isNeedAuth) {
			result.headers.authorization = `KRPC ${NPP}`;
		}

		return result;
	},

	// 인증 서버
	IAS: ($p = { ifwt: null }) => {
		const result = {
			origin: env("NEXON_IAS_API_URL"),
			headers: {},
			codePath: (data) => data?.error?.code,
			codeMessage: codeMessage.IAS,
		};

		const ifwt = cookies.get("_ifwt") || $p?.ifwt;

		if (ifwt) {
			result.headers["x-ias-web-token"] = ifwt;
		}

		return result;
	},

	JARVIS: () => {
		const result = {
			origin: env("NEXON_JARVIS_API_URL"),
			headers: {
				"x-jarvis-api-key": env("NEXON_JARVIS_KEY"),
				Authorization: `Bearer ${env("NEXON_JARVIS_TOKEN")}`,
			},
			codePath: (data) => data?.code,
			okCondition: (data) => data.code === "0000",
			codeMessage: codeMessage.JARVIS,
		};
		console.log(result);
		return result;
	},
	NNP: () => {
		return {};
	},
};

export default airplanes;
