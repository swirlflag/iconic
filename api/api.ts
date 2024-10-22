import elf from "./elf";
import airplanes from "./airplanes";

elf.setAirplane(airplanes);

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

interface PAYLOAD_elf {
	url?: string;
	path?: string;
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "get" | "post" | "put" | "patch" | "delete";
	data?: any;
	headers?: object;
	ticket?: string | null;
	auth?: boolean;
	origin?: string;
	airplane?: object | Function;
	query?: object;
}

export const API = async ($p) => {
	return elf($p);
};

// inface getProfile
export const API_getUserProfile = async () => {
	const ticket = "FE";
	const method = "GET";
	const path = `/api/user-profile`;
	const payload = {
		name: "API_getUserProfile",
		method,
		ticket,
		path,
	};

	let response = await elf(payload);

	response = response.data.response;

	return response;
};

// JARVIS 사전등록 - 휴대폰 소유인증 인증번호 요청
interface PAYLOAD_certSendMSMS {
	eventId: string;
	phone: string;
}
export const API_certSendMSMS = async ($p: PAYLOAD_certSendMSMS) => {
	const ticket = "JARVIS";
	const method = "POST";
	const path = `/v1/event/${$p.eventId}/msms/m/send`;

	const data = {
		strMobile: $p.phone,
	};

	const payload = {
		ticket,
		method,
		path,
		data,
	};

	const response = await API(payload);
	return response;
};

// JARVIS 사전등록 - 사전등록 진행. 필요한 경우 인증번호 확인
interface PAYLOAD_registMSMS {
	eventId: string;
	phone?: string;
	channel?: number | string;
	tag?: string;
	os?: string;
	email?: string;
	certCode?: string;
	requestId?: string;
}
export const API_registMSMS = async ($p: PAYLOAD_registMSMS) => {
	const ticket = "JARVIS";
	const method = "POST";

	const isCert = !!$p.certCode && !!$p.requestId;
	let path = `/v1/event/${$p.eventId}/msms/m${isCert ? "/confirm" : "/save"}`;

	const data: any = {
		n4Channel: $p.channel || 1,
		strCountryCode: "KR",
	};

	if (isCert) {
		data.strAuthenticationCode = $p.certCode;
		data.n8RequestID = $p.requestId;
	}
	if ($p.email) {
		data.strEmail = $p.email;
	}
	if ($p.tag) {
		data.strTag = $p.tag;
	}
	if ($p.phone) {
		data.strMobile = $p.phone;
	}
	if ($p.os) {
		data.strOs = $p.os;
	}

	const payload = {
		ticket,
		method,
		path,
		data,
	};

	const response = await API(payload);
	return response;
};

// 커뮤니티 - 설정 조회
export const API_getCommunityConfig = async () => {
	const alias = env("NEXON_TOY_ALIAS");
	const countryCode = env("COUNTRY");
	const communityId = env("NEXON_TOY_COMMUNITY_ID");
	const ticket = "TOY";
	const method = "GET";
	const path = `/api/v1/community/${alias}`;
	const query = {
		countryCode,
		alias,
		communityId,
	};

	const payload = {
		name: "API_getCommunityConfig",
		method,
		ticket,
		path,
		query,
	};

	const response = await elf(payload);
	return response;
};

// [TODO] 커뮤니티 - SDK 정보가 필요하면 개발
export const API_getCommunityConfigByClientId = async () => {};

// 커뮤니티 - 유저 정보 조회
interface PAYLOAD_getCommunityUser {
	userId?: string;
}
export const API_getCommunityUser = async ($p: PAYLOAD_getCommunityUser) => {
	const alias = env("NEXON_TOY_ALIAS");
	const serviceID = env("NEXON_SERVICE_ID");
	const countryCode = env("COUNTRY");

	const ticket = "TOY";
	const method = "GET";
	const addPath = $p.userId ? `/find/${$p.userId}` : "";
	const path = `/api/v1/user${addPath}`;

	const payload = {
		name: "API_getCommunityUser",
		ticket,
		method,
		path,
		query: {
			alias,
			serviceID,
			countryCode,
		},
		auth: true,
	};

	const response = await elf(payload);
	return response;
};

