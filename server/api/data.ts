import { useContainer, streamToString } from "../utils";

export default defineEventHandler(async (event) => {
	try {
		const container = useContainer();

		const data_blob = container.getBlobClient("data.json");
		const data_download = await data_blob.download(0);
		const data_downloaded = await streamToString(data_download.readableStreamBody!);
		const data = JSON.parse(data_downloaded);

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
