import { HttpError, page } from "fresh";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";
import { define } from "../utils.ts";
import { getXkcd } from "../api/getXkcd.ts";
import { getTranscript } from "../api/getTranscript.ts";
import { Transcript } from "../components/Transcript.tsx";

export const handler = define.handlers({
	GET: async ({ params }) => {
		const xkcd = await getXkcd(Number(params.number));
		if (!xkcd) throw new HttpError(404);
		const transcript = await getTranscript(xkcd);

		return page({ xkcd, transcript }, {
			headers: { "Cache-Control": "public, max-age=1800" },
		});
	},
});

export default define.page<typeof handler>(({ data }) => {
	return (
		<>
			<Header />
			<Comic
				xkcd={data.xkcd}
				transcript={<Transcript {...data.transcript} />}
			/>
		</>
	);
});
