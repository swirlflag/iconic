<!-- 기본 요소들을 대체하는 커스텀 요소들을 배치 -->

<template>
	<div id="plate--base"></div>
</template>

<script setup></script>

<style lang="scss" scoped>
#plate--base {
	width: 100%;
	height: 100%;
	pointer-events: none;
	position: fixed;
	left: 0;
	top: 0;
	> * {
		pointer-events: all;
	}
}
</style>
