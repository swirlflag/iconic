import gsap from "gsap";
import dayjs from "dayjs";

let env = null;
let config = null;

const getEnv = () => {
	if (!env) {
		const config = useRuntimeConfig();
		env = { ...config.public, ...config.app };
	}
	return env?.env;
};

/**
 *  Object To Query string
 */
export const objectToQuery = (...objs) => {
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
};

/**
 *  Query string To Object
 */
export const queryToObject = (string = location.search) => {
	return Object.fromEntries(new URLSearchParams(string));
};

export const setRootStyleValue = (name, value) => {
	const styleRoot = document.querySelector(":root");
	styleRoot.style.setProperty(`--${name}`, value);
};

export const delay = async (time) => {
	return new Promise((resolve) => setTimeout(() => resolve(), time));
};

export const cdn = (path) => {
	const { CDN_URL } = getEnv();
	return `${CDN_URL}${path}`;
};

export const checkComposedPath = (eventOrPath, ...targets) => {
	const path = Array.isArray(eventOrPath) ? eventOrPath : eventOrPath.composedPath();

	if (!path) {
		return false;
	}

	for (let i = 0, l = path.length; i < l; ++i) {
		const isDetect = targets.includes(path[i]);

		if (isDetect) {
			return true;
		}
	}
	return false;
};

export const checkRelease = (openTime = undefined, closeTime = undefined, currentTime = undefined) => {
	if (!currentTime) {
		currentTime = undefined;
	}
	const target = dayjs(currentTime);
	const before = dayjs(openTime);
	const after = dayjs(closeTime);
	const isBefore = openTime ? target.isBefore(before) : false;
	const isAfter = closeTime ? target.isAfter(after) : false;
	const isRelease = !isBefore && !isAfter;
	const leftTime = isBefore
		? {
				day: before.diff(target, "day"),
				hour: before.diff(target, "hour") % 24,
				minute: before.diff(target, "minute") % 60,
				second: before.diff(target, "second") % 60,
				distance: before.diff(target),
		  }
		: null;
	return { isBefore, isAfter, isRelease, leftTime };
};

/**
 * @param { Array } dataArray
 * Array[String]을 전달하면, key를 String으로 value를 true로 설정한 객체로 반환한다
 */
export const refineConfigMap = (dataArray) => {
	if (!Array.isArray(dataArray)) {
		return dataArray;
	}
	const result = {};
	dataArray.forEach((item) => {
		if (typeof item === "string") {
			result[item] = true;
		} else {
			for (const key in item) {
				if (item.hasOwnProperty(key)) {
					result[key] = item[key];
				}
			}
		}
	});
	return result;
};

export const findObjectByKeyValue = (object, key, value, option = {}) => {
	let result = {};

	const parentDepth = option?.parent === true ? 1 : option?.parent || false;

	const loop = (target, parents = []) => {
		if (Array.isArray(target)) {
			for (const item of target) {
				const r = loop(item, [target, ...parents]);
				if (r) {
					break;
				}
			}
			return;
		}

		if (target && typeof target === "object") {
			for (const [k, v] of Object.entries(target)) {
				if (k === key && v === value) {
					result = parentDepth ? parents[parentDepth] : target;
					return true;
				} else {
					const r = loop(v, [target, ...parents]);
					if (r) {
						break;
					}
				}
			}
		}

		return false;
	};

	loop(object);

	return result;
};

export const mergeTruthyValues = (origin, payload) => {
	return Object.assign(origin, Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null)));
};

export const randomOne = (...l) => l[Math.floor(Math.random() * l.length)];

export const checkNew = (timestamp) => {
	return Date.now() - parseInt(timestamp + "000") <= 86400000;
};

export const dateFormatter = (timestamp) => {
	timestamp += "000";
	const nowTime = dayjs(+timestamp);
	const formatTime = nowTime.format("HH:mm");
	const formatDate = nowTime.format("YYYY.MM.DD");
	return {
		time: formatTime,
		date: formatDate,
		full: `${formatDate} ${formatTime}`,
	};
};
