<template>
	<div class="test">
		<div>
			<i class="i--l-apple"> </i>
			<i class="i--wp-class-5 -box"> </i>
			<i class="i--b-googleplay"></i>
		</div>
		<NuxtLink to="https://jarviskcst.blob.core.windows.net/temp/script.js" target="_blank"> azure script </NuxtLink>
		<br />
		<NuxtLink to="https://jarvis.dn.nexoncdn.co.kr/temp/script.js" target="_blank"> jarvis script </NuxtLink>
		<br />
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
		},
	],
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
i {
	width: 70px;
	height: 70px;
	border: 1px solid #000;
	// background-color: #d3d;
	// color: #d3d;
}
i.i--l-ggg {
	color: transparent;
}
</style>
