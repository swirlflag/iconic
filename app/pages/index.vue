<template>
	<div>
		<div class="testdiv">
			<h1 class="testh1">Tests</h1>
			<div class="testdiv">
				현재 참조 모드: {{ viewAzure ? "Azure" : "JARVIS" }}
				<br />
				- Azure Mode: 변경 사항이 있을경우 현재 화면에 즉시 반영되지만 실제 사용처에서는 느리게 반영됩니다. 또한
				실제 사용방식인 i태그가 아니라 img로 렌더링 됩니다.
				<br />
				- JARVIS Mode: 실제 사용처에 반영되는 형식으로 렌더하지만 변경사항이 즉시 반영되지 않습니다.
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
											:src="`https://jarviskcst.blob.core.windows.net/temp/${item.filename}`"
											:style="item.img_style"
										/>
									</template>
									<template v-else>
										<i
											:class="{ [`i--${item.name}`]: true, '-box': status.isBoxMode }"
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
				name: {{ select.form.name }}
				<br />
				fillType: {{ select.form.fillType }}
				<br />
				<div>box size: <input type="range" v-model="select.form.boxSize" /> {{ select.form.boxSize }}%</div>

				<div>
					<button class="testbtn" @click="API_update">수정하기</button>
					<button class="testbtn" @click="API_delete">삭제하기</button>
				</div>
			</div>
		</div>

		<div class="testdiv">
			<h1 class="testh1">신규업로드</h1>
			<div>
				<img
					v-if="uploadForm.file"
					class="upload-ready"
					:src="uploadForm.file?.imageUrl"
					alt="이미지를 선택하세요"
				/>
				<br />
				file select: <input type="file" @change="onFileChange" />
			</div>

			<div>
				fill type:
				<select v-model="uploadForm.fillType">
					<option value="solid">solid (단색)</option>
					<option value="solid">fix (파일의 고정색)</option>
				</select>
			</div>

			<div>
				box size:
				<input type="range" v-model="uploadForm.boxSize" />
				{{ uploadForm.boxSize }}%
			</div>

			<div>
				prefix:
				<select v-model="uploadForm.prefix">
					<option value="">common</option>
					<option value="l">logo</option>
					<option value="sv">SUPERVIVE</option>
					<option value="kz">kazhan</option>
					<option value="etc">기타</option>
					<option value="test">테스트</option>
				</select>
			</div>

			<div>
				name:
				<input type="text" class="testinput" placeholder="아이콘 이름(영문)" v-model="uploadForm.name" />

				{{ uploadForm.refineName }}
			</div>

			<div>
				deafult color:
				<!-- <input type="range" /> -->
				(미구현)
			</div>

			<button class="testbtn" @click="API_upload">업로드</button>
		</div>
	</div>
</template>

<script setup>
const DATA = ref({});

const viewAzure = ref(false);

const status = reactive({
	isBoxMode: false,
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
	defaultColor: "#000000",
	defaultSize: 24,
	minSize: 5,
	description: "",
	tags: [],
	fillType: "solid", // "solid", "fix", "gradient"
	boxSize: 66,
	prefix: "",
	refineName: computed(() => {
		let result = "";
		if (uploadForm.prefix !== "") {
			result += uploadForm.prefix + "-";
		}
		result += uploadForm.name;
		return result;
	}),
});

const fillPropsMap = {
	solid: "mask-image",
	fix: "background-image",
	gradient: "background-image",
};

const renderList = computed(() => {
	return Object.entries(DATA.value).map(([k, v], idx) => {
		const isSelect = select.index === idx;

		const src = `https://jarviskcst.blob.core.windows.net/temp/${v.filename}`;
		const isSolid = v.fillType === "solid";

		const i_style = {};
		const img_style = {};

		const fillProps = fillPropsMap[v.fillType];
		i_style[fillProps] = `url(${getUrl(v.filename)})`;

		if (isSolid) {
			i_style.backgroundColor = v.defaultColor;
		}

		const boxSize = status.isBoxMode ? v.boxSize : 100;
		i_style["background-size"] = `${boxSize}% ${boxSize}%`;
		i_style["mask-size"] = `${boxSize}% ${boxSize}%`;
		img_style.transform = `scale(${boxSize}%)`;

		if (isSelect) {
			if (status.isBoxMode) {
				const bs = select["form"].boxSize;
				i_style["background-size"] = `${bs}% ${bs}%`;
				i_style["mask-size"] = `${bs}% ${bs}%`;
				img_style.transform = `scale(${bs}%)`;
			}
		}

		return {
			name: k,
			...v,
			src,
			i_style,
			img_style,
		};
	});
});

watch(
	() => select.index,
	() => {
		select.form = {
			...select.target,
		};
	},
);

// const onClick = async () => {
// 	const response = await $fetch("/api/test", {
// 		method: "GET",
// 	});
// 	console.log(response);
// };

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
	} catch (error) {
		alert("조회 실패");
	}
};

const onFileChange = (event) => {
	const file = event.target.files[0];
	if (file) {
		const imageUrl = URL.createObjectURL(file);
		file.imageUrl = imageUrl;
		uploadForm.file = file;
		console.log(file);
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
	formData.append("fillType", uploadForm.fillType);
	formData.append("boxSize", uploadForm.boxSize);
	formData.append("defaultColor", uploadForm.defaultColor);
	formData.append("prefix", uploadForm.prefix);

	try {
		// 서버에 파일 업로드 요청
		const response = await $fetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		alert("파일이 성공적으로 업로드되었습니다.");

		DATA.value = response.data;
	} catch (error) {
		console.error("업로드 실패:", error);
		alert("파일 업로드에 실패했습니다.");
	}
};

const API_update = async () => {
	const formData = new FormData();
	formData.append("file", select.form.file);
	formData.append("name", select.form.name);
	formData.append("fillType", select.form.fillType);
	formData.append("boxSize", select.form.boxSize);
	formData.append("defaultColor", select.form.defaultColor);

	try {
		// 서버에 파일 업로드 요청
		const response = await $fetch("/api/update", {
			method: "POST",
			body: formData,
		});

		alert("파일이 성공적으로 업로드되었습니다.");

		DATA.value = response.data;
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

const install = () => {};
onMounted(() => {
	install();
});
</script>

<style lang="scss" scoped>
img {
	box-sizing: border-box;
}
.upload-ready {
	width: 100px;
	height: 100px;
	border: 5px solid blue;
	display: inline-flex;
	box-sizing: border-box;
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
				// display: inline-flex;
				display: inline-block;
				box-sizing: border-box;
				text-align: center;

				width: 100%;
			}
		}
	}
}

.-iconguide {
	// background-color: #fff;
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

<style lang="scss" scoped>
i[class^="i--"] {
	background-color: rgba(0, 0, 0, 0.3);
	display: inline-flex;
	vertical-align: top;
	flex: 0 0 auto;
	box-sizing: border-box;
	fill: currentColor;
	background-size: 100% 100%;
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center center;
	mask-size: 100% 100%;
	-webkit-mask-size: 100% 100%;
	mask-position: center center;
	-webkit-mask-position: center center;
	mask-repeat: no-repeat;
	-webkit-mask-repeat: no-repeat;
	min-width: 5px;
	min-height: 5px;
}
i[class^="i--"].-box {
	aspect-ratio: 1 / 1;
}
</style>
