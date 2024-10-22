import SYSTEMTEST from "./SYSTEMTEST.vue";
import UNIQUETEST from "./UNIQUETEST.vue";

const uniques = {
	/*
		"unique-이름" : {
			component: vue 컴포넌트
			auth: 자동 인증 체크 여부
			system: 시스템 타입 UI 사용 여부
			option: {
				... 모달 옵션들
			}
		}
	*/
	"unique-sys": {
		component: SYSTEMTEST,
		system: true,
		auth: true,
	},
	"unique-test": {
		component: UNIQUETEST,
		auth: true,
	},
};

const getUnique = (key) => {
	const target = uniques[key];
	return {
		...target,
		// component: markRaw(target.component),
		component: markRaw(target.component),
	};
};

export default getUnique;
