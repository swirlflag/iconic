<template>
	<div class="pagination">
		<div class="swiper-container" ref="$swiper">
			<div class="swiper-wrapper">
				<template v-for="item in renderList">
					<div class="swiper-slide">
						<NuxtLink :to="item.to" :class="{ '-exact': item.isExact }">
							{{ item.name }}
						</NuxtLink>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup>
import Swiper from "swiper/bundle";
// [TODO] paginnation data sync
const props = defineProps({
	query: {
		type: String,
		default: "page",
	},
	data: {},
});

const queryName = props.query;

const route = useRoute();

const renderList = computed(() => {
	const testarr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	return testarr.map((number) => {
		return {
			name: number,
			to: { query: { ...route.query, [queryName]: number } },
			isExact: number === +route.query[queryName],
		};
	});
});

const $swiper = ref(null);

const setupSwiper = () => {
	new Swiper($swiper.value, {
		watchOverflow: true,
		// freeMode: true,
		slidesPerView: "auto",
		// touchEventsTarget: $swiper.value,
	});
};
onMounted(() => {
	setupSwiper();
});
</script>

<style lang="scss" scoped>
.pagination {
	box-sizing: border-box;
	display: flex;
	width: 100%;
	border: 1px solid #aac;
	padding-right: 33px;
	padding-left: 33px;
	overflow: hidden;

	.swiper-container {
		width: auto;
		max-width: 100%;
		margin: auto;
		box-sizing: border-box;
		display: flex;

		.swiper-wrapper {
			display: flex;

			.swiper-slide {
				display: flex;
				box-sizing: border-box;
				align-items: center;
				justify-content: center;
				margin: 0 10px;
			}
		}
	}

	a {
		border: 1px solid #333;
		border-radius: 5px;
		padding: 5px 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		&.-exact {
			background-color: #acc;
		}
		@include hover {
			background-color: #efefef;
		}
	}
}
</style>
