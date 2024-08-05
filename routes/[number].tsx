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

		const transcript = xkcd.transcript
			? { text: xkcd.transcript }
			: { html: await getTranscript(xkcd.num) };

		return page({ xkcd, transcript });
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
