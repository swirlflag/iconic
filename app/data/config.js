// nuxt 앱 내에서만 호출가능합니다.

const boardIdList = {
	"/news": { DEV: "2114", LIVE: "2828" },
	"/news/notice": { DEV: "2121", LIVE: "2829" },
	"/news/update": { DEV: "2122", LIVE: "2828" },
	"/news/gm": { DEV: "2123", LIVE: "2831" },
	"/news/event": { DEV: "2124", LIVE: "2835" },
	"/news/history": { DEV: "2482", LIVE: "3464" },
	"/news/chronicle": { DEV: "2636", LIVE: "3897" },
	"/info": { DEV: "2115", LIVE: "2833" },
	"/info/guide": { DEV: "2125", LIVE: "2834" },
	"/creator": { DEV: "2117", LIVE: "2853" },
	"/creator/notice": { DEV: "2126", LIVE: "2930" },
	"/creator/promotion": { DEV: "2127", LIVE: "2854" },
	"/media": { DEV: "2118", LIVE: "2836" },
	"/media/image": { DEV: "2129", LIVE: "2840" },
	"/media/video": { DEV: "2130", LIVE: "2841" },
	"/media/fankit": { DEV: "2978", LIVE: "4921" },
	"/community": { DEV: "2119", LIVE: "2842" },
	"/community/free": { DEV: "2131", LIVE: "2843" },
	"/community/question": { DEV: "2133", LIVE: "2845" },
	"/community/tip": { DEV: "2134", LIVE: "2846" },
	"/community/recruit": { DEV: "2136", LIVE: "2848" },
	"/community/image": { DEV: "2396", LIVE: "3244" },
	"/community/server": { DEV: "2324", LIVE: "3055" },
	"/service": { DEV: "2120", LIVE: "2849" },
	"/service/faq": { DEV: "2137", LIVE: "2850" },
	"/service/reports": { DEV: "2366", LIVE: "3174" },
	"/service/policy": { DEV: "2138", LIVE: "2852" },
};

