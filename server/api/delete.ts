import { useContainer, streamToString } from "../utils";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const name = body.name;

	try {
		const container = useContainer();

		const data_blob = container.getBlockBlobClient("data.json");
		const data_download = await data_blob.download(0);
		const data_downloaded = await streamToString(data_download.readableStreamBody!);
		const data = JSON.parse(data_downloaded);

		if (!data[name]) {
			return {
				message: "그런이름없음",
			};
		}

		const file_blob = container.getBlockBlobClient(data[name].filename);
		await file_blob.delete();
		delete data[name];

		const flatData = JSON.stringify(data, null, 4);
		await data_blob.upload(flatData, flatData.length);

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
