<template>
	<div class="page--main">
		<div class="testdiv">
			<h1 class="testh1">Tests</h1>
			<div class="testdiv">
				현재 참조 모드: {{ viewAzure ? "Azure" : "JARVIS" }}
				<br />
				- Azure Mode: 변경 사항이 있을경우 현재 화면에 즉시 반영되지만 실제 사용처에서는 느리게 반영됩니다. 또한
				실제 사용방식인 i태그가 아니라 img로 렌더링 되며 설정 색상이 반영되어 보이지 않습니다.
				<br />
				- JARVIS Mode: 실제 사용처에 반영되는 형식으로 렌더하지만 변경사항이 즉시 반영되지 않습니다. nexon.com
				도메인이 아니면 호출되지 않습니다
				<br />
				(자동 반영 주기: 약 1시간)
				<button class="testbtn" @click="viewAzure = !viewAzure">참조 모드 변경하기</button>
			</div>
			<div class="testdiv">
				박스 모드: {{ status.isBoxMode ? "ON" : "OFF" }}
				<br />
				- 아이콘 크기에 스케일을 적용합니다.
				<button class="testbtn" @click="status.isBoxMode = !status.isBoxMode">박스모드 토글</button>
			</div>
			<div class="testdiv">
				가이드 라인 표시: {{ status.isGuideline ? "ON" : "OFF" }}
				<br />
				<button class="testbtn" @click="status.isGuideline = !status.isGuideline">가이드 라인 토글</button>
			</div>
			<div class="testdiv">
				컬러 변경 테스트
				<br />
			</div>
		</div>

		<div class="testdiv">
			<h1 class="testh1">리스트</h1>
			<div>
				{{ DATA }}
			</div>
			<button class="testbtn" @click="getData">조회하기</button>

			<div class="testdiv">
				<ul class="iconlist">
					<template v-for="(item, idx) in renderList">
						<li :class="{ '-selected': select.index === idx }" @click="() => onClickSelectIcon(idx)">
							<div class="_item">
								<div class="_icon" :class="{ '-iconguide': status.isGuideline }">
									<template v-if="viewAzure">
										<img
											class="icon"
											:src="`https://jarviskcst.blob.core.windows.net/temp/${item.name}.${item.ext}`"
											:style="item.img_style"
										/>
									</template>
									<template v-else>
										<i
											:class="{ [`i--${item.key}`]: true, '-box': item.isBox }"
											:style="item.i_style"
										>
										</i>
									</template>
								</div>

								<span class="_name"> {{ item.name }} </span>
							</div>
						</li>
					</template>
				</ul>
			</div>
			select.form : {{ select.form }}
			<div class="testdiv" v-if="select.form?.name">
				선택된 아이콘 정보
				<br />
				icon name: {{ select.form.name }}
				<br />

				prefix type: {{ prefixData[select.form.prefix] }}
				<br />
				fill:
				<select v-model="select.form.fill">
					<option value="solid">solid (단색)</option>
					<option value="origin">origin (파일의 원본 고정색 )</option>
				</select>
				<br />
				<div>box size: <input type="range" v-model="select.form.box" /> {{ select.form.box }}%</div>

				<div>
					pos x:
					<input type="range" v-model="select.form.pos[0]" />
					{{ select.form.pos[0] }}%
				</div>
				<div>
					pos y:
					<input type="range" v-model="select.form.pos[1]" />
					{{ select.form.pos[1] }}%
				</div>

				<div>
					<div>
						deafult color:
						<!-- <input type="range" /> -->
						<div>
							<div :style="{ backgroundColor: select.form.color, width: '30px', height: '30px' }"></div>
							<input
								type="text"
								class="testinput"
								placeholder="아이콘 기본색상"
								v-model="select.form.color"
							/>
						</div>
					</div>
				</div>

				<div>
					<button class="testbtn" @click="API_update">수정하기</button>
					<button class="testbtn" @click="API_delete">삭제하기</button>
				</div>
			</div>
		</div>

		<div class="testdiv">
			<h1 class="testh1">신규업로드</h1>

			<div>
				<div class="upload-ready" v-if="uploadForm.file" :class="{ '-iconguide': status.isGuideline }">
					<i :style="uploadForm.style"> </i>
				</div>

				<br />
				file select: <input type="file" @change="onFileChange" />
				<br />
				{{ uploadForm.file?.filename }}
			</div>

			<div>
				prefix Type:
				<select v-model="uploadForm.prefix">
					<template v-for="[k, v] in Object.entries(prefixData)">
						<option :value="k">{{ v }}</option>
					</template>
				</select>
			</div>

			<div>
				name:
				<input type="text" class="testinput" placeholder="아이콘 이름(영문)" v-model="uploadForm.name" />
			</div>

			<div>
				사용 코드 미리보기: <code> &lt;i class="i--{{ uploadForm.refineName }}"&gt;&lt;/i&gt;</code>
			</div>

			<div>
				채우기 타입:
				<select v-model="uploadForm.fill" :disabled="isBlobPng">
					<option value="solid">solid (단색)</option>
					<option value="origin">origin (파일의 고정색)</option>
				</select>
				<br />
				<template v-if="isBlobPng"> (png파일은 'origin' 타입으로 고정됩니다) </template>
			</div>
			<div>
				deafult color:

				<div>
					<div :style="{ backgroundColor: uploadForm.color, width: '30px', height: '30px' }"></div>
					<input type="text" class="testinput" placeholder="아이콘 기본색상" v-model="uploadForm.color" />
				</div>
			</div>

			<div>
				box size:
				<input type="range" v-model="uploadForm.box" />
				{{ uploadForm.box }}%
			</div>

			<div>
				pos x:
				<input type="range" v-model="uploadForm.pos[0]" />
				{{ uploadForm.pos[0] }}%
			</div>
			<div>
				pos y:
				<input type="range" v-model="uploadForm.pos[1]" />
				{{ uploadForm.pos[1] }}%
			</div>

			<button class="testbtn" @click="API_upload">업로드</button>
		</div>
		<div class="testdiv">
			<button class="testbtn" @click="API_purge">퍼지 미완성</button>
			<button class="testbtn" @click="API_reset">리셋</button>
		</div>
	</div>
