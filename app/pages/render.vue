<template>
	<div class="test">
		<i class="i--notice"> </i>
		<i class="i--l-apple"> </i>
		<i class="i--wp-money"> </i>
		<i class="i--l-googleplay"> </i>
		<i class="i--test-link"> </i>
		<i class="i--l-kakaotalk -box"> </i>
		<i class="i--l-nexon-white-full -box"> </i>
		<i class="i--swap"> </i>
		<i class="i--aff"></i>
		<i class="i--aff -box"></i>
		<i class="i--castle"></i>

		<!-- <img src="https://jarvis.dn.nexoncdn.co.kr/temp/aim.svg" /> -->

		<!-- <i class="i--cake"> </i>
		<i class="i--chzzk"> </i> -->
		<!-- <i class="i--cake"> </i>
		<div class="wpimg"></div>
		<img src="https://jarviskcst.blob.core.windows.net/temp/cake.svg" />
		<img src="https://jarviskcst.blob.core.windows.net/temp2/icon_user.svg" /> -->
		<ClientOnly>
			<!-- {{ getUrl("script.js") }} -->
		</ClientOnly>

		<!-- <script src="https://jarvis.dn.nexoncdn.co.kr/temp/script.js"></script> -->

		https://jarviskcst.blob.core.windows.net/temp/script.js
		<br />
		https://jarvis.dn.nexoncdn.co.kr/temp/script.js
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
			src: "https://jarviskcst.blob.core.windows.net/temp/script.js",
			"data-callscript": true,
		},
	],
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.test {
	width: 500px;
	height: 500px;
	border: 1px solid #d3d;
}
i {
	width: 70px;
	height: 70px;
	// background-color: #d3d;
}
i.i--l-kakaotalk {
	background-color: #aca;
}
i.i--swap {
	background-color: #caa;
}
</style>
