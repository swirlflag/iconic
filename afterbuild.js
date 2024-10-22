/**
 	Nuxt 빌드 종료 후 빌드된 파일을 수정하는 스크립트 입니다.
 	주로 applicationinsight 코드와의 충돌로 작성되었습니다.
	applicationinsight,  nuxt, node 버전을 업그레이드 하면서, 아래 내용들이 필요가 없어지면 하나씩 실행을 중지해주세요.
 */

const fs = require("fs");

/**
 	코드에서 참조값들을 읽을수 있게 선언 추가
	__dirname = ESM에서 현재 파일 경로 지원
	AB_require = ESM에서 require 문법 지원
 */
(() => {
	const filePath = ".output/server/chunks/build/server.mjs";
	const ADD_CODE = `
		\nimport * as AB_url from "url";
		\nimport * as AB_module from "module";
		\nconst __dirname = AB_url.fileURLToPath(new URL(".", import.meta.url));
		\nconst AB_require = AB_module.createRequire(import.meta.url);
	`;

	try {
		let fileContent = fs.readFileSync(filePath, "utf8");
		const importStatementIndex = fileContent.indexOf("import ");
		if (importStatementIndex !== -1) {
			const linesAfterImport = fileContent.substring(importStatementIndex);
			const linesBeforeNextStatement = linesAfterImport.split("\n\n");
			const modifiedFileContent =
				fileContent.slice(0, importStatementIndex + linesBeforeNextStatement[0].length) +
				ADD_CODE +
				linesAfterImport.slice(linesBeforeNextStatement[0].length);
			fs.writeFileSync(filePath, modifiedFileContent, "utf8");
			console.log("[afterbuild: success] - __dirname, AB_require 추가");
		} else {
			console.error("[afterbuild: warning] - import 호출을 찾을 수 없습니다.");
		}
	} catch (error) {
		console.error("[afterbuild: error] - __dirname, AB_require 추가", error);
	}
})();

/**
 	moduleModule.prototype.require 옵셔널 체이닝 및 커스텀으로 생성한 require할당
 */
(() => {
	const filePath = ".output/server/chunks/build/server.mjs";
	const TARGET_CODE = `= moduleModule.prototype.require`;
	const REPLACE_CODE = `= moduleModule.prototype?.require || AB_require`;
	try {
		const data = fs.readFileSync(filePath, "utf8");
		const updatedData = data.replaceAll(TARGET_CODE, REPLACE_CODE);

		fs.writeFileSync(filePath, updatedData, "utf8");

		console.log("[afterbuild: success] - moduleModule.prototype.require 호출에 optional chaning 처리");
	} catch (err) {
		console.error("[afterbuild: error] - moduleModule.prototype.require 호출에 optional chaning 처리", err);
	}
})();

/**
  	APPLICATIONINSIGHTS_CONFIGURATION_CONTENT 에 빈 객체 할당 (JSON 파싱될 대상)
*/

(() => {
	const filePath = ".output/server/chunks/build/server.mjs";
	const TARGET_CODE = `= process.env["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"]`;
	const REPLACE_CODE = `= process.env["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"] || "{}"`;
	try {
		const data = fs.readFileSync(filePath, "utf8");
		const updatedData = data.replaceAll(TARGET_CODE, REPLACE_CODE);

		fs.writeFileSync(filePath, updatedData, "utf8");

		console.log("[afterbuild: success] - APPLICATIONINSIGHTS_CONFIGURATION_CONTENT의 기본값 처리");
	} catch (err) {
		console.error("[afterbuild: error] - APPLICATIONINSIGHTS_CONFIGURATION_CONTENT의 기본값 처리", err);
	}
})();

/**
	require를 실행하는 구문이 있을경우, 커스텀으로 생성한 AB_require로 변경
*/
(() => {
	const filePath = ".output/server/chunks/build/server.mjs";
	const TARGET_CODE = `= require(`;
	const REPLACE_CODE = `= AB_require(`;
	try {
		const data = fs.readFileSync(filePath, "utf8");
		const updatedData = data.replaceAll(TARGET_CODE, REPLACE_CODE);
		fs.writeFileSync(filePath, updatedData, "utf8");
		console.log("[afterbuild: success] - require()를 AB_require()로 교체");
	} catch (err) {
		console.error("[afterbuild: error] - require()를 AB_require()로 교체", err);
	}
})();