const getClientConfig = () => {
	const env = useEnv();
	const mode = env.MODE; // LIVE, DEV

	const getBoardId = (key) => {
		return boardIdList[key][mode];
	};

	const result = {
		nav: [],

		boards: [
			{
				title: "게임소식",
				key: "/news",
				boardId: getBoardId("/news"),
				boards: [
					{
						title: "공지사항",
						key: "/news/notice",
						boardId: getBoardId("/news/notice"),
						viewOptions: ["nickname", "date", "shareButton", "headlineTitle"],
					},
					{
						title: "업데이트",
						key: "/news/update",
						boardId: getBoardId("/news/update"),
						viewOptions: ["nickname", "date", "shareButton"],
					},
					{
						title: "소통채널",
						key: "/news/gm",
						boardId: getBoardId("/news/gm"),
						viewOptions: ["nickname", "likeCount", "commentCount", "date", "shareButton", "headlineTitle"],
					},
					{
						title: "이벤트",
						key: "/news/event",
						boardId: getBoardId("/news/event"),
						viewOptions: ["nickname", "likeCount", "commentCount", "date", "shareButton", "headlineTitle"],
					},
					{
						title: "에피소드 기록관",
						key: "/news/history",
						boardId: getBoardId("/news/history"),
						viewOptions: ["nickname", "headlineTitle"],
					},
					{
						title: "연대기",
						key: "/news/chronicle",
						boardId: getBoardId("/news/chronicle"),
						viewOptions: ["nickname", "date", "shareButton", "headlineTitle"],
					},
				],
			},
			{
				title: "게임정보",
				key: "/info",
				boardId: getBoardId("/info"),
				boards: [
					{
						title: "가이드",
						key: "/info/guide",
						boardId: getBoardId("/info/guide"),
						viewOptions: ["nickname", "date", "headlineTitle", "shareButton"],
					},
				],
			},
			{
				title: "크리에이터",
				key: "/creator",
				boardId: getBoardId("/creator"),
				boards: [
					{
						title: "크리에이터 공지",
						key: "/creator/notice",
						boardId: getBoardId("/creator/notice"),
						viewOptions: ["nickname", "date", "shareButton", "headlineTitle"],
					},
					{
						title: "크리에이터 홍보",
						key: "/creator/promotion",
						boardId: getBoardId("/creator/promotion"),
						forceWrite: true,
						viewOptions: ["nickname", "readCount", "likeCount", "date", "shareButton"],
					},
				],
			},
			{
				title: "미디어",
				key: "/media",
				boardId: getBoardId("/media"),
				boards: [
					{
						title: "공식 이미지",
						key: "/media/image",
						boardId: getBoardId("/media/image"),
						viewOptions: ["nickname", "media", "watermark", "sourcetype"],
					},
					{
						title: "공식 동영상",
						key: "/media/video",
						boardId: getBoardId("/media/video"),
						viewOptions: ["nickname", "media", "watermark", "sourcetype"],
					},
					{
						title: "공식 팬키트",
						key: "/media/fankit",
						boardId: getBoardId("/media/fankit"),
						viewOptions: ["nickname", "watermark", "sourcetype", "download"],
					},
				],
			},
			{
				title: "커뮤니티",
				key: "/community",
				boardId: getBoardId("/community"),
				boards: [
					{
						title: "자유 게시판",
						key: "/community/free",
						boardId: getBoardId("/community/free"),
						viewOptions: [
							"nickname",
							"readCount",
							"likeCount",
							"commentCount",
							"writeAble",
							"date",
							"shareButton",
						],
					},
					{
						title: "질문",
						key: "/community/question",
						boardId: getBoardId("/community/question"),
						viewOptions: [
							"nickname",
							"readCount",
							"likeCount",
							"commentCount",
							"writeAble",
							"date",
							"shareButton",
						],
						forceWrite: true,
					},
					{
						title: "게임 팁",
						key: "/community/tip",
						boardId: getBoardId("/community/tip"),
						viewOptions: [
							"nickname",
							"readCount",
							"likeCount",
							"commentCount",
							"writeAble",
							"date",
							"shareButton",
							"headlineTitle",
						],
						forceWrite: true,
					},
					{
						title: "결사 모집",
						key: "/community/recruit",
						boardId: getBoardId("/community/recruit"),
						viewOptions: [
							"nickname",
							"readCount",
							"likeCount",
							"commentCount",
							"writeAble",
							"date",
							"shareButton",
						],
					},
					{
						title: "이미지 게시판",
						key: "/community/image",
						boardId: getBoardId("/community/image"),
						viewOptions: [
							"nickname",
							"readCount",
							"likeCount",
							"commentCount",
							"writeAble",
							"date",
							"shareButton",
							"sourcetype",
							"headlineTitle",
						],
					},
				],
			},
			{
				title: "렐름 게시판",
				key: "/community/server",
				boardId: getBoardId("/community/server"),
				viewOptions: [
					"nickname",
					"readCount",
					"likeCount",
					"commentCount",
					"writeAble",
					"date",
					"shareButton",
					"headlineTitle",
				],
				boards: [],
				isGroup: true,
				isNew: true,
			},
			{
				title: "고객지원",
				key: "/service",
				boardId: getBoardId("/service"),
				boards: [
					{
						title: "FAQ",
						key: "/service/faq",
						boardId: getBoardId("/service/faq"),
						viewOptions: ["nickname", "date", "shareButton", "headlineTitle"],
					},
					{
						title: "건의 및 제보",
						key: "/service/reports",
						boardId: getBoardId("/service/reports"),
						viewOptions: ["nickname", "date", "writeAble", "commentCount", "headlineTitle"],
					},
					{
						title: "운영 정책",
						key: "/service/policy",
						boardId: getBoardId("/service/policy"),
						viewOptions: ["nickname", "date", "shareButton"],
					},
				],
			},
		],
	};

	return result;
};

export default getClientConfig;
