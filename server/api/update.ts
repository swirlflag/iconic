// import path from "path";
import { useContainer, streamToString, updateDataAndScript } from "../utils";

export default defineEventHandler(async (event) => {
	const container = useContainer();
	const data_blob = container.getBlockBlobClient("data.json");

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

	const prefix = !!fields.prefix ? fields.prefix + "-" : "";
	const key = `${prefix}${fields.name}`;

	// 파일이 있다면 업로드한다.
	if (file) {
		const filename = `${key}.${fields.ext}`;
		const file_blob = container.getBlockBlobClient(filename);
		await file_blob.upload(file.data, file.data.length, {
			blobHTTPHeaders: { blobContentType: file.type },
		});
	}

	//  data.json 파일을 업데이트한다.
	data[key] = { ...fields };

	await updateDataAndScript(data);

	return { done: true, data };
});
