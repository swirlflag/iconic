const getUrl = (file) => {
	return window?.isAzure
		? `https://jarviskcst.blob.core.windows.net/temp/${file}`
		: `https://jarvis.dn.nexoncdn.co.kr/temp/${file}`;
};

// const getUrl = (file) => {
//     return `https://jarviskcst.blob.core.windows.net/temp/${file}`;
// };

const alreadyTag = document.head.querySelector("[data-iconic]");

if (alreadyTag) {
	const isRerender = document.currentScript?.dataset?.rerender;
	if (!isRerender) {
		return;
	}
	alreadyTag.remove();
}

const renderList = Object.values(ICONDATA);
const fillPropsMap = {
	solid: "mask",
	origin: "background",
};

const defaultColor = "#000";

const styleTagText = `
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
	${renderList
		.map((item) => {
			const boxSize = item.box || 100;
			const fillProps = fillPropsMap[item.fill];
			const isSolid = item.fill === "solid";
			const color = isSolid ? item.color || defaultColor : "transparent";
			const prefix = !!item.prefix ? item.prefix + "-" : "";
			const key = `${prefix}${item.name}`;
			const filename = `${key}.${item.ext}`;
			const [posX, posY] = item?.pos?.split(",") || [50, 50];
			const x = posX - 50;
			const y = posY - 50;
			const transform = `scale(${boxSize}%) translate(${x}%, ${y}%)`;

			return `
				i.i--${key} {
					color: ${color};
				}
				i.i--${key}::after {
					${fillProps}-image: url(${getUrl(filename)});
				}
				i.i--${key}.-box::after {
					transform: ${transform};
					${!isSolid ? "background-color: inherit;" : ""}
				}
			`;
		})
		.join("")}
`;

const styleTag = document.createElement("style");
styleTag.dataset.iconic = true;
styleTag.innerHTML = styleTagText;
document.head.appendChild(styleTag);
