import path from "path";
import { useContainer, streamToString } from "../utils";

export default defineEventHandler(async (event) => {
	// 타겟 컨테이너 준비
	const container = useContainer();

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

	// data.json 파일을 읽어온다
	const data_blob = container.getBlockBlobClient("data.json");
	const data_download = await data_blob.download(0);
	const data_downloaded = await streamToString(data_download.readableStreamBody!);
	const data = JSON.parse(data_downloaded);

	// 컨테이너에 파일을 업로드할 준비를 한다.
	const file = files[0];
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
		fileExtention,
		filename,
	};

	const flatData = JSON.stringify(data, null, 4);
	await data_blob.upload(flatData, flatData.length);

	// 전용 스크립트를 불러와 json정보를 포함해서 수정한다.
	const script_blob = container.getBlockBlobClient("script.js");
	const script_download = await script_blob.download(0);
	const scriptString = await streamToString(script_download.readableStreamBody!);
	console.log("원본 스크립트", scriptString);

	// const pattern = /(\/\/ \[DATASTART\]\n)([\s\S]*?)(\n\s*\/\/ \[DATAEND\])/;
	const pattern = /(\/\/\s*\[DATASTART\]\s*\n)([\s\S]*?)(\n\s*\/\/\s*\[DATAEND\])/;
	const injectCode = "const ICONDATA = {}";
	const afterScript = scriptString.replace(pattern, `$1${injectCode}$3`);
	console.log("수정 스크립트", afterScript);

	return { done: true, data };
});
