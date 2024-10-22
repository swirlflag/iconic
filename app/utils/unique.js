/**
 * 특수한 1회성, 재사용성이 매우 적은 유니크 함수들을 작성해줍니다.
 */

// 디바이스 종류 감지
export const detectDevice = (userAgent) => {
	if (!userAgent) {
		return "unknown";
	}

	if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
		return "tablet";
	}
	if (/mobile|android|iphone|ipod|blackberry|iemobile|kindle|silk|hpwos|webos|opera mini/i.test(userAgent)) {
		return "mobile";
	}

	return "desktop";
};

// OS 종류 감지
export const detectOS = (userAgent) => {
	if (!userAgent) {
		return "unknown";
	}

	userAgent = userAgent.toLowerCase();

	if (
		userAgent.includes("like mac") ||
		userAgent.includes("iphone") ||
		userAgent.includes("ipad") ||
		userAgent.includes("ipod")
	) {
		return "ios";
	} else if (userAgent.includes("macintosh") || userAgent.includes("mac os x")) {
		return "mac";
	} else if (userAgent.includes("windows nt") || userAgent.includes("win")) {
		return "windows";
	} else if (userAgent.includes("linux")) {
		return "linux";
	} else if (userAgent.includes("android")) {
		return "android";
	}
	return "unknown";
};

// 브라우저 종류 감지
export const detectBrowser = (userAgent, isServer) => {
	if (!userAgent) {
		return "unknown";
	}

	const isEdge = userAgent.match(/edg/i);
	if (isEdge) {
		return "edge";
	}

	const isFirefox = userAgent.match(/firefox|fxios/i);
	if (isFirefox) {
		return "firefox";
	}

	const isOpera = userAgent.match(/opr\/|opera/i);
	if (isOpera) {
		return "opera";
	}

	const isChrome = userAgent.match(/chrome|chromium|crios/i);
	if (isChrome) {
		return "chrome";
	}

	if (!isServer) {
		const isIE = userAgent.includes("MSIE") || userAgent.includes("Trident");

		if (isIE) {
			return "ie";
		}

		const isBlink = (isChrome || isOpera) && !!window.CSS;
		if (isBlink) {
			return "blink";
		}
	}

	const isSafari = userAgent.match(/safari/i);
	if (isSafari) {
		return "safari";
	}

	return "unknown";
};

// 터치 사용 기기 여부 감지
export const detectUseTouch = () => {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		return false;
	}
	return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};

// 마우스 사용 여부 감지
export const detectUseMouse = () => {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		return false;
	}
	return window.matchMedia("(pointer:fine)").matches;
};

// 커뮤니티 관련 config 병합
export const mergeBoardConfig = (originA = [], originB = [], originKey = "boardId") => {
	const loop1 = (a = [], b = [], key = "boardId") => {
		const result = [];
		a = [...a];
		b = [...b];

		const all = [...a, ...b];
		const indexMap = {};

		// 병합 작업을 한 번의 루프로 처리
		all.forEach((item) => {
			const keyValue = item[key];
			if (!indexMap[keyValue]) {
				indexMap[keyValue] = { ...item };
			} else {
				// 중복된 항목 병합
				const existingItem = indexMap[keyValue];
				indexMap[keyValue] = {
					...existingItem,
					...item,
					boards: loop1(existingItem?.boards || [], item?.boards || [], key),
				};
			}
		});

		for (let keyValue in indexMap) {
			let item = indexMap[keyValue];

			// 헤드라인 공백 정리
			if (item.boardHeadlines) {
				item.boardHeadlines = item.boardHeadlines.map((headline) => ({
					...headline,
					title: headline.title.replace("_", " "),
				}));
			}

			// 보드 옵션을 객체로 변환
			if (item.viewOptions) {
				item.viewOptions = refineConfigMap(item.viewOptions);
			}

			// to가 없는 경우 key를 to로 할당
			if (!item.to && item.key) {
				item.to = item.key;
			}

			// 하위 보드의 to 속성 설정
			if (item.boards) {
				item.boards.forEach((child) => {
					if (!child.to && !child.key) {
						child.to = item.key;
					}
				});
			}

			result.push(item);
		}

		return result;
	};

	const loopResult1 = loop1(originA, originB, originKey);

	const loopResult2 = {};
	const loop2 = (boards, parent = null) => {
		const parentId = parent?.boardId;
		for (let i = 0, l = boards.length; i < l; i++) {
			const target = boards[i];

			if (parentId) {
				target.parentId = parentId;
			}

			if (target.boards?.length) {
				const boards = target.boards;
				const childBoards = [...target.boards];
				const childIds = childBoards.map((board) => board.boardId);
				target.childIds = childIds;
				loop2([...boards], { ...target });
			}

			loopResult2[target.boardId] = target;
			target.key && (loopResult2[target.key] = target);
			delete target.boards;
		}
	};

	loop2(loopResult1);

	return loopResult2;
};
