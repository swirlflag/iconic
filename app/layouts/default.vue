<template>
	<slot></slot>
</template>
<script setup>
import { useNavStore } from "@store";
const navStore = useNavStore();
navStore.useNexonGnb();
navStore.useGnb();
</script>
