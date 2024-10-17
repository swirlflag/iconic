<template>
	<div class="input--toggle">
		<input type="checkbox" v-model="model" />
		{{ model }}
	</div>
</template>

<script setup>
const model = defineModal({ default: false });
</script>
<style lang="scss" scoped></style>
