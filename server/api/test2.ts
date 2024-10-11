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
	const blobClient = container.getBlockBlobClient("data.json");
	const downloadBlockBlobResponse = await blobClient.download(0);
	const downloadedData = await streamToString(downloadBlockBlobResponse.readableStreamBody!);
	const beforeData = JSON.parse(downloadedData);
	console.log("현재 data.json 파일의 내용:", beforeData);

	// 컨테이너에 파일을 업로드할 준비를 한다.
	const file = files[0];
	console.log(file, file.filename);

	const fileExtention = path.extname(file.filename).replace(".", "");

	const blobName = `${fields["name"]}.${fileExtention}`;
	const blockBlobClient = container.getBlockBlobClient(blobName);

	const uploadOptions = {
		blobHTTPHeaders: { blobContentType: file.type },
	};

	// 읽어온 파일을 확인후 업로드하고, data.json 파일을 업데이트한다.

	await blockBlobClient.upload(file.data, file.data.length, uploadOptions);

	const afterData = {
		...beforeData,
		[fields["name"]]: {
			name: fields["name"],
			fileExtention: fileExtention,
			filename: blobName,
		},
	};

	const updatedBlobContent = JSON.stringify(afterData, null, 4);

	// await blobClient.upload(updatedBlobContent, updatedBlobContent.length, { overwrite: true });

	const r2 = await blobClient.upload(updatedBlobContent, updatedBlobContent.length);

	console.log(r2);

	return { done: true, data: afterData };
});
