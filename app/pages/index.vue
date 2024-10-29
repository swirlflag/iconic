<template>
	<div class="page--main">
		<div class="controls" :class="`depth--${status.depth}`">
			<div class="_depth _d1">
				<h1 class="project-name">Icon in center</h1>

				<div class="testdiv" v-if="0">
					<InputText
						v-model="TESTMODEL.value3"
						v-model:valid="TESTMODEL.valid3"
						placeholder="숫자만 ㄱㄱ"
						validate="^([2-9]\d{2,3})-\d{4}|([2-9]\d{3})\d{4}$"
						pattern="^\d{0,8}$"
					/>
					<br />
					{{ TESTMODEL.value3 }}
					<br />
					{{ TESTMODEL.valid3 }}
					<br />

					<button class="testbtn" @click="TESTMODEL.value3 = '49451051'">콱</button>
				</div>

				<div class="_block">
					<div class="title-1">표시 변경</div>
					<div class="controls-entries"></div>
					<table>
						<tbody>
							<tr>
								<th>Scale (box)</th>
								<td class="box-x">
									<InputToggle v-model="status.isBoxMode" />
								</td>
							</tr>
							<tr>
								<th>Guideline</th>
								<td class="box-x">
									<InputToggle v-model="status.isGuideMode" />
								</td>
							</tr>
							<tr>
								<th>Icon only</th>
								<td class="box-x">
									<InputToggle v-model="status.isIconOnly" />
								</td>
							</tr>
							<tr>
								<th>Invert background</th>
								<td class="box-x">
									<InputToggle v-model="status.isInvertBackground" />
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="box-y _block">
					<div class="title-1">View (미구현)</div>
					<div class="description">아이콘 리스트 조회 화면을 편집 합니다.</div>
					<div class="title-2">검색</div>
					<div class="description">아이콘 정보를 검색합니다.</div>
					<div class="box-x">
						<InputText placeholder="미구현" disabled />
					</div>
					<div class="title-2">필터</div>
					<div class="description">prefix 이름으로 필터링 합니다</div>
					<div class="box-x">
						<ButtonBasic disabled>미구현</ButtonBasic>
					</div>
					<div class="title-2">정렬</div>
					<div class="description">prefix 이름으로 정렬 합니다</div>
					<div class="box-x">
						<ButtonBasic disabled>미구현</ButtonBasic>
					</div>
				</div>

				<div class="_bottom-marker"></div>
				<div class="box-y _block">
					<div class="title-1">Upload</div>
					<div class="description">새로운 아이콘 업로드</div>
					<div class="box-x"></div>
					<ButtonBasic @click="onClickReadyUpload"> 확인 </ButtonBasic>
				</div>
				<div class="box-y _block">
					<div class="title-1">Purge</div>
					<div class="description">소스 최신화 기능</div>
					<ButtonBasic @click="() => stepRouter('purge')"> 확인 </ButtonBasic>
					<div class="box-x"></div>
				</div>
				<div class="box-y _block">
					<div class="title-1">복잡한 기능</div>
					<div class="description">더 복잡한 옵션을 확인합니다.</div>
					<ButtonBasic @click="() => stepRouter('complex')"> 확인 </ButtonBasic>
				</div>
			</div>

			<TransitionGroup>
				<div class="_depth _d2" v-if="checkBreadCrumb('purge', 2)">
					<div class="_block box-y">
						<div class="title-0">Purge</div>
						<div class="description">최신화가 필요한 아이콘들을 선택 후 퍼지를 진행해 주세요.</div>
					</div>
					<div class="_block box-y">
						<div class="title-1">아이콘 퍼지</div>
						<div class="description">선택된 아이콘 리스트를 최신화 합니다.</div>
						<div class="box-x">
							{{ select.list }}
						</div>
						<ButtonBasic :disabled="!select.list?.length" @click="tryPurgeIcon"> PURGE ! </ButtonBasic>
					</div>
					<div class="_block box-y">
						<div class="title-1">스크립트 퍼지</div>
						<div class="description">스크립트가 동기화 된 상태입니다.</div>
						<ButtonBasic disabled> PURGE ! </ButtonBasic>
					</div>
					<div class="_block box-y"></div>
					<div class="_bottom-marker"></div>
					<div class="_block">
						<ButtonBasic @click="onClickBackDepth"> BACK </ButtonBasic>
					</div>
				</div>
				<div class="_depth _d2" v-if="checkBreadCrumb('complex', 2)">
					<div class="_block box-y">
						<div class="title-0">복잡한 기능</div>
						<div class="description">더 복잡한 옵션을 조작할 수 있습니다.</div>
					</div>
					<div class="box-y _block">
						<div class="title-1">참조 모드(미구현)</div>
						<div class="description">참조 모드를 변경합니다.</div>
						<div class="box-x">
							<InputToggle />
						</div>
					</div>
					<div class="_bottom-marker"></div>
					<div class="_block">
						<ButtonBasic @click="onClickBackDepth"> BACK </ButtonBasic>
					</div>
				</div>
			</TransitionGroup>
		</div>

		<div class="gallery">
			<div class="gallery-wrap">
				<ASC :AS="AS.DATA">
					<div class="icon-list">
						<template v-for="item in dataList">
							<div
								class="icon-item"
								:class="{
									[`select--${status.selectMode}`]: item.isSelect,
								}"
								@click="() => onClickIconItem(item)"
							>
								<div
									class="_icon"
									:class="{
										'-guideline': status.isGuideMode,
										'-invert-bg': status.isInvertBackground,
									}"
								>
									<template v-if="item.isTarget">
										<i class="form-icon" :class="{ '-box': status.isBoxMode }">
											<span :style="formStyle"></span>
										</i>
									</template>
									<template v-else>
										<i :class="{ [`i--${item.key}`]: true, '-box': status.isBoxMode }"> </i>
									</template>
								</div>
								<template v-if="!status.isIconOnly">
									<div class="_key">{{ item.key }}</div>
								</template>
							</div>
						</template>
					</div>
				</ASC>
			</div>

			<div class="update-form" :class="{ '-active': openStatus.form }">
				<div class="_header">
					<div class="title-1">
						<template v-if="status.isUpload">신규 업로드</template>
						<template v-else>업데이트</template>
					</div>
					<div class="_description">
						<template v-if="status.isUpload">새로운 아이콘을 업로드 합니다.</template>
						<template v-else>기존 아이콘을 업데이트 합니다.</template>
					</div>
				</div>

				<div class="_preview">
					<div
						class="_icon"
						:class="{
							'-guideline': status.isGuideMode,
							'-display': form.url,
							'-invert-bg': status.isInvertBackground,
						}"
					>
						<div class="_file-select" v-if="status.isUpload">
							<ButtonBasic>
								파일 선택
								<input type="file" @change="onChangeFileInput" />
							</ButtonBasic>
						</div>
						<i class="form-icon" :class="{ '-box': status.isBoxMode }">
							<span :style="formStyle"></span>
						</i>
					</div>

					<InputRange class="_range-x" v-model="form.pos[0]" />
					<InputRange class="_range-y" v-model="form.pos[1]" />
				</div>

				<div class="_entries">
					<table>
						<tbody>
							<tr>
								<th>Position</th>
								<td class="box-x">
									<InputText
										v-model="form.pos[0]"
										prefix="x"
										suffix="%"
										placeholder="00"
										right
										pattern="^(100|[1-9]?[0-9])$"
										@blur="(e, options) => onBlurInputPercent(50, options)"
										class="_percent"
									/>
									<InputText
										v-model="form.pos[1]"
										prefix="y"
										suffix="%"
										placeholder="00"
										right
										pattern="^(100|[1-9]?[0-9])$"
										@blur="(e, options) => onBlurInputPercent(50, options)"
										class="_percent"
									/>
								</td>
							</tr>
							<tr>
								<th>Scale</th>
								<td class="box-x">
									<InputRange v-model="form.box" />
									<InputText
										v-model="form.box"
										suffix="%"
										placeholder="00"
										right
										pattern="^(100|[1-9]?[0-9])$"
										@blur="(e, options) => onBlurInputPercent(70, options)"
										class="_percent"
									/>
								</td>
							</tr>
							<tr>
								<th>Fill type</th>
								<td class="box-x">
									<div>
										<ButtonBasic> {{ form.fill }} </ButtonBasic>
										<InputSelector :list="Object.keys(fillPropsMap)" v-model:value="form.fill" />
									</div>
								</td>
							</tr>
							<tr>
								<th>Color</th>
								<td class="box-x">
									<ClientOnly>
										<InputColor v-model="form.color" :disabled="form.fill === 'origin'" />
									</ClientOnly>
								</td>
							</tr>

							<tr>
								<th>Prefix</th>
								<td class="box-x">
									<ButtonBasic :disabled="!status.isUpload">
										{{ prefixData[form.prefix] }}
										<InputSelector
											:list="Object.entries(prefixData).map(([k, v]) => ({ name: v, value: k }))"
											v-model:value="form.prefix"
										/>
									</ButtonBasic>
								</td>
							</tr>
							<tr>
								<th>Name</th>
								<td class="box-x">
									<InputText
										v-model="form.name"
										placeholder="숫자, 영문, -, _"
										pattern="^[0-9a-zA-Z-_]+$"
										:disabled="!status.isUpload"
									/>
								</td>
							</tr>
							<tr>
								<th>Code Preview</th>
								<td class="box-x">
									<code
										class="codeview"
										v-html="formComputed.codeSyntax"
										@click="onClickCopyIconHTML"
									></code>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="_actions box-x">
					<ButtonBasic @click="onClickUpdateIcon">
						{{ status.isUpload ? "업로드" : "수정하기" }}
					</ButtonBasic>
					<template v-if="!status.isUpload">
						<ButtonBasic :to="form.url" disabled> 다운로드(미구현) </ButtonBasic>
						<ButtonBasic hover="red" @click="onClickDeleteIcon"> 삭제하기 </ButtonBasic>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useModalStore, useToastStore, useNavStore } from "@store";

