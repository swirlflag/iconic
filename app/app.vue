<template>
	<div id="app">
		<!-- z-index 5000 -->
		<PlateLoading />

		<!-- z-index 4000 -->
		<PlateBase />

		<!-- z-index 3000 -->
		<PlateToast />
		<PlateModal />

		<!-- z-index 2000 -->
		<PlateNav />
		<PlateNavPadding />

		<!-- z-index 0000 -->
		<PlatePage>
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</PlatePage>
	</div>
</template>

<script setup>
import PlateLoading from "./plates/PlateLoading";
import PlateBase from "./plates/PlateBase";
import PlateToast from "./plates/PlateToast";
import PlateModal from "./plates/PlateModal";
import PlateNav from "./plates/PlateNav";
import PlateNavPadding from "./plates/PlateNav/NavPadding";
import PlatePage from "./plates/PlatePage";
import { useInfoStore, useNavStore, useNexonStore } from "@store";

const route = useRoute();
const infoStore = useInfoStore();
</script>

<style lang="scss" scoped></style>
