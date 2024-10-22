// // "InstrumentationKey=7742b744-2bbf-477d-8ef6-56eefb584f69;IngestionEndpoint=https://koreacentral-0.in.applicationinsights.azure.com/;LiveEndpoint=https://koreacentral.livediagnostics.monitor.azure.com/"

/**
 * Nuxt3+ 는 현재 선언적 앱 실행이 어려워서 applicationinsights를 app 내부 로직에 포함시켰습니다.
 * 아래 import문으로 불러온 applicationinsights는 nuxt.config.ts 에서 transpile로 지정해두어도 빌드 파일에서 require 문으로 바뀌게 되는데요, afterbuild.js에서 이를 보정해 줍니다.
 *
 * 추후 버전에서 new Nuxt() 등으로 선언적 앱 로딩이 가능하게 될 경우엔,
 * node http나 express등을 사용하여 nuxt app 바깥쪽에서 applicationinsights가 실행될수 있게 수정해주세요.
 */

// import process from "process";
// import appInsights from "applicationinsights";
const process = require("process");
const appInsights = require("applicationinsights");
const isCanuseAppinsight = !!process.env.APPSETTING_APPLICATIONINSIGHTS_CONNECTION_STRING;
let client = null;

if (isCanuseAppinsight) {
	appInsights
		.setup()
		.setAutoDependencyCorrelation(true)
		.setAutoCollectRequests(true)
		.setAutoCollectPerformance(true, true)
		.setAutoCollectExceptions(true)
		.setAutoCollectDependencies(true)
		.setAutoCollectConsole(true, false)
		.setUseDiskRetryCaching(true)
		.setAutoCollectPreAggregatedMetrics(true)
		.setSendLiveMetrics(false)
		.setAutoCollectHeartbeat(false)
		.setInternalLogging(false, true)
		.setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
		.enableWebInstrumentation(false);
	appInsights.defaultClient.setAutoPopulateAzureProperties(true);
	appInsights.defaultClient.addTelemetryProcessor((envelope, context) => {
		const baseData = envelope.data.baseData;
		if (appInsights.Contracts.domainSupportsProperties(baseData)) {
			const ipAddress = envelope.tags[appInsights.defaultClient.context.keys.locationIp];
			if (ipAddress) {
				baseData.properties["client-ip"] = ipAddress;
			}

			if (context["http.ServerRequest"]) {
				if (context["http.ServerRequest"].headers) {
					if (context["http.ServerRequest"].headers["cookie"]) {
						baseData.properties["Cookie"] = context["http.ServerRequest"].headers["cookie"];
					}
					if (context["http.ServerRequest"].headers["referer"]) {
						baseData.properties["Referer"] = context["http.ServerRequest"].headers["referer"];
					}
				}
			}
		}
		return true;
	});
	appInsights.start();
	client = appInsights.defaultClient;
}

const init = () => {
	if (isCanuseAppinsight) {
		const { node } = useRequestEvent();
		client && client.trackNodeHttpRequest({ request: node.req, response: node.res });
	}
};

export default defineNuxtPlugin(init);