// 커뮤니티 - 유저 정보 설정
interface PAYLOAD_setCommunityUser {
	userId: string;
	nickname: string;
	profileImageUrl: string;
}
export const API_setCommunityUser = async ($p: PAYLOAD_setCommunityUser) => {
	const communityId = env("NEXON_TOY_COMMUNITY_ID");
	const alias = env("NEXON_TOY_ALIAS");
	const countryCode = env("COUNTRY");

	const ticket = "TOY";
	const method = "POST";
	const addPath = $p.userId ? `/${$p.userId}` : "";
	const path = `/api/v1/user${addPath}`;
	const query = {
		alias,
		countryCode,
	};
	const data = {
		nickname: $p.nickname,
		profileImageUrl: $p.profileImageUrl,
		userId: $p.userId,
		communityId,
	};
	const payload = {
		name: "API_setCommunityUser",
		ticket,
		method,
		path,
		query,
		data,
	};

	const response = await elf(payload);
	return response;
};

// 커뮤니티 - 단일 게시글 조회
interface PAYLOAD_getThread {
	threadId: string;
}
export const API_getThread = async ($p: PAYLOAD_getThread) => {
	const ticket = "TOY";
	const method = "GET";
	const path = `/api/v1/thread/${$p.threadId}`;
	const payload = {
		name: "API_getThread",
		method,
		ticket,
		path,
		auth: true,
	};
	const response = await elf(payload);
	return response;
};

// 커뮤니티 - 게시글 리스트 조회
interface PAYLOAD_getThreads {
	boardId?: string;
	userId?: string;
	blockStartKey?: [string, string];
	blockStartNo?: string;
	searchKeywordType?: "THREAD_TITLE_AND_CONTENT" | "THREAD_TITLE" | "THREAD_CONTENT" | "THREAD_USER";
	myThreadsType?: "MY_THREAD" | "MY_COMMENTED_THREAD" | "MY_LIKED_THREAD";
	pageNo?: number;
	headlineId?: string;
	keywords?: string;
	pageSize?: number | string;
	directionType?: "DEFAULT" | "LIKE" | "REPLY" | "RECENT_REPLY" | "READ";
	isGroup?: boolean;
	isSticky?: boolean;
}
export const API_getThreads = async ($p: PAYLOAD_getThreads) => {
	const communityId = env("NEXON_TOY_COMMUNITY_ID");
	const ticket = "TOY";
	const method = "GET";

	let path = "";

	if ($p.boardId) {
		if ($p.isGroup) {
			// 대상 보드 내의 하위 보드 게시글 모두 조회
			path = `/api/v1/board/group/${$p.boardId}/threads`;
		} else if ($p.isSticky) {
			// 대상 보드의 Sticky 게시글 조회
			path = `/api/v1/board/${$p.boardId}/stickyThreads`;
		} else {
			// 대상 보드 게시글 조회
			path = `/api/v1/board/${$p.boardId}/threadsV2`;
		}
	} else if ($p.userId) {
		// 타겟 유저 관련 게시글 조회
		path = `/api/v1/user/find/threads/${$p.userId}`;
	} else {
		// 전체 보드 게시글 조회 (검색 기능 등)
		path = `/api/v1/community/${communityId}/threads`;
	}

	const query = mergeTruthyValues(
		{
			paginationType: "PAGING",
			pageSize: $p.pageSize || 10,
			blockSize: 10,
			communityId,
			reqStr: "npsnUser",
			pageNo: $p.pageNo || 1,
		},
		{
			directionType: $p.directionType,
			headlineId: $p.headlineId,
			blockStartKey: $p.blockStartKey,
			blockStartNo: $p.blockStartNo,
			boardId: $p.boardId,
			userId: $p.userId,
			keywords: $p.keywords,
			searchKeywordType: $p.searchKeywordType,
			myThreadsType: $p.myThreadsType,
		},
	);

	const payload = {
		name: "API_getThreads",
		method,
		ticket,
		path,
		query,
		auth: true,
	};
	const response = await elf(payload);
	return response;
};
