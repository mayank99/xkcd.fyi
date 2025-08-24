import { HttpError, page } from "fresh";
import { getXkcd } from "../api/getXkcd.ts";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";
import { getTranscript } from "../api/getTranscript.ts";
import { Transcript } from "../components/Transcript.tsx";
import { define } from "../utils.ts";
import { Footer } from "../components/Footer.tsx";

export const handler = define.handlers({
	GET: async () => {
		const latestXkcd = await getXkcd();
		if (!latestXkcd) throw new HttpError(404);
		const transcript = await getTranscript(latestXkcd);

		return page({ latestXkcd, transcript }, {
			headers: { "Cache-Control": "public, max-age=600" },
		});
	},
});

export default define.page<typeof handler>(({ data }) => {
	return (
		<>
			<Header />
			<Comic
				xkcd={data.latestXkcd}
				transcript={<Transcript {...data.transcript} />}
			/>
			<Footer
				num={data.latestXkcd.num}
				latestNum={data.latestXkcd.num}
			/>
		</>
	);
});
