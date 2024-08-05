import { HttpError, page } from "fresh";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";
import { define } from "../utils.ts";
import { getXkcd } from "../api/getXkcd.ts";

export const handler = define.handlers({
	GET: async ({ params }) => {
		const xkcd = await getXkcd(Number(params.number));
		if (!xkcd) throw new HttpError(404);

		return page({ xkcd });
	},
});

export default define.page<typeof handler>(({ data }) => {
	return (
		<>
			<Header />
			<Comic xkcd={data.xkcd} />
		</>
	);
});
