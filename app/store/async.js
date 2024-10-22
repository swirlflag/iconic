/** [MEMO]
 * @/utils/uses.js
 * useAsyncStatus 참고
 */

const ASYNC_STATUS_DATA = {
	// 글로벌, 공통
	inface: null,
	nexonGnb: null,
	PS: null,

	// 커뮤니티
	communityConfig: null,
	communityInstall: null,
	communityUser: null,
	communityThread: null,
	communityThreads: null,
};

import { useAsyncStatus } from "@composables";

export const useAsyncStore = defineStore("async", () => {
	const result = Object.entries(ASYNC_STATUS_DATA).reduce(
		(p, [k, v]) => ((p[k] = useAsyncStatus({ name: k, methods: true, ...v })), p),
		{},
	);
	return result;
});
