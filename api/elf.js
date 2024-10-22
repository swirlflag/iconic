/**
 * elf. ErrorLess Fetch.
 * elf는 비즈니스 로직에서 비동기 호출의 reject를 처리하기 위한 catch 절을 작성해 처리하는 대신
 * 에러 발생 유무와 상관없이 resolve와 동일한 스코프를 유지하면서 예외 처리를 가능하게 만들어 줍니다.
 *
 * 그 외에, 프로젝트에서 사용하는 API포인트에 대한 호출이 쉽게 가능하도록
 * 초기 셋팅을 지원하며 이후 지정된 ticket 값만으로 로직과 코드를 균일하게 작성하는데 도움을 줍니다.
 *
 *
 * @param {Object} $p - API 요청에 필요한 매개변수 객체입니다.
 * @param {string} [$p.ticket] - API 티켓 식별자입니다.
 * @param {string} [$p.method=elf.METHOD.GET] - 요청에 사용할 HTTP 메서드입니다.
 * @param {Object} [$p.query] - 요청에 사용할 쿼리 매개변수입니다.
 * @param {string} [$p.origin] - 요청의 출처 URL입니다.
 * @param {string} [$p.url] - 요청의 전체 URL입니다. 제공되지 않으면, origin, path 및 query로 구성됩니다.
 * @param {Object} [$p.path] - API 호출의 경로입니다.
 * @param {Object} [$p.method] - API 호출에 사용할 HTTP 메서드입니다.
 * @param {boolean} [$p.withCredential=false] - 요청에 자격 증명을 포함할지 여부입니다.
 * @param {string} [$p.credentials="same-origin"] - 요청에 사용할 자격 증명 옵션입니다.
 * @param {Object} [$p.headers] - 요청에 사용할 추가 헤더입니다.
 * @param {Object} [$p.options] - fetch 요청에 사용할 추가 옵션입니다.
 * @param {Object} [$p.data] - 요청 본문에 보낼 데이터입니다 (POST, PUT 등).
 * @param {boolean} [$p.log=false] - 요청 및 응답 세부 정보를 로그로 남길지 여부입니다.
 * @param {function} [$p.codePath] - 응답 데이터에서 코드 위치를 찾아내는 함수입니다.
 * @param {Object} [$p.codeMessage] - 응답 코드에 대한 메시지에 대한 정보를 포함하는 객체입니다.
 * @param {Object} [elf.AIRPLANE] - API 호출에 사용할 설정을 포함하는 객체입니다.
 * @param {string} [$p.name] - API 호출의 이름입니다.
 * @param {function} [$p.okCondition] - API 호출의 성공 여부에 대한 조건 확인 함수입니다.
 * @param {function} [$p.airplane] - API를 호출할 때 사용할 설정을 반환하는 함수입니다.
 * @returns {Promise<Object>} - API 요청의 결과를 반환합니다.
 * @throws {string} - API 티켓이 없거나 유효하지 않은 경우 오류를 발생시킵니다.
 *
 * @example
 * const result = await elf({
 *     ticket: "myApiTicket",
 *     method: "POST",
 *     url: "https://api.example.com/data",
 *     data: { key: "value" },
 *     log: true
 * });
 */

