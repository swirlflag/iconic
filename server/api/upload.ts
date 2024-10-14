import path from "path";
import { useContainer, streamToString, updateDataAndScript } from "../utils";

const container = useContainer();
const data_blob = container.getBlockBlobClient("data.json");
const script_blob = container.getBlockBlobClient("script.js");

const updateScript = async (flatData) => {
	const script_download = await script_blob.download(0);
	const scriptString = await streamToString(script_download.readableStreamBody!);

	const pattern = /(\/\/\s*\[DATASTART\]\s*\n)([\s\S]*?)(\n\s*\/\/\s*\[DATAEND\])/;

	const injectCode = `const ICONDATA = ${flatData}`;

	let afterScript = scriptString.replace(pattern, `$1${injectCode}$3`);

	await script_blob.upload(afterScript, afterScript.length, {
		blobHTTPHeaders: { blobContentType: "application/javascript" },
	});
};

export default defineEventHandler(async (event) => {
	// 타겟 컨테이너 준비

	// 받아온 정보를 가공해서 준비한다
	const formData = await readMultipartFormData(event);

	const fields = {};
	const files = [];

	formData.forEach((item) => {
		if (item.name === "file") {
			files.push(item);
		} else {
			fields[item.name] = item.data.toString();
		}
	});

	const file = files[0];

	// data.json 파일을 읽어온다
	const data_download = await data_blob.download(0);
	const data_downloaded = await streamToString(data_download.readableStreamBody!);
	const data = JSON.parse(data_downloaded);

	// 컨테이너에 파일을 업로드할 준비를 한다.
	const fileExtention = path.extname(file.filename).replace(".", "");
	const filename = `${fields["name"]}.${fileExtention}`;
	const file_blob = container.getBlockBlobClient(filename);
	const file_uploadOptions = {
		blobHTTPHeaders: { blobContentType: file.type },
	};

	// 읽어온 파일을 확인후 업로드하고, data.json 파일을 업데이트한다.
	await file_blob.upload(file.data, file.data.length, file_uploadOptions);
	data[fields["name"]] = {
		name: fields["name"],
		prefix: fields["prefix"],
		fillType: fields["fillType"],
		boxSize: fields["boxSize"],
		defaultColor: fields["defaultColor"],
		fileExtention,
		filename,
	};

	await updateDataAndScript(data);

	return { done: true, data };
});
