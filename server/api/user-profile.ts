import elf from "~~/api/elf";
import airplanes from "~~/api/airplanes";

// [TODO] graphql로 변경
export default defineEventHandler(async (event) => {
	const cookies = parseCookies(event);
	const ifwt = cookies?.["_ifwt"];

	if (!ifwt) {
		return {
			isProxy: true,
			response: null,
			status: 401,
			code: "0002",
		};
	}

	elf.setAirplane({ IAS: airplanes.IAS });

	const payload = {
		ticket: "IAS",
		path: "/v1/user/profile",
		ifwt,
	};

	const response = await elf(payload);

	return { isProxy: true, response };
});
