import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { minify } from "terser";

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
	console.log(ACCOUNT, KEY);
	const blobServiceClient = new BlobServiceClient(
		`https://${ACCOUNT}.blob.core.windows.net`,
		new StorageSharedKeyCredential(ACCOUNT, KEY),
	);
	return blobServiceClient.getContainerClient(CONTAINER);
};

const useMinify = async (code) => {
	let result = await minify(code, {
		output: {
			beautify: false,
			comments: false,
			inline_script: true,
		},
		compress: {
			// drop_console: true,
		},
		mangle: true,
	});

	result = result.code;
	result = result.replace(/\\n/g, "").replace(/\\t/g, "").replace(/\s+/g, " ");

	return result;
};

export const updateDataAndScript = async (data) => {
	const container = useContainer();
	const data_blob = container.getBlockBlobClient("data.json");
	const logic_blob = container.getBlockBlobClient("script-logic.js");
	const script_blob = container.getBlockBlobClient("script.js");

	const flatData = JSON.stringify(data, null, 4);
	await data_blob.upload(flatData, flatData.length);

	const logic_download = await logic_blob.download(0);
	const script_download = await script_blob.download(0);
	// const scriptString = await streamToString(script_download.readableStreamBody!);

	const logicString = await streamToString(logic_download.readableStreamBody!);

	// const pattern = /(\/\/\s*\[DATASTART\]\s*\n)([\s\S]*?)(\n\s*\/\/\s*\[DATAEND\])/;

	const dataString = `const ICONDATA = ${flatData};`;

	let scriptString = `
		(() => {
			${dataString}
			${logicString}
		})();
	`;

	scriptString = await useMinify(scriptString);

	await script_blob.upload(scriptString, scriptString.length, {
		blobHTTPHeaders: { blobContentType: "application/javascript" },
	});
};

export const STR_URL = `https://jarviskcst.blob.core.windows.net`;