const elf = async function ($p) {
	const name = $p.name || null;
	const method = $p?.method || elf.METHOD.GET;
	const ticket = $p.ticket ? elf.TICKET[$p.ticket] : "UNKNOWN";
	const airplane = $p?.airplane || elf.getAirplane(ticket, $p) || null;
	const query = $p?.query ? elf.util.objectToQuery($p.query) : "";
	const origin = $p?.origin || airplane?.origin;
	const url = $p?.url || `${origin}${$p.path}${query}`;
	const credentials = $p.credentials || ($p.withCredential ? "include" : "same-origin");

	const okCondition = $p?.okCondition || airplane?.okCondition;

	const options = {
		method,
		headers: {
			"Content-type": "application/json; charset=UTF-8",
			...airplane?.headers,
			...$p?.headers,
		},
		...$p?.options,
		credentials,
	};

	if ($p?.data) {
		options.body = JSON.stringify($p.data);
	}

	let result = {};
	try {
		if ($p?.log) {
			console.log(" ");
			elf.util.log("----- ELF LOG START -----");
			elf.util.log("fetch()", url, options);
		}
		const response = await fetch(url, options);
		if ($p?.log) {
			elf.util.log("response: ", response);
		}

		let data = null;
		const errors = [];

		try {
			data = await response.json();
		} catch (jsonError) {
			errors.push(`[JSON ERROR] ${jsonError.message}`);
		}

		let { ok, status } = response;

		const responseOk = ok;

		if (okCondition) {
			ok = okCondition(data);
		}

		if (!responseOk) {
			errors.push(`[HTTP ERROR] status: ${status}`);
		}
		const error = errors.length ? errors.join(" | ") : null;

		let code = elf.util.getCode($p, airplane, data);

		if (!code) {
			code = error ? "-1" : "-0";
		}

		result = {
			ok,
			responseOk,
			networkOk: true,
			status,
			data,
			error,
			code,
			name,
			response,
			payload: { ...$p },
		};
	} catch (networkError) {
		console.error("networkError: ", networkError);
		if ($p?.log) {
			elf.util.errorlog("networkError: ", networkError);
		}
		const error = `[NETWORK ERROR] message: ${networkError.message}`;
		result = {
			ok: false,
			responseOk: false,
			networkOk: false,
			error,
			response: null,
			data: null,
			code: "-2",
			name,
			payload: { ...$p },
		};
	}

	result.payload.name && delete result.payload.name;

	const { codeMessage, codeHint } = elf.util.getCodeMessage($p, result);

	result.codeMessage = codeMessage;
	result.codeHint = codeHint;

	if ($p.log) {
		const log = result.ok ? elf.util.log : elf.util.errorlog;
		log("result: ", result);
		elf.util.log("----- ELF LOG END -------");
	}

	return result;
};

elf.METHOD = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	PATCH: "PATCH",
	DELETE: "DELETE",
	get: "GET",
	post: "POST",
	put: "PUT",
	patch: "PATCH",
	delete: "DELETE",
};

elf.TICKET = {};
elf.AIRPLANE = {};
elf.CODEMESSAGE = {};
elf.CODEMESSAGE_DEFAULT = {
	"-0": "정상 호출 되었습니다.",
	"-1": "알 수 없는 오류가 발생했습니다.",
	"-2": "네트워크 오류가 발생했습니다.",
	// "-3": "올바른 요청이 아닙니다.",
};

elf.util = {
	log: (first, ...log) => {
		console.log(`%c${first}`, "font-weight: 700;padding: 2px;background: rgb(8, 60, 230); color: #fff", ...log);
	},
	errorlog: (first, ...log) => {
		console.log(`%c${first}`, "font-weight: 700;padding: 2px;background: rgb(230, 80, 100); color: #fff", ...log);
	},
	objectToQuery: (...objs) => {
		return (
			"?" +
			objs
				.map((obj) =>
					Object.entries(obj)
						.filter(([k, v]) => v !== undefined)
						.map((c) => c.join("="))
						.join("&"),
				)
				.join("&")
		);
	},

	getCodeMessage: ($p = { ticket }, result = { code, status }) => {
		const { ticket = "CLIENT" } = $p;
		const { code = "-1", status = "000" } = result;
		const ticketSign = ticket.slice(0, 2);
		const codeMessage =
			$p.codeMessage?.[code] ||
			elf.CODEMESSAGE?.[ticket]?.[code] ||
			elf.CODEMESSAGE_DEFAULT?.[code] ||
			"알 수 없는 오류가 발생했습니다.";
		const codeHint = `${status}/${ticketSign}/${code}`;
		return {
			codeMessage,
			codeHint,
		};
	},

	getCode($p, airplane, data) {
		if ($p.codePath) {
			return $p.codePath(data);
		}
		if (airplane.codePath) {
			return airplane.codePath(data);
		}
		return data?.code || data?.errorCode || data?.errorcode || data?.error?.code || data?.error?.errorCode;
	},
};

elf.getAirplane = ($ticket, $p) => {
	const airplane = elf.AIRPLANE[$ticket]
		? typeof elf.AIRPLANE[$ticket] === "function"
			? elf.AIRPLANE[$ticket]($p)
			: elf.AIRPLANE[$ticket]
		: null;

	if (!elf.CODEMESSAGE[$ticket] && airplane) {
		elf.CODEMESSAGE[$ticket] = airplane?.codeMessage;
	}
	return airplane;
};

elf.setAirplane = ($options) => {
	[...Object.entries($options)].forEach(([k, v]) => {
		elf.TICKET[k] = k;
		elf.AIRPLANE[k] = v;
	});
};

export default elf;