// navStore.unuse("gnb");
const URL_JARVIS = "https://jarvis.dn.nexoncdn.co.kr/temp";
const URL_AZURE = "https://jarviskcst.blob.core.windows.net/temp";

const TESTMODEL = reactive({
	selector1Index: -1,
	selector1Value: "",
	selector2Index: -1,
	selector2Value: -1,
	value3: "test",
	valid3: false,
});

const prefixData = {
	"": "공통",
	l: "로고",
	b: "버튼",
	test: "테스트",
	sv: "슈퍼바이브",
	wp: "프라시아 전기",
	kz: "카잔",
	tfd: "퍼스트 디센던트",
	v4: "V4",
	hit: "히트 2",
	by: "바람의나라: 연",
	dfm: "던전앤파이터 모바일",
	ba: "블루아카이브",
	gs: "환세취호전",
	dd: "던파듀얼",
};
const fillPropsMap = {
	solid: "mask",
	origin: "background",
};
const formDefault = {
	file: null,
	name: "",
	fill: "solid",
	box: 70,
	prefix: "",
	pos: [50, 50],
	url: "",
	color: "#000000",
	ext: null,
};

const ASLIST = {
	DATA: {},
};

const AS = reactive(
	Object.entries(ASLIST).reduce((p, [k, v], i) => {
		p[k] = useAsyncStatus();
		return p;
	}, {}),
);

