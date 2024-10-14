<template>
	<div class="test">
		<i class="i--aim"> </i>
		<i class="i--external"> </i>

		<i class="i--copy"> </i>
		<!-- <img src="https://jarvis.dn.nexoncdn.co.kr/temp/aim.svg" /> -->

		<!-- <i class="i--cake"> </i>
		<i class="i--chzzk"> </i> -->
		<!-- <i class="i--cake"> </i>
		<div class="wpimg"></div>
		<img src="https://jarviskcst.blob.core.windows.net/temp/cake.svg" />
		<img src="https://jarviskcst.blob.core.windows.net/temp2/icon_user.svg" /> -->
		<ClientOnly>
			{{ getUrl("script.js") }}
		</ClientOnly>
	</div>
</template>
<script setup>
const isAzure = true;
const getUrl = (file) => {
	return isAzure
		? `https://jarviskcst.blob.core.windows.net/temp/${file}`
		: `https://jarvis.dn.nexoncdn.co.kr/temp/${file}`;
};

useHead({
	script: [
		{
			src: getUrl("script.js"),
		},
	],
});

const oneScript = () => {
	const isInstallStyle = document.head.querySelector("[data-iconic]");

	if (isInstallStyle) {
		return;
	}

	const TEMPICONDATA = {
		aim: {
			name: "aim",
			fileExtention: "svg",
			filename: "aim.svg",
			fillType: "solid",
			boxSize: 91,
			defaultColor: "#000",
		},
		arrow: {
			name: "arrow",
			fileExtention: "svg",
			filename: "arrow.svg",
			fillType: "solid",
			defaultColor: "#000",
		},
		cake: {
			name: "cake",
			fileExtentiosn: "svg",
			filename: "cake.svg",
			fillType: "fix",
			defaultColor: "#000",
		},
	};

	const renderList = Object.values(TEMPICONDATA);

	const fillPropsMap = {
		solid: "mask-image",
		fix: "background-image",
		gradient: "background-image",
	};

	const styleTagText = `
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
		${renderList
			.map((item) => {
				console.log(item.boxSize);
				const boxSize = item.boxSize || 100;

				const fillProps = fillPropsMap[item.fillType];
				const isSolid = item.fillType === "solid";

				return `
					i.i--${item.name} {
						${fillProps}: url(${getUrl(item.filename)});
						${isSolid ? `background-color: ${item.defaultColor};` : ""}
					}
					i.i--${item.name}.-box {
						background-size: ${boxSize}%;
						mask-size: ${boxSize}%;
					}
				`;
			})
			.join("")}
	`;

	// @mixin iconMask($source, $boxRatio: 100%, $defaultColor: transparent) {
	// 	@if ($defaultColor != transparent) {
	// 		background-color: $defaultColor;
	// 	}
	// 	mask-image: $source;
	// 	@include iconBox($boxRatio);
	// }

	// @mixin iconOrigin($source, $boxRatio: 100%) {
	// 	background-color: transparent !important;
	// 	background-image: $source;
	// 	@include iconBox($boxRatio);
	// }

	const styleTag = document.createElement("style");
	styleTag.dataset.iconic = true;
	styleTag.innerHTML = styleTagText;
	console.log(styleTag.innerHTML);

	document.head.appendChild(styleTag);
};

onMounted(() => {
	// oneScript();
});
</script>

<style lang="scss" scoped>
.test {
	width: 500px;
	height: 500px;
	border: 1px solid #d3d;
}
i {
	width: 50px;
	height: 50px;
}
</style>
