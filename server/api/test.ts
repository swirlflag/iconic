import { useContainer } from "../utils";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineEventHandler(async (event) => {
	// const defaultAzureCredential = new DefaultAzureCredential();

	// const blobServiceClient = new BlobServiceClient(
	//     `https://${ACCOUNT}.blob.core.windows.net`,
	//     defaultAzureCredential
	// );

	// console.log(blobServiceClient);

	const blobList = [];
	let jsondata = {};

	try {
		const containerClient = useContainer();

		// 파일들 조회
		// for await (const blob of containerClient.listBlobsFlat()) {
		//     blobList.push(blob.name);
		// }

		// 특정 파일 조회
		// const blobClient = containerClient.getBlobClient("testjson.json");
		// const downloadBlockBlobResponse = await blobClient.download(0);

		// const downloadedData = await streamToString(
		//     downloadBlockBlobResponse.readableStreamBody!
		// );
		// jsondata = JSON.parse(downloadedData);
		// console.log("Downloaded blob content:", downloadedData);

		// 랜덤 업로드
		// const filename = "emptyFile.txt";
		// const filePath = path.join(__dirname, filename);

		// fs.writeFileSync(filePath, "");
		// console.log(`Empty file '${filename}' created successfully.`);

		// const blobName = "myfiletest.txt";
		// const blockBlobClient = containerClient.getBlockBlobClient(blobName);

		// const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);
		// console.log(
		//     `Empty file uploaded to blob '${blobName}' successfully. Request ID: ${uploadBlobResponse.requestId}`
		// );
	} catch (error) {
		console.error("Error fetching blob files:", error);
		// res.status(500).json({ error: "Error fetching blob files" });
	}

	return { blobList, jsondata };

	// const cookies = parseCookies(event);
	// const ifwt = cookies?.["_ifwt"];
	// if (!ifwt) {
	//     return {
	//         isProxy: true,
	//         response: null,
	//         status: 401,
	//         code: "0002",
	//     };
	// }
	// elf.setAirplane({ IAS: airplanes.IAS });
	// const payload = {
	//     ticket: "IAS",
	//     path: "/v1/user/profile",
	//     ifwt,
	// };
	// const response = await elf(payload);
	// return { isProxy: true, response };
});