const modalStore = useModalStore();
const toastStore = useToastStore();

const DATA = ref({});

const refineData = computed(() => {
	return (
		Object.entries(DATA.value)?.reduce((p, [key, v], idx) => {
			const isTarget = select.key === key;
			const isSelect = isTarget || select.list.includes(key);
			p[key] = {
				...v,
				key,
				isSelect,
				isTarget,
				index: idx,
			};
			return p;
		}, {}) || {}
	);
});

const dataList = computed(() => {
	return Object.values(refineData.value).map((item) => item);
});

const select = reactive({
	key: null,
	target: computed(() => {
		const item = DATA.value[select.key];
		if (item) {
			item.key = select.key;
		}

		return item || {};
	}),
	list: [],
});

const form = ref({ ...formDefault });
watchEffect(() => {
	const prefix = form.value.prefix ? `${form.value.prefix}-` : "";
	form.value.key = `${prefix}${form.value.name}`;
	console.log();
});

// [TODO] reactice.computed 제거
const formComputed = reactive({
	code: computed(() => {
		const prefix = form.value.prefix ? `${form.value.prefix}-` : "";
		const key = `${prefix}${form.value.name}`;
		return `<i class="i--${key}${status.isBoxMode ? " -box" : ""}"></i>`;
	}),
	codeSyntax: computed(() => {
		const prefix = form.value.prefix ? `${form.value.prefix}-` : "";
		const key = `${prefix}${form.value.name}`;
		return `&lt;<span class="syntax-1">i</span>&nbsp;<span class='syntax-2'>class</span>="<span class="syntax-3">i--${key}${
			status.isBoxMode ? " -box" : ""
		}</span>"&gt;&lt;/<span class="syntax-1">i</span> &gt;`;
	}),
});

