// env중 NUXT_PUBLIC_ 접두사가 붙은 항목만 클라이언트에서 사용 가능하게 설정해준다.
const getRefineEnvs = (processEnv) => {
	return Object.entries(processEnv)
		.filter(([k, v]) => k.indexOf("NUXT_PUBLIC_") === 0)
		.reduce((p, [k, v]) => {
			p[k.replace("NUXT_PUBLIC_", "")] = v;
			return p;
		}, {});
};

// const mode = import.meta.env?.NUXT_PUBLIC_MODE?.toLowerCase();

// config({ path: `.env.${mode}` });

const env: any = getRefineEnvs(import.meta.env);

// https://www.favicon-generator.org/
const faviconData = {
	link: [
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: "/favicon/favicon-32x32.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: "/favicon/favicon-16x16.png",
		},
		{ rel: "manifest", href: "/favicon/manifest.json" },
		{
			rel: "mask-icon",
			href: "/favicon/safari-pinned-tab.svg",
			color: "#000",
		},
	],
	meta: [
		{ name: "msapplication-TileImage", content: "/favicon/ms-icon-144x144.png" },
		{ name: "msapplication-TileColor", content: "#fff" },
		{ name: "theme-color", content: "#ffffff" },
	],
};

const configs = {
	alias: {
		"@": "",
		"@component": "/components",
		"@components": "/components",
		"@comp": "/components",
		"@store": "/store/index",
		"@stores": "/store/index",
		"@composables": "/composables/index",
		"@uses": "/composables/index",
		"@utils": "/utils",
		"@lib": "/lib",
		"@modal": "/components/Modal",
		"@api": "../api/api",
		"@data": "/data",
		"@text": "/data/text",
		"@config": "/data/config",
	},

	devtools: { enabled: true },

	modules: [
		"@pinia/nuxt",
		// "@nuxt/image",
		// "@vueuse/nuxt",
		// "nuxt-security",
	],

	// https://nuxt.com/modules/security
	security: {
		hidePoweredBy: false,
		headers: {
			contentSecurityPolicy: {
				"script-src": ["'self'", "'strict-dynamic'", "'unsafe-eval'", "'nonce-{{nonce}}'", "https:"],
				"img-src": ["'self'", "https:"],
			},
		},
		nonce: true,
	},

	app: {
		baseURL: "/",
		head: {
			charset: "utf-8",
			viewport: "width=device-width, shrink-to-fit=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0",
			title: env.PROJECT_TITLE,
			link: [...faviconData.link],
			meta: [
				{ name: "og:title", content: env.PROJECT_TITLE },
				{ name: "description", content: env.PROJECT_DESCRIPTION },
				{ name: "og:description", content: env.PROJECT_DESCRIPTION },
				{ name: "og:url", content: env.HOST_URL },
				{ name: "og:image", content: "" },
				...faviconData.meta,
			],
			script: [
				// 유튜브 iframe
				{
					src: "https://www.youtube.com/iframe_api",
				},
			],
		},
	},

	runtimeConfig: {
		public: {
			env,
		},
	},

	devServer: {
		port: 443,
		https: {
			key: "nexon.com-key.pem",
			cert: "nexon.com.pem",
		},
	},

	nitro: {
		preset: "node-server",
	},

	vite: {
		css: {
			preprocessorOptions: {
				// 글로벌 스타일 설치: https://nuxt.com/docs/getting-started/assets#global-styles-imports
				// 구형 JS API 관련 https://sass-lang.com/documentation/breaking-changes/legacy-js-api/
				scss: {
					additionalData: `
						@use "/styles/preload/preload.scss" as *;
						$cdnurl : "${env.CDN_URL}";
					`,
					// silenceDeprecations: ["legacy-js-api"],
					api: "modern-compiler",
				},
			},
		},
		build: {
			// https://ko.vitejs.dev/config/build-options#build-rollupoptions
			// https://rollupjs.org/configuration-options/#output-manualchunks
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("app/store/")) {
							return "store";
						}
					},
				},
			},
		},
	},

	// css preload : https://v3.nuxtjs.org/api/configuration/nuxt-config#css
	css: [
		"/styles/global/reset.css",
		"/styles/global/font.scss",
		"/styles/global/global.scss",
		"/styles/global/scramble.scss",
		"/styles/global/test.scss",
		"/styles/global/thirdparty.scss",
	],

	// 지속적으로 확인 후 조정 필요
	experimental: {
		// inlineRouteRules: false,
		// https://github.com/nuxt/nuxt/issues/20889
		renderJsonPayloads: false,
	},

	future: {
		compatibilityVersion: 4,
	},

	// [TODO] dev 오류로 임시 작성
	compatibilityDate: "2040-01-01",

	build: {
		// https://nuxt.com/docs/guide/concepts/esm
		transpile: [
			"@babel/core",
			"@babel/preset-env",
			"@babel/plugin-transform-modules-commonjs",
			"applicationinsights",
			"estree-walker",
			"@opentelemetry/api",
			"@opentelemetry/instrumentation",
		],
	},
};

export default defineNuxtConfig(configs);
