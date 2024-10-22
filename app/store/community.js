import {
	API_getCommunityConfig,
	API_getCommunityUser,
	API_getThread,
	API_getThreads,
	API_setCommunityUser,
} from "@api";
import { useAsyncStore } from "./async";
import { useModalStore } from "./modal";
import { useNexonStore } from "./nexon";
import { useInfoStore } from "./info";
import getClientConfig from "~/data/config";
import { mergeBoardConfig } from "~/utils/unique";

export const useCommunityStore = defineStore("community", () => {
	const env = useEnv();

	const nexonStore = useNexonStore();
	const modalStore = useModalStore();
	const infoStore = useInfoStore();
	const AS = useAsyncStore();

	const clientConfig = getClientConfig();

	// 커뮤니티 설정 정보
	const config = reactive({
		client: clientConfig,
		server: null,
		boards: null,
	});

	// 로그인 여부 (커뮤니티 자동 가입 기능 이후로 넥슨 로그인과 시점이 동기화됨)
	const isSignIn = ref(false);

	// 단일 게시글 정보
	const thread = ref(null);

	// 게시글 리스트 정보
	const threads = ref(null);

	// 단일 게시판의 고정 게시글 정보
	const stickyBoard = ref(null);

	// 유저 정보 (본인)
	const user = ref(null);

	// 유저 정보 (공개)
	const userPublic = ref(null);

	// thread 형태의 데이터를 받아서 가공된 데이터를 확장하여 반환
	const _extendThreadData = async (data, config) => {
		if (!config) {
			config = await _findTargetBoardConfig(data.boardId);
		}
		// 게시판 타이틀 추가
		data.boardTitle = config.title;
		// 헤드라인이 있는 경우 헤드라인 제목 텍스트를 추가
		if (+data.headlineId !== 0) {
			data.headlineTitle = await _findHeadlineTitle(data.headlineId);
		}
		// 24시간 이내에 작성된 글인지 확인
		data.isNew = checkNew(data.createDate);
		// 작성일 포맷 추가
		data.createDateFormat = dateFormatter(data.createDate);
		// to 경로 추가
		data.to = `${config.to}/${data.threadId}`;
		data.boardTo = config.to;

		return data;
	};

	// key 혹은 boardId를 통해 보드 설정을 찾아 반환
	const _findTargetBoardConfig = async (value) => {
		const keyName = isNaN(+value) ? "key" : "boardId";

		await AS.communityConfig.stay();
		if (!AS.communityConfig.isSuccess) {
			console.deverror(`서버에서 config를 불러오지 않은 상태입니다.`);
			return null;
		}

		const target = config.boards[value];

		if (!target) {
			if (keyName === "key") {
				console.deverror(
					`클라이언트에 "key"가 ${value}인 보드가 없습니다.\n설정된 보드가 없어 "boardId"를 알 수 없고, 따라서 서버에서도 보드를 찾을 수 없습니다.\n{ key } 대신 { boardId }로도 호출을 시도해보세요.`,
				);
			}
			if (keyName === "boardId") {
				console.deverror(`클라이언트와 서버 모두에 "boardId"가 "${value}"인 보드가 없습니다.`);
			}
			return null;
		}

		if (infoStore.isDev) {
			const boardId = target.boardId;
			const haveClient = findObjectByKeyValue(config.client.boards, "boardId", boardId);
			const haveServer = findObjectByKeyValue(config.server?.boards, "boardId", boardId);

			if (!haveClient) {
				console.devcolor(
					`클라이언트에 작성된 보드 리스트에 "boardId"가 "${boardId}"인 보드가 없습니다.\n@/data/config.js 의 내용에 서버에 존재하하는 board 데이터와 맵핑 하는것을 권장합니다.`,
				);
			}
			if (!haveServer) {
				console.devcolor(
					`서버에서 받아온 보드 리스트에 "boardId"가 "${boardId}"인 보드가 없고, 클라이언트에서만 발견되었습니다.\nTOY에서 해당 보드의 boardId를 확인해주세요.`,
				);
			}
		}

		return target;
	};

	// key 혹은 boardId를 통해 보드 설정을 찾아 반환
	const _findHeadlineTitle = async (headlineId) => {
		await AS.communityConfig.stay();

		const result = config.headlines[headlineId];
		return result;
	};

	// 커뮤니티 서버 설정을 호출한 후, 클라이언트 설정과 병합
	// DATA: config / AS: communityConfig
	const getServerConfig = async () => {
		AS.communityConfig.pending();

		const response = await API_getCommunityConfig();
		const data = response.data;

		if (!response.ok) {
			AS.communityConfig.failure();
			return { data, status: "failure" };
		}

		const serverBoards = data.boards;
		const clientBoards = config.client.boards;

		const boardsConfig = mergeBoardConfig(serverBoards, clientBoards, "boardId");

		const headlines = Object.entries(boardsConfig).reduce(
			(p, [k, { boardHeadlines = [] }]) => (
				boardHeadlines.forEach((item) => (p[item.headlineId] = item.title)), p
			),
			{},
		);

		config.server = data;
		config.boards = boardsConfig;
		config.headlines = headlines;

		AS.communityConfig.success();
		return { data, status: "success" };
	};

	// 유저 정보 가져오기
	// DATA : user, userPublic, isSignIn / AS: communityUser
	const getUser = async (userId) => {
		const isGetSelf = !userId;

		if (isGetSelf) {
			await AS.inface.stay();
			const isNexonSignIn = nexonStore.checkSignIn();
			if (!isNexonSignIn) {
				AS.communityUser.success();
				return { data: null, status: "success" };
			}
		}

		// 이미 로그인한 정보가 있고 userId 로 자신의 정보를 가져올 때
		const isSyncPublic = userId && user.value?.userId === userId;
		if (isSyncPublic) {
			userPublic.value = user.value;
			AS.communityUser.success();
			return { data: user.value, status: "success" };
		}

		AS.communityUser.pending();

		// 배지 관련 기능
		// if (isGetSelf) {
		// 	await API_refreshBadge();
		// }

		const response = await API_getCommunityUser({ userId });
		const data = response.data;

		if (!response.ok) {
			AS.communityUser.failure();
			modalStore.open(response.codeMessage);
			return { data, status: "failure" };
		}

		if (isGetSelf) {
			user.value = data;
			isSignIn.value = true;
			const isSyncPublic = data.userId === userPublic.value?.userId;
			if (isSyncPublic) {
				userPublic.value = data;
			}
		} else {
			userPublic.value = data;
		}

		AS.communityUser.success();

		return { data, status: "success" };
	};

	// 유저 정보 설정하기
	// DATA: user, userPublic / AS: communityUser
	const setUser = async (options = { nickname: null, profileImageUrl: null }) => {
		// [MEMO] 커뮤니티 자동가입이 추가되어 로그인 상태일때만 유저 정보 저장
		const authGuard = useAuthGuard();
		if (authGuard.block) {
			return { status: null };
		}
		if (!isSignIn.value) {
			return { status: null };
		}

		AS.communityUser.pending();
		const payload = {
			userId: user.value?.userId,
			nickname: options.nickname,
			profileImageUrl: options.profileImageUrl,
		};
		const response = await API_setCommunityUser(payload);
		const data = response.data;
		if (!response.ok) {
			modalStore.open(response.codeMessage);
			AS.communityUser.failure();
			return { data, status: "failure" };
		}

		user.value = { ...user.value, ...data };
		const isSyncPublic = user.value?.userId === userPublic.value?.userId;
		if (isSyncPublic) {
			userPublic.value = user.value;
		}
		AS.communityUser.success();
		return { data, status: "success" };
	};

	// 게시글 데이터 가져오기
	// DATA: thread / AS: communityThread
	const getThread = async (threadId) => {
		AS.communityThread.pending();

		const response = await API_getThread({ threadId });
		console.log(response);
		if (!response.ok) {
			modalStore.open(response.codeMessage);
			AS.communityThread.failure();
			return { data: null, status: "failure" };
		}

		const data = response.data;
		const isCommunityMatch = +data?.communityId === +env?.NEXON_TOY_COMMUNITY_ID;

		if (!isCommunityMatch) {
			AS.communityThread.failure();
			return { data: null, status: "failure" };
		}

		thread.value = await _extendThreadData(data);

		AS.communityThread.success();
		return { data, status: "success" };
	};

	// 게시글 리스트 가져오기
	// DATA: board / AS: communityThreads
	const getThreads = async (options) => {
		// 본 요청에 참조할 이전 데이터가 있는지 확인 및 가져오기.
		const before = threads.value ? { ...threads.value } : null;

		let {
			key,
			pageNo = 1,
			userId,
			boardId,
			headlineId,
			keywords,
			searchKeywordType,
			myThreadsType,
			directionType,
			withSticky,
			pageSize,
			forceRequest = false,
			isGroup,
			query,
			paginationType,
			isMore,
		} = options;

		// 검색한 키워드에 대한 타입
		const map_query_type = {
			thread: "THREAD_TITLE_AND_CONTENT", // 제목 + 본문
			title: "THREAD_TITLE", // 제목
			content: "THREAD_CONTENT", // 본문
			user: "THREAD_USER", // 작성자
		};
		// 유저가 작성한 글에 대한 타입
		const map_query_userType = {
			written: "MY_THREAD", // 유저가 쓴 글
			commented: "MY_COMMENTED_THREAD", // 유저가 댓글 단 글
			liked: "MY_LIKED_THREAD", // 유저가 좋아요 한 글
		};
		// 게시글 리스트 정렬 방식
		const map_query_order = {
			default: "DEFAULT", // 최신 순
			like: "LIKE", // 좋아요 순
			reply: "REPLY", // 댓글 갯수 순
			"reply-recent": "RECENT_REPLY", // 최신 댓글 달린 순 (미구현)
			read: "READ", // 조회순 (미구현)
		};

		// [TODO] 리팩토링
		// 쿼리 값에 따라 값들을 적절히 재설정
		if (query) {
			query?.page && (pageNo = query?.page || 1);
			query?.search && (keywords = query?.search || null);
			map_query_order[query?.order] && (directionType = map_query_order[query?.order] || null);
			query?.board && !key && !boardId && !userId && (boardId = query?.board);
			query?.headline && boardId && (headlineId = query?.headline);

			const isCallUserBoard = !key && !boardId && (userId || query.user);

			if (isCallUserBoard) {
				query?.user && (userId = query?.user || userId);
				myThreadsType = map_query_userType[query?.type] || myThreadsType || map_query_userType["written"];
			} else if (keywords) {
				searchKeywordType = map_query_type[query?.type] || searchKeywordType || map_query_type["thread"];
			}
		} else {
			if (keywords) {
				if (searchKeywordType) {
					searchKeywordType = map_query_type[searchKeywordType] || searchKeywordType;
				} else {
					searchKeywordType = map_query_type["thread"];
				}
			}
		}

		let isSame = false;
		// 이전 게시글 리스트와 동일한 요청인지 확인하고, 동일한 경우 호출 X
		if (before && !forceRequest) {
			isSame =
				(boardId ? boardId === before.boardId : key !== undefined && key === before.key) &&
				before.pageNo === pageNo &&
				before.keywords === keywords &&
				before.searchKeywordType === searchKeywordType &&
				before.directionType === directionType &&
				before.headlineId === headlineId;

			if (isSame && !isMore) {
				console.devcolor("동일한 데이터 호출입니다.");
				return { status: "initial" };
			}
		}

		isMore = isMore || paginationType === "MORE";
		if (isMore) {
			paginationType = "MORE";
		}

		// config 정보가 준비되었는지 대기 및 확인
		AS.communityThreads.pending();
		await AS.communityConfig.stay();

		if (AS.communityConfig.isFailure) {
			AS.communityThreads.failure();
			return { status: "failure" };
		}

		let boardConfig = null;

		// 적절한 키값이 있다면 해당 보드의 config를 찾아서 설정후 boardId를 갱신
		if (key || boardId) {
			boardConfig = await _findTargetBoardConfig(key || boardId);
			if (boardConfig) {
				boardId = boardConfig?.boardId;
				key = boardConfig?.key;
			}
		}

		const isPageWrong = isNaN(+pageNo);
		const isFirstRequest = !before && pageNo > 1;
		const isChangeKeywords = before?.keywords !== keywords;

		// [MEMO] 특정한 조건에서는 pageNo를 1로 강제 설정
		// 페이지 번호가 숫자가 아닌 경우, 이전 데이터가 없는 경우, 검색어가 바뀐 경우
		if (isFirstRequest || isPageWrong || isChangeKeywords) {
			pageNo = 1;
		}

		const payload = mergeTruthyValues(
			{
				pageNo,
				boardId,
			},
			{
				blockStartKey: isSame ? null : before?.blockStartKey,
				blockStartNo: isSame ? null : before?.blockStartNo,
				lastKey: isSame ? before?.lastKey : null,
				userId,
				headlineId,
				myThreadsType,
				keywords,
				searchKeywordType,
				directionType,
				pageSize,
				isGroup,
				paginationType,
			},
		);

		const requests = [];

		requests.push(API_getThreads);

		// 첫 페이지에서만 스티키 게시글을 불러옴
		const isCallSticky = withSticky && payload.pageNo <= 1 && !keywords;
		if (isCallSticky) {
			requests.push(() => API_getThreads({ ...payload, isSticky: true }));
		}

		const [request, requestSticky] = await Promise.allSettled(requests.map((req) => req(payload)));
		const response = request?.value;
		const responseSticky = requestSticky?.value;
		const data = response.data;

		if (!response.ok) {
			modalStore.open(response.codeMessage);
			AS.communityThreads.failure();
			return { data, status: "failure" };
		}

		const noData = !data?.threads.length;
		const isCommunityMatch = +data?.threads?.[0]?.communityId === +env?.NEXON_TOY_COMMUNITY_ID;

		if (!noData && !isCommunityMatch) {
			AS.communityThreads.failure();
			return { data: null, status: "failure" };
		}

		let list = [...data.threads];
		let stickyList = [];

		// 스티키를 같이 호출한 경우 본 요청의 스티키는 모두 삭제한다.
		if (requestSticky) {
			stickyList = responseSticky?.data?.stickyThreads || [];
			threads = threads.map((thread) => ((thread.isSticky = false), thread));
		}

		list = await Promise.all(
			[...stickyList, ...list].map(async (thread) => {
				const config = boardConfig || _findTargetBoardConfig(thread.boardId);
				return await _extendThreadData(thread, config);
			}),
		);

		if (isMore && isSame && before?.list) {
			list = [...before.list, ...list];
		}

		const isLastPage = !data.lastKey;

		threads.value = {
			noData,
			pageNo: 1,
			...options,
			...payload,
			...boardConfig,
			...data,
			isLastPage,
			list,
		};

		AS.communityThreads.success();
		return { data, status: "success" };
	};

	// 특정 게시판의 고정글 데이터 가져오기
	// DATA: stickyBoard / AS: communityThreads
	const getStickyBoard = async (options) => {
		const before = stickyBoard.value ? { ...stickyBoard.value } : null;

		let { key, boardId, pageSize = 10, forceRequest = false } = options;

		// 이전 게시글 리스트와 동일한 요청인지 확인하고, 동일한 경우 호출 X
		if (before && !forceRequest) {
			const isSame = before.key === key || (boardId !== undefined && before.boardId === boardId);
			if (isSame) {
				return { data: stickyBoard.value };
			}
		}

		// config 정보가 준비되었는지 확인
		AS.communityThreads.pending();
		await AS.communityConfig.stay();
		if (AS.communityConfig.isFailure) {
			AS.communityThreads.failure();
			return { status: "failure" };
		}

		const boardKey = key || boardId;
		if (!boardKey) {
			console.error("스티키 호출엔 key 혹은 boardId가 필수 입니다.");
			AS.communityThreads.failure();
			return { data: null, status: "failure" };
		}

		// 호출하려는 보드의 config 획득
		const boardConfig = await _findTargetBoardConfig(boardKey);
		if (boardConfig) {
			boardId = boardConfig?.boardId;
		}

		const response = await API_getThreads({ boardId, pageSize, isSticky: true });

		if (!response.ok) {
			AS.communityThreads.failure();
			return { data: null, status: "failure" };
		}
		const data = response.data;

		stickyBoard.value = {
			...boardConfig,
			...data,
		};

		AS.communityThreads.success();
		return { data, status: "success" };
	};

	// 커뮤니티 기능 설치 및 초기화 (클라이언트 전용)
	// ACTION: getServerConfig, getUser, getGradeConfig / AS: communityInstall
	const install = async () => {
		if (!import.meta.client) {
			return;
		}
		if (!AS.communityInstall.isInitial) {
			return;
		}

		nexonStore.install({ inface: true });
		AS.communityInstall.pending();
		// await Promise.allSettled([getServerConfig(), getCommunityUser(), getGradeConfig()]);
		await Promise.allSettled([getServerConfig(), getUser()]);

		AS.communityInstall.success();
	};

	return {
		config,
		getServerConfig,

		isSignIn,
		thread,
		getThread,

		threads,
		getThreads,
		stickyBoard,
		getStickyBoard,

		user,
		userPublic,
		getUser,
		setUser,

		install,
	};
});