</template>

<script setup>
const prefixData = {
	"": "Common",
	l: "로고",
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

const DATA = ref({});
const viewAzure = ref(false);
const status = reactive({
	isBoxMode: false,
	isGuideline: false,
});

const getUrl = (file) => {
	return viewAzure.value
		? `https://jarviskcst.blob.core.windows.net/temp/${file}`
		: `https://jarvis.dn.nexoncdn.co.kr/temp/${file}`;
};

const select = reactive({
	index: -1,
	target: computed(() => {
		return renderList.value[select.index] || null;
	}),
	form: {},
});

const uploadForm = reactive({
	file: null,
	name: "",
	color: "#000",
	memo: "",
	// tags: [],
	fill: "solid",
	box: 70,
	prefix: "",
	pos: [50, 50],
	refineName: computed(() => {
		let result = "";
		if (uploadForm.prefix !== "") {
			result += uploadForm.prefix + "-";
		}
		result += uploadForm.name;
		return result;
	}),
	style: computed(() => {
		const fillProps = fillPropsMap[uploadForm.fill];

		let color = "transparent";
		let scale = uploadForm.box;
		let positionX = 50 - uploadForm.pos[0];
		let positionY = 50 - uploadForm.pos[1];
		if (uploadForm.fill === "solid") {
			color = uploadForm.color;
		}

		const transformValue = `scale(${scale}%) translate3d(${positionX}%, ${positionY}%,0)`;
		const transform = status.isBoxMode ? transformValue : "";

		return {
			color,
			transform,
			[`${fillProps}-image`]: `url(${uploadForm.file.imageUrl})`,
		};
	}),
});

const isBlobPng = computed(() => {
	return uploadForm.file?.type === "image/png";
});

const renderList = computed(() => {
	console.log(DATA.value);
	return Object.entries(DATA.value).map(([k, v], idx) => {
		const isSelect = select.index === idx;

		const src = `https://jarviskcst.blob.core.windows.net/temp/${v.filename}`;
		const isSolid = v.fill === "solid";

		const i_style = {};
		const img_style = {};

		const fillProps = fillPropsMap[v.fill];
		// i_style[fillProps] = `url(${getUrl(v.filename)})`;

		const boxSize = status.isBoxMode ? v.box : 100;
		const [posX, posY] = v.pos.split(",");

		// i_style["background-size"] = `${boxSize}% ${boxSize}%`;
		// i_style["mask-size"] = `${boxSize}% ${boxSize}%`;

		if (status.isBoxMode) {
			img_style.transform = `scale(${boxSize}%) translate(${posX - 50}%, ${posY - 50}%)`;
		}

		if (isSelect) {
			if (isSolid) {
				i_style.color = select["form"].color;
			} else {
				i_style.color = "transparent";
			}
			if (status.isBoxMode) {
				const [posX2, posY2] = select?.["form"]?.pos || [50, 50];
				const transform = `scale(${select["form"].box}%) translate(${posX2 - 50}%, ${posY2 - 50}%)`;
				i_style.transform = transform;
				img_style.transform = transform;
			}
		}

		const isBox = status.isBoxMode && !isSelect;

		return {
			key: k,
			name: k,
			...v,
			// src,
			i_style,
			img_style,
			isBox,
		};
	});
});

const callScript = () => {
	console.log("call script");
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

watch(
	() => select.index,
	() => {
		const target = select.target;

		const pos = target?.pos.split(",") || [50, 50];
		select.form = {
			...select.target,
			pos,
		};
	},
);

const onClickSelectIcon = (index) => {
	if (index === select.index) {
		select.index = -1;
	} else {
		select.index = index;
	}
};

const getData = async () => {
	try {
		const response = await $fetch("/api/data", {
			method: "GET",
		});
		// alert("조회 완료");

		DATA.value = response.data;
		callScript();
	} catch (error) {
		alert("조회 실패");
	}
};

const onFileChange = (event) => {
	const file = event.target.files[0];

	const fileExtension = file.name.split(".").pop().toLowerCase();
	const allowedType = ["image/png", "image/svg+xml"];
	const allowedExtensions = ["png", "svg"];
	// const isAllowed = allowedType.includes(file.type);
	const isAllowed = allowedExtensions.includes(fileExtension);

	if (!isAllowed) {
		event.target.value = null;
		alert("png, svg 파일만 업로드 가능합니다.");
		return;
	}

	if (file) {
		const imageUrl = URL.createObjectURL(file);
		file.imageUrl = imageUrl;
		uploadForm.file = file;
		const isPng = fileExtension === "png";
		if (isPng) {
			uploadForm.fill = "origin";
		} else {
			uploadForm.fill = "solid";
		}
	} else {
		console.log("? 파일이 실패");
	}
};

const API_upload = async () => {
	if (uploadForm.name === "") {
		alert("아이콘 이름을 입력해주세요");
		return;
	}

	if (!uploadForm.file) {
		alert("파일을 선택해주세요");
		return;
	}

	if (!confirm(`${uploadForm.refineName} 아이콘을 업로드 하시겠습니까?`)) {
		return;
	}

	const formData = new FormData();
	formData.append("file", uploadForm.file);
	formData.append("name", uploadForm.refineName);
	formData.append("box", uploadForm.box);
	formData.append("color", uploadForm.color);
	formData.append("prefix", uploadForm.prefix);
	formData.append("memo", uploadForm.memo);
	formData.append("fill", uploadForm.fill);
	formData.append("pos", uploadForm.pos);

	try {
		// 서버에 파일 업로드 요청
		const response = await $fetch("/api/update", {
			method: "POST",
			body: formData,
		});

		alert("파일이 성공적으로 업로드되었습니다.");

		DATA.value = response.data;

		callScript();
	} catch (error) {
		console.error("업로드 실패:", error);
		alert("파일 업로드에 실패했습니다.");
	}
};

const API_update = async () => {
	const formData = new FormData();
	formData.append("file", select.form.file);
	formData.append("name", select.form.name);
	formData.append("fill", select.form.fill);
	formData.append("box", select.form.box);
	formData.append("color", select.form.color);
	formData.append("pos", select.form.pos);

	try {
		// 서버에 파일 업로드 요청
		const response = await $fetch("/api/update", {
			method: "POST",
			body: formData,
		});

		alert("파일이 성공적으로 업로드되었습니다.");

		DATA.value = response.data;
		callScript();
	} catch (error) {
		console.error("업로드 실패:", error);
		alert("파일 업로드에 실패했습니다.");
	}
};

const API_delete = async () => {
	const body = {
		name: select.target.name,
	};

	try {
		const response = await $fetch("/api/delete", {
			method: "DELETE",
			body,
		});
		console.log(response);

		DATA.value = response.data;
		alert("삭제되었습니다");
	} catch (error) {
		alert("조회 실패");
	}
};

const API_purge = async () => {
	const filelist = ["script.js"];

	const body = filelist.map((item) => {
		return `https://jarvis.dn.nexoncdn.co.kr/temp/${item}`;
	});

	const response = await $fetch("https://jarvis.nexon.com/api/common/cdn-purge-invalidate", {
		method: "POST",
		// headers: {
		// 	"x-jarvis-api-key": "jarvis_wp",
		// 	Authorization: `Bearer 46C559EC-6EBC-4A6B-943E-32F0E562CEA0`,
		// },
		body,
	});

	console.log(response);
};

const API_reset = async () => {
	if (!confirm("ㄹㅇ?")) {
		return;
	}

	const response = await $fetch("/api/reset", {
		method: "POST",
	});

	DATA.value = {};
	console.log(response);
};

const testaction = () => {
	API_purge();
};

onMounted(() => {
	getData();
});
</script>

<style lang="scss" scoped>
img {
	box-sizing: border-box;
}
.upload-ready {
	border: 5px solid #11f;
	width: 140px;
	height: 140px;
	box-sizing: border-box;
	position: relative;
	i {
		width: 100%;
		height: 100%;
		display: inline-flex;
		box-sizing: border-box;
		object-fit: contain;
		position: relative;
		color: inherit;
		display: inline-flex;
		box-sizing: border-box;
		background-color: currentColor;
		background-size: 100% 100%;
		background-repeat: no-repeat;
		background-size: contain;
		fill: currentColor;
		background-position: center center;
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
		mask-position: center center;
		-webkit-mask-position: center center;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
	}
}

.update-ready {
	width: 100px;
	height: 100px;
	border: 5px solid red;
	display: inline-flex;
	box-sizing: border-box;
}
.iconlist {
	display: flex;
	flex-wrap: wrap;
	li {
		border: 1px solid #000;
		display: inline-flex;
		cursor: pointer;
		box-sizing: border-box;
		&.-selected {
			border: 2px solid red;
		}

		._item {
			display: inline-flex;
			flex-direction: column;
			align-items: center;
			width: 100px;

			._icon {
				position: relative;
				width: 100px;
				height: 100px;
				display: inline-flex;
				justify-content: center;
				align-items: center;
				flex: 0 0 auto;

				i {
					width: 100%;
					height: 100%;
					display: inline-flex;
				}
				img {
					width: 100%;
					height: 100%;
					display: inline-flex;
					object-fit: contain;
					object-position: center;
				}
			}
			._name {
				font-size: 14px;
				border-top: 1px solid #000;
				word-break: break-all;
				padding: 5px;
				display: inline-block;
				box-sizing: border-box;
				text-align: center;

				width: 100%;
			}
		}
	}
}

.-iconguide {
	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none"><g opacity="1.0"><circle cx="13" cy="13" r="9.95" stroke="black" stroke-width="0.1"/><rect x="3.05" y="5.05" width="19.9" height="15.9" rx="0.95" stroke="black" stroke-width="0.1"/><rect x="20.95" y="3.05" width="19.9" height="15.9" rx="0.95" transform="rotate(90 20.95 3.05)" stroke="black" stroke-width="0.1"/><rect x="21.95" y="4.05" width="17.9" height="17.9" rx="0.95" transform="rotate(90 21.95 4.05)" stroke="black" stroke-width="0.1"/><path d="M25 1L1 25M1 1L25 25" stroke="black" stroke-width="0.1"/></g></svg>');
		background-size: 100% 100%;
		background-repeat: no-repeat;
		background-position: center;
		// mix-blend-mode: overlay;
		z-index: 3;
		// background-color: #fff;
	}
}
</style>
