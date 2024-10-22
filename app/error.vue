<template>
	<div>
		<div>
			{{ is404 ? "존재하지 않는 페이지 입니다." : "페이지 오류가 발생했습니다." }}
		</div>
		<div v-html="objectToHTML(error)"></div>
		<NuxtLink class="testbtn" to="/"> go main </NuxtLink>
	</div>
</template>
<script setup>
const error = useError();
const is404 = error.value.statusCode === 404;
</script>