const formStyle = computed(() => {
	const url = form.value.url;
	const isSolid = form.value.fill === "solid";
	const result = {};

	if (url) {
		const fillProp = fillPropsMap[form.value.fill];
		result[`${fillProp}-image`] = `url(${url})`;
		if (isSolid) {
			result.color = form.value.color;
		}
	}

	const posX = form.value.pos[0] - 50;
	const posY = form.value.pos[1] - 50;
	const transform = `scale(${form.value.box}%) translate3d(${posX}%, ${posY}%, 0)`;

	result.transform = transform;

	return result;
});

const status = reactive({
	isBoxMode: false,
	isUpload: false,
	isPurge: false,
	isGuideMode: false,
	isIconOnly: false,
	isInvertBackground: false,
	selectMode: "single",
	breadcrumb: [],
	depth: computed(() => status.breadcrumb.length + 1),
});

const openStatus = reactive({
	form: false,
});

watch(
	() => select.key,
	(now) => {
		if (!now) {
			return;
		}

		// 선택한 아이콘의 정보를 form에 복붙
		const target = select.target;
		const pos = select.target?.pos?.split(",") || formDefault.pos;

		const prefix = target.prefix ? `${target.prefix}-` : "";
		const key = `${prefix}${target.name}`;

		const url = `${URL_JARVIS}/${key}.${target.ext}`;

		form.value = {
			...select.target,
			pos,
			url,
		};

		status.isUpload = false;

		openForm();
	},
);

watch(
	() => status.selectMode,
	() => {
		select.list = [];
		select.key = null;
	},
);

const openForm = () => {
	openStatus.form = true;
};
const closeForm = () => {
	openStatus.form = false;
};

const nextDepth = (name) => {
	status.breadcrumb = [...status.breadcrumb, name];
};
const prevDepth = () => {
	status.breadcrumb = status.breadcrumb.slice(0, -1);
	status.selectMode = "single";
};

const checkBreadCrumb = (name, depth) => {
	return status.breadcrumb[depth - 2] === name;
};

const stepRouter = (step, depth) => {
	const stepMap = {
		purge: () => {
			status.selectMode = "multi";
			select.key = null;
			closeForm();
			nextDepth("purge");
		},
		complex: () => {
			nextDepth("complex");
		},
	};

	const stepAction = stepMap[step];

	if (!stepAction) {
		return;
	}

	stepAction();
};

const onClickReadyUpload = () => {
	if (openStatus.form && status.isUpload) {
		closeForm();
		return;
	}

	status.isUpload = true;
	select.key = null;
	form.value = { ...formDefault };
	openForm();
};

const onClickIconItem = (item) => {
	const mode = status.selectMode;

	if (mode === "single") {
		const isCancel = select.key === item.key;
		if (isCancel) {
			select.key = null;
			closeForm();
			return;
		}

		select.key = item.key;
	}
	if (mode === "multi") {
		const isCancel = select.list.includes(item.key);
		if (isCancel) {
			select.list = select.list.filter((key) => key !== item.key);
			return;
		}
		select.list = [...select.list, item.key];
	}
};

const onChangeFileInput = (event) => {
	const file = event.target.files[0];
	const fileExtension = file.name.split(".").pop().toLowerCase();
	const allowedType = ["image/png", "image/svg+xml"];
	const allowedExtensions = ["png", "svg"];
	const isAllowed = allowedExtensions.includes(fileExtension);
	const isSVG = fileExtension === "svg";

	try {
		if (!isAllowed) {
			event.target.value = null;
			alert("png, svg 파일만 업로드 가능합니다.");
			return;
		}

		if (file) {
			const imageUrl = URL.createObjectURL(file);
			form.value = {
				...form.value,
				url: imageUrl,
				file,
				fill: isSVG ? "solid" : "origin",
				ext: fileExtension,
			};
		} else {
			console.log("? 파일이 실패");
		}
	} catch (err) {
		console.log(err);
	}
};

const onClickUpdateIcon = () => {
	tryUpdateIcon();
};

const onClickDeleteIcon = () => {
	tryDeleteIcon();
};

