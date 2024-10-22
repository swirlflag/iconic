module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es6: true,
		"vue/setup-compiler-macros": true,
	},
	parserOptions: {
		parser: "@babel/eslint-parser",
		requireConfigFile: false,
	},
	extends: ["@nuxtjs", "plugin:nuxt/recommended", "prettier"],
	plugins: [],
	rules: {
		// vue 컴포넌트 이름이 항상 두 단어 이상이어야 하는 옵션입니다.
		"vue/multi-word-component-names": "off",

		// 마침표 연산자를 강제하지 않게 하는 규칙입니다.
		"dot-notation": "off",

		// Vue 컴포넌트의 셀프 클로징 태그를 일관성 있게 유지하는 규칙입니다.
		"vue/html-self-closing": [
			"error",
			{
				html: {
					void: "always",
					normal: "never",
					component: "always",
				},
				svg: "always",
				math: "always",
			},
		],

		//  느슨한 비교(==, !=) 대신 엄격한 비교(===, !==)를 강제합니다.
		eqeqeq: ["error", "always"],

		// let 대신 변경되지 않는 변수에 대해 const를 사용하는 것을 권장하여 코드의 명확성을 높입니다.
		"prefer-const": "warn",
	},
};
