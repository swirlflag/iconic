<template>
	<slot></slot>
</template>
<script setup>
import { useNavStore } from "@store";
const navStore = useNavStore();
navStore.use("nexon-gnb");
navStore.use("gnb");
</script>
