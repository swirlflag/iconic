<template>
	<div class="spinner--sample">
		<span></span>
		<span></span>
		<span></span>
	</div>
</template>

<script setup>
const props = defineProps({
	color: {
		type: String,
		default: "rgba(200,200,200,1)",
	},
});
const color = computed(() => props.color);
</script>
<style lang="scss" scoped>
@keyframes bound {
	0% {
		opacity: 0.35;
		transform: scale(0.6);
	}
	100% {
		opacity: 1;
	}
}
.spinner--sample {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	grid-gap: 2px;

	> span {
		display: inline-block;
		width: 6px;
		height: 6px;
		background-color: v-bind(color);
		border-radius: 9999px;
		animation: bound 500ms $EASE_inOutCubic infinite alternate;

		&:nth-child(1) {
			animation-delay: 0;
		}
		&:nth-child(2) {
			animation-delay: 100ms;
		}
		&:nth-child(3) {
			animation-delay: 200ms;
		}
	}
}
</style>
