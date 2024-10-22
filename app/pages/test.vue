<template>
	<div>
		<i class="i--2"></i>
		<i class="i--2 -box"></i>
	</div>
</template>
<style lang="scss" scoped>
i[class^="i--"] {
	color: #000;
	display: inline-flex;
	vertical-align: top;
	flex: 0 0 auto;
	box-sizing: border-box;
	min-width: 5px;
	min-height: 5px;
	font-size: 0;
}
i[class^="i--"]::after {
	content: "";
	width: 100%;
	height: 100%;
	position: relative;
	color: inherit;
	display: inline-flex;
	box-sizing: border-box;
	background-color: currentColor;
	background-size: 100% 100%;
	background-repeat: no-repeat;
	background-size: contain;
	fill: currentColor;
	background-position: center center;
	mask-size: 100% 100%;
	-webkit-mask-size: 100% 100%;
	mask-position: center center;
	-webkit-mask-position: center center;
	mask-repeat: no-repeat;
	-webkit-mask-repeat: no-repeat;
}
i[class^="i--"].-box,
i[class^="i--"].-box::after {
	aspect-ratio: 1 / 1;
}

// i.i--${item.name} {
// 					${fillProps}-image: url(${getUrl(item.filename)});
// 					color: ${color};
// 				}
// 				i.i--${item.name}.-box {
// 					${fillProps}-size: ${boxSize}%;
// 				}
i {
	width: 50px;
	height: 50px;

	&::after {
		mask-image: url("https://jarvis.dn.nexoncdn.co.kr/temp/l-apple.svg");
		// background-image: url();
	}
	&.-box {
		&::after {
			mask-size: 50%;
		}
	}
}
</style>