const onClickCopyIconHTML = async () => {
	await useCopy(formComputed.code);
	toastStore.open({ message: `"${form.value.key}" 아이콘 코드를 복사했습니다.` });
};

const onBlurInputPercent = (number = 50, options) => {
	const model = options.model;
	const isFallback = Number.isNaN(+model.value) || model.value === "";

	console.log(model.value);
	if (!isFallback) {
		return;
	}

	console.log("fallback");
	model.value = number;
};

const callScript = () => {
	const installedScript = document.body.querySelector("script[data-callscript]");

	if (installedScript) {
		installedScript.remove();
	}

	const scriptTag = document.createElement("script");
	scriptTag.src = "https://jarviskcst.blob.core.windows.net/temp/script.js";
	scriptTag.dataset.callscript = true;
	scriptTag.dataset.rerender = true;

	document.body.appendChild(scriptTag);
};

const getData = async () => {
	AS.DATA.pending();

	try {
		const response = await API_getData();
		DATA.value = response.data;
		callScript();
		AS.DATA.success();
	} catch (error) {
		AS.DATA.failure();
	}
};

const tryDeleteIcon = () => {
	//[TODO] validate

	const confirm = modalStore.open({
		type: "confirm",
		message: `"${form.value.key}" 아이콘을 삭제 하시겠습니까?`,
	});

	confirm.on("confirm", () => {
		requestDeleteIcon();
	});
};

const requestDeleteIcon = async () => {
	const prefix = select.target.prefix ? `${select.target.prefix}-` : "";
	const name = `${prefix}${select.target.name}`;
	const response = await API_delete(name);
	if (!response.ok) {
		alert("삭제 실패");
		return;
	}
	toastStore.open(`"${form.value.key}" 아이콘이 삭제 되었습니다.`);
	getData();
	closeForm();
};

const tryUpdateIcon = () => {
	if (!confirm("[TODO] validate | 수정/업로드 확인")) {
		return;
	}
	requestUpdateIcon();
};

const requestUpdateIcon = async () => {
	const response = await API_update(form.value);
	if (!response.ok) {
		alert("업데이트 실패");
		return;
	}

	toastStore.open(`"${form.value.key}" 아이콘이 업데이트 되었습니다.`);

	getData();
	// closeForm();
};

const tryPurgeIcon = () => {
	// console.log();

	if (!confirm(select.list + "퍼지 하시겠습니까?")) {
		return;
	}

	requestPurgeIcon();
};

const requestPurgeIcon = async () => {
	const list = select.list.map((key) => {
		const item = refineData.value[key];
		return `${item.key}.${item.ext}`;
	});

	const wait = modalStore.open({ type: "wait" });
	const response = await API_purge(list);
	wait.close();

	if (!response.ok) {
		alert("퍼지 실패");
		return;
	}

	alert("퍼지 성공");
	select.list = [];
};

const API_getData = async () => {
	try {
		const response = await $fetch("/api/data");
		return { ...response, ok: true };
	} catch (error) {
		return { ...response, ok: false };
	}
};

const API_update = async (data) => {
	const formData = new FormData();

	if (data.file) {
		formData.append("file", data.file);
	}
	formData.append("name", data.name);
	formData.append("fill", data.fill);
	formData.append("box", data.box);
	formData.append("color", data.color);
	formData.append("pos", data.pos);
	formData.append("prefix", data.prefix);
	formData.append("ext", data.ext);

	try {
		const response = await $fetch("/api/update", {
			method: "POST",
			body: formData,
		});

		return { ...response, ok: true };
	} catch (error) {
		return { error, ok: false };
	}
};

const API_delete = async (key) => {
	const body = { key };

	try {
		const response = await $fetch("/api/delete", {
			method: "DELETE",
			body,
		});
		return { ...response, ok: true };
	} catch (error) {
		return { error, ok: false };
	}
};

const API_purge = async (list = []) => {
	const filelist = ["script.js", ...list];
	const body = filelist.map((item) => `${URL_JARVIS}/${item}`);
	try {
		const response = await $fetch("https://jarvis.nexon.com/api/common/cdn-purge-invalidate", {
			method: "POST",
			body,
		});
		return { ...response, ok: true };
	} catch (error) {
		return { error, ok: false };
	}
};

onMounted(() => {
	getData();
});

const TESTACTION = () => {};

const onClickBackDepth = () => {
	prevDepth();
};
</script>
<style lang="scss" scoped src="./index.scss"></style>
