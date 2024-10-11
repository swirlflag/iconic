<template>
	<div>
		<div class="testdiv">
			<div>select: {{ select }}</div>
		</div>
		<div class="testdiv">
			<h1 class="testh1">리스트 조회</h1>
			<button class="testbtn" @click="getData">조회</button>

			<div class="testdiv">
				<ul class="iconlist">
					<template v-for="(item, idx) in renderData">
						<li :class="{ '-selected': select.index === idx }" @click="() => onClickSelectIcon(idx)">
							<img class="icon" :src="`https://jarviskcst.blob.core.windows.net/temp/${item.filename}`" />
						</li>
					</template>
				</ul>
			</div>
		</div>

		<div class="testdiv">
			<h1 class="testh1">신규업로드</h1>
			<div>
				<input type="file" @change="onFileChange" />
				<input type="text" class="testinput" placeholder="아이콘 이름을 입력 영문" v-model="uploadForm.name" />
			</div>
			<div v-if="uploadForm.file">
				미리보기
				<img class="upload-ready" :src="uploadForm.file?.imageUrl" alt="이미지를 선택하세요" />
			</div>
			<button class="testbtn" @click="upload">업로드</button>
		</div>

		<div class="testdiv">
			<h1 class="testh1">수정</h1>
			<div>
				<img class="update-ready" :src="select?.target?.src" alt="조회후 이미지를 선택하세요" />
			</div>
		</div>
		<div class="testdiv">
			<h1 class="testh1">삭제</h1>
			<div>
				<img class="update-ready" :src="select?.target?.src" alt="조회후 이미지를 선택하세요" />
			</div>
			{{ select?.target }}
			<button class="testbtn" @click="onClickDelete">삭제하기</button>
		</div>
	</div>
</template>

<script setup>
const DATA = ref({});

const select = reactive({
	index: -1,
	target: computed(() => {
		return renderData.value[select.index] || null;
	}),
});

const updateForm = reactive({});

const uploadForm = reactive({
	file: null,
	name: "",
	defaultColor: "#000000",
	defaultSize: 24,
	minSize: 5,
	description: "",
	tags: [],
	fillType: "solid", // "solid", "fix", "gradient"
});

const renderData = computed(() => {
	return Object.entries(DATA.value).map(([k, v]) => {
		const src = `https://jarviskcst.blob.core.windows.net/temp/${v.filename}`;
		return {
			name: k,
			...v,
			src,
		};
	});
});

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

const gotest = async () => {
	const formData = new FormData();
	formData.append("file", uploadForm.file);
	formData.append("name", uploadForm.name);

	const response = await $fetch("/api/test2", {
		method: "POST",
		body: formData,
	});

	DATA.value = response.data;
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

const upload = async () => {
	if (uploadForm.name === "") {
		alert("아이콘 이름을 입력해주세요");
		return;
	}

	if (!uploadForm.file) {
		alert("파일을 선택해주세요");
		return;
	}

	const formData = new FormData();
	formData.append("file", uploadForm.file);
	console.log(uploadForm.name);
	formData.append("name", uploadForm.name);

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

const onClickDelete = async () => {
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
	} catch (error) {
		alert("조회 실패");
	}
};

const install = () => {};
onMounted(() => {
	install();
});
</script>

<style lang="scss" src="./style/reset.css"></style>
<style lang="scss" src="./style/test.scss"></style>

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
		&.-selected {
			border: 5px solid red;
		}
		img {
			width: 50px;
			height: 50px;
			box-sizing: border-box;
			vertical-align: top;
		}
	}
}
</style>
