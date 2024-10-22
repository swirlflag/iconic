export const objectToHTML = (object = {}) => {
	// object를 넣고 v-dompurify-html로 찍어보자. 매우굿이다
	// <div v-dompurify-html="objectToHTML({a:1, b: {c: 3}})"></div>
	let FINALSTRING = "";

	const loopArray = (arr) => {
		let string = "";
		arr.forEach((v) => {
			if (Array.isArray(v)) {
				string += loopArray(v);
			} else if (v !== null && typeof v === "object") {
				string += ` { ${loopObject(v)} }, `;
			} else {
				string += `<div> ${v}, </div>`;
			}
		});
		return `<div style="margin-left:30px; background-color:rgba(0,0,200,0.08);">${string}</div>`;
	};

	const loopObject = (obj) => {
		let string = "";
		Object.entries(obj).forEach(([k, v]) => {
			string += `<div style="margin-left:30px;background-color:rgba(0,0,200,0.08);"><strong>${k}</strong> :`;
			if (Array.isArray(v)) {
				string += ` [ ${loopArray(v)} ], `;
			} else if (v !== null && typeof v === "object") {
				string += ` { ${loopObject(v)} } `;
			} else {
				string += `<span> ${v} </span>`;
			}
			string += "</div>";
		});
		if (string === "") {
			string = "빈 오브젝트입니다.";
		}
		return string;
	};

	FINALSTRING = loopObject(object);

	return "<div style='display:flex; flex-direction:column; font-size: 15px'>" + FINALSTRING + "</div>";
};
