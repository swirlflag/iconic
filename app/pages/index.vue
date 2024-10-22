<template>
	<div class="page--main">
		<div class="controls" :class="`depth--${status.depth}`">
			<div class="_depth _d1">
				<h1 class="project-name">Icon in center</h1>

				<div class="_block">
					<div class="title-1">TESTTTT area</div>
					<div>
						<button class="testbtn" @click="TESTACTION">TESTACTION</button>
					</div>
					<div>DATA: <br />{{ DATA }}</div>
					<br />
					<div>refineData: <br />{{ refineData }}</div>
					<br />
					<div>form: <br />{{ form }}</div>
					<br />
					<div>status:<br />{{ status }}</div>
					<br />
					<div>select:{{ select }}</div>
					<br />
					<div>openStatus:{{ openStatus }}</div>

					<div>
						box:
						<InputToggle v-model="status.isBoxMode" />
					</div>
					<div>
						guide:
						<InputToggle v-model="status.isGuideMode" />
					</div>
					<div>
						icon only
						<InputToggle v-model="status.isIconOnly" />
					</div>
					<div>
						invert background
						<InputToggle v-model="status.isInvertBackground" />
					</div>
				</div>
				<div class="box-y _block">
					<div class="title-1">복잡한 기능</div>
					<div class="description">더 복잡한 옵션을 확인합니다.</div>
					<button class="button--basic" @click="() => stepRouter('complex')">확인</button>
				</div>
				<div class="box-y _block">
					<div class="title-1">View</div>
					<div class="description">아이콘 리스트 조회 화면을 편집 합니다.</div>
					<div class="title-2">검색</div>
					<div class="description">아이콘 정보를 검색합니다.</div>
					<div class="box-x">
						<input type="text" class="testinput" />
					</div>
					<div class="title-2">필터</div>
					<div class="description">prefix 이름으로 필터링 합니다</div>
					<div class="title-2">정렬</div>
					<div class="description">prefix 이름으로 정렬 합니다</div>
				</div>

				<div class="_bottom-marker"></div>
				<div class="box-y _block">
					<div class="title-1">Upload</div>
					<div class="description">새로운 아이콘을 업로드 합니다.</div>
					<div class="box-x">
						<button class="button--basic" @click="onClickReadyUpload">신규 업로드</button>
					</div>
				</div>
				<div class="box-y _block">
					<div class="title-1">Purge</div>
					<div class="description">선택한 아이콘들을 퍼지합니다.</div>
					<div class="box-x">
						<button class="button--basic" @click="() => stepRouter('purge')">퍼지 선택</button>
					</div>
				</div>
			</div>

			<TransitionGroup>
				<div class="_depth _d2" v-if="checkBreadCrumb('purge', 2)">
					<div class="_block box-y">
						<div class="title-0">Purge</div>
						<div class="description">퍼지가 필요한 아이콘들을 선택 후 퍼지를 진행해 주세요.</div>
					</div>
					<div class="_block box-y">
						<div class="title-1">선택된 리스트</div>
						<div>
							{{ select.list }}
						</div>
					</div>
					<div class="_block box-y">
						<button
							class="button--basic"
							:class="{ '-disabled': !select.list?.length }"
							@click="tryPurgeIcon"
						>
							PURGE !
						</button>
					</div>
					<div class="_bottom-marker"></div>
					<div class="_block">
						<button class="button--basic" @click="onClickBackDepth">BACK</button>
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
					<div class="_block">
						<button class="button--basic" @click="onClickBackDepth">BACK</button>
					</div>
				</div>
			</TransitionGroup>
		</div>

		<div class="gallery">
			<div class="gallery-wrap">
				{{ formStyle }}
				<br />
				{{ status }}
				<ASC :AS="AS.DATA" initial="pending">
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
				<div class="title-1">
					<template v-if="status.isUpload">신규 업로드</template>
					<template v-else>업데이트</template>
				</div>
				<div class="testdiv">form : {{ form }}</div>
				<div class="testdiv">formComputed: {{ formComputed }}</div>
				<div class="testdiv">formStyle: {{ formStyle }}</div>

				<div class="testdiv">
					<ClientOnly>
						<template v-if="status.isUpload">
							<div>
								name:
								<input type="text" class="testinput" v-model="form.name" />
							</div>
							<div>
								prefix:
								<select v-model="form.prefix">
									<template v-for="[k, v] in Object.entries(prefixData)">
										<option :value="k">{{ v }}</option>
									</template>
								</select>
							</div>
							<div>
								fill:
								<select v-model="form.fill">
									<template v-for="key in Object.keys(fillPropsMap)">
										<option :value="key">{{ key }}</option>
									</template>
								</select>
							</div>
						</template>
						<br />

						<div>
							사용 코드 미리보기:
							<code> {{ formComputed.code }}</code>
						</div>
						<div>box size: <input type="range" v-model="form.box" /> {{ form.box }}%</div>

						<div>pos x: <input type="range" v-model="form.pos[0]" /> {{ form.pos[0] }}%</div>

						<div>pos y: <input type="range" v-model="form.pos[1]" /> {{ form.pos[1] }}%</div>

						<div>color: <input type="color" v-model="form.color" /> {{ form.color }}</div>
					</ClientOnly>
				</div>
				<div class="box-x">
					<div
						class="_icon"
						:class="{
							'-guideline': status.isGuideMode,
							'-display': form.url,
							'-invert-bg': status.isInvertBackground,
						}"
					>
						<div class="_file-select" v-if="status.isUpload">
							<button class="button--basic">
								<input type="file" @change="onChangeFileInput" />
								파일 선택
							</button>
						</div>

						<i class="form-icon" :class="{ '-box': status.isBoxMode }">
							<span :style="formStyle"></span>
						</i>
					</div>
					<div class="box-y">
						<button class="button--basic" @click="onClickUpdateIcon">
							{{ status.isUpload ? "업로드" : "수정하기" }}
						</button>
						<template v-if="!status.isUpload">
							<NuxtLink class="button--basic" :to="form.url" download target="_blank">
								다운로드(미구현)
							</NuxtLink>
							<button class="button--basic hover--red" @click="onClickDeleteIcon">삭제하기</button>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useModalStore, useToastStore } from "@store";
