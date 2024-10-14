import path from "path";
import { useContainer, streamToString, updateDataAndScript } from "../utils";

const container = useContainer();
const data_blob = container.getBlockBlobClient("data.json");
const script_blob = container.getBlockBlobClient("script.js");

export default defineEventHandler(async (event) => {
	console.log(1234);
	// 타겟 컨테이너 준비

	// 받아온 정보를 가공해서 준비한다
	const formData = await readMultipartFormData(event);

	const fields = {};
	// const files = [];

	formData.forEach((item) => {
		if (item.name === "file") {
			// files.push(item);
		} else {
			fields[item.name] = item.data.toString();
		}
	});

	// data.json 파일을 읽어온다
	const data_download = await data_blob.download(0);
	const data_downloaded = await streamToString(data_download.readableStreamBody!);
	const data = JSON.parse(data_downloaded);

	// 컨테이너에 파일을 업로드할 준비를 한다.
	// const file = files[0];
	// const fileExtention = path.extname(file.filename).replace(".", "");
	// const filename = `${fields["name"]}.${fileExtention}`;

	data[fields["name"]] = {
		...data[fields["name"]],
		...fields,
	};

	await updateDataAndScript(data);

	return { done: true, data };
});
