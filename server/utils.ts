import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

const ACCOUNT = process.env.NUXT_PUBLIC_ACCOUNT;
const KEY = process.env.NUXT_PUBLIC_KEY;
const CONTAINER = "temp";

export const streamToString = async (readableStream: NodeJS.ReadableStream): Promise<string> => {
	return new Promise((resolve, reject) => {
		const chunks: any[] = [];
		readableStream.on("data", (data) => {
			chunks.push(data.toString());
		});
		readableStream.on("end", () => {
			resolve(chunks.join(""));
		});
		readableStream.on("error", reject);
	});
};

export const useContainer = () => {
	const blobServiceClient = new BlobServiceClient(
		`https://${ACCOUNT}.blob.core.windows.net`,
		new StorageSharedKeyCredential(ACCOUNT, KEY),
	);
	return blobServiceClient.getContainerClient(CONTAINER);
};

export const updateDataAndScript = async (data) => {
	const container = useContainer();
	const data_blob = container.getBlockBlobClient("data.json");
	const script_blob = container.getBlockBlobClient("script.js");

	const flatData = JSON.stringify(data, null, 4);
	await data_blob.upload(flatData, flatData.length);

	const script_download = await script_blob.download(0);
	const scriptString = await streamToString(script_download.readableStreamBody!);
	const pattern = /(\/\/\s*\[DATASTART\]\s*\n)([\s\S]*?)(\n\s*\/\/\s*\[DATAEND\])/;
	const injectCode = `const ICONDATA = ${flatData}`;

	let afterScript = scriptString.replace(pattern, `$1${injectCode}$3`);

	await script_blob.upload(afterScript, afterScript.length, {
		blobHTTPHeaders: { blobContentType: "application/javascript" },
	});
};

export const STR_URL = `https://jarviskcst.blob.core.windows.net`;
