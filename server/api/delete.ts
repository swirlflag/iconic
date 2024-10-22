import { useContainer, streamToString, updateDataAndScript } from "../utils";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const key = body.key;

	try {
		const container = useContainer();

		const data_blob = container.getBlockBlobClient("data.json");
		const data_download = await data_blob.download(0);
		const data_downloaded = await streamToString(data_download.readableStreamBody!);
		const data = JSON.parse(data_downloaded);

		if (!data[key]) {
			return {
				message: "그런이름없음",
			};
		}

		const filename = `${key}.${data[key].ext}`;

		const file_blob = container.getBlockBlobClient(filename);
		await file_blob.deleteIfExists();
		delete data[key];

		await updateDataAndScript(data);

		return {
			data,
		};
	} catch (error) {
		console.log(error);
		return {
			error,
			message: "오류케이스처리중",
		};
	}
});
