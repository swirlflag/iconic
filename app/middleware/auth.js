/** [MEMO] 인증 가드 사용
	페이지 가드 사용시
	definePageMeta({
		middleware: ["auth"],
	});

	함수로 사용시
	cosnt authGuard = useAuthGuard();
	// authGuard.block : Boolean;
	// authGuard.type : "nexon" | "community" | "ok";
	// authGuard.server : Boolean;
*/

import { useNexonStore, useAsyncStore } from "@store";

export default defineNuxtRouteMiddleware(async (to, from) => {
	/*
	 * [ISSUE] 서버 환경에서는 inface의 success를 감지할수 없어 /via/auth 페이지로 이동시킨후 클라이언트 인증 전용 페이지 스코프 에서 인증을 확인합니다.
	 */
	return;
	const isServer = import.meta.server;
	if (isServer) {
		const toPath = useCookie("NUXT_PUBLIC_AUTH_TOPATH");
		toPath.value = to.fullPath;
		return navigateTo({ path: "/via/auth" });
	}

	const isDirectLanding = to.fullPath === from.fullPath;
	const nexonStore = useNexonStore();
	const AS = useAsyncStore();

	nexonStore.install({ inface: true });

	await AS.inface.stay();

	const authGuard = useAuthGuard({ redirect: to.fullPath });

	if (authGuard.block) {
		if (isDirectLanding) {
			return navigateTo("/main");
		} else {
			return abortNavigation();
		}
	}
});