const URL_JARVIS = "https://jarvis.dn.nexoncdn.co.kr/temp";
const URL_AZURE = "https://jarviskcst.blob.core.windows.net/temp";

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
	color: "#000",
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
const formComputed = reactive({
	code: computed(() => {
		const prefix = form.value.prefix ? `${form.value.prefix}-` : "";
		const key = `${prefix}${form.value.name}`;
		return `<i class="i--${key}${status.isBoxMode ? " -box" : ""}"></i>`;
	}),
});

const formStyle = computed(() => {
	const url = form.value.url;
	const isSolid = form.value.fill === "solid";
	const result = {};

	if (url) {
		const fillProp = fillPropsMap[form.value.fill];
		// console.log(fillProp);
		result[`${fillProp}-image`] = `url(${url})`;
		// result[`mask-image`] = `url(${url})`;
		if (isSolid) {
			result.color = form.value.color;
		}
	}

	// result.

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
	if (!confirm("진짜 삭제 하시겠습니까??")) {
		return;
	}
	requestDeleteIcon();
};
const requestDeleteIcon = async () => {
	const prefix = select.target.prefix ? `${select.target.prefix}-` : "";
	const name = `${prefix}${select.target.name}`;
	const response = await API_delete(name);
	if (!response.ok) {
		alert("삭제 실패");
		return;
	}
	getData();
	closeForm();
};

const tryUpdateIcon = () => {
	//[TODO] validate
	if (!confirm("수정/업로드 확인")) {
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

	getData();
	closeForm();
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
