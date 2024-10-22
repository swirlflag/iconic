import { useContainer, streamToString, updateDataAndScript } from "../utils";

export default defineEventHandler(async (event) => {
	// const body = await readBody(event);
	// const name = body.name;

	try {
		const container = useContainer();

		const data_blob = container.getBlockBlobClient("data.json");
		const data_download = await data_blob.download(0);
		const data_downloaded = await streamToString(data_download.readableStreamBody!);
		const data = JSON.parse(data_downloaded);

		const list = Object.values(data);

		list.forEach(async (item) => {
			const prefix = !!item.prefix ? item.prefix + "-" : "";
			const key = `${prefix}${item.name}`;
			const filename = `${key}.${item.ext}`;
			await container.getBlockBlobClient(filename).deleteIfExists();
		});

		await updateDataAndScript({});

		return {
			ok: true,
			message: "리셋 완료",
		};

		// const file_blob = container.getBlockBlobClient(data[name].filename);
		// await file_blob.deleteIfExists();
		// delete data[name];

		// return {
		// 	data,
		// };
	} catch (error) {
		return {
			error,
			ok: false,
			message: "오류케이스처리중",
		};
	}
});
