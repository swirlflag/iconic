export default defineEventHandler((event) => {
	// IE 잡아내서 리다이렉트
	const headers = getHeaders(event);
	const userAgent = headers["user-agent"];
	const isIE = userAgent.toLowerCase().includes("trident") || userAgent.toLowerCase().includes("msie");

	if (isIE) {
		const config = useRuntimeConfig();
		const serviceHost = config.public.env.HOST_URL;
		const notSupportURL = config.public.env.NEXON_BROWSER_BLOCK_URL;
		const redirectURL = `${notSupportURL}?redirectURL=https://${serviceHost}`;
		sendRedirect(event, redirectURL, 301);
	}
});
