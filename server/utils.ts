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

export const STR_URL = `https://jarviskcst.blob.core.windows.net`;
