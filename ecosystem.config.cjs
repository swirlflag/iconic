// pm2 start ecosystem.config.cjs --env production --no-daemon
require("dotenv").config();
const name = process.env?.NUXT_PUBLIC_NAMESPACE || "nexon.com";

module.exports = {
	apps: [
		{
			name,
			script: ".output/server/index.mjs",
			exec_mode: "cluster",
			instances: 0,
		},
	],
};
