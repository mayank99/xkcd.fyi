import { HttpError, page } from "fresh";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";
import { define } from "../utils.ts";
import { getXkcd } from "../api/getXkcd.ts";
import { getTranscript } from "../api/getTranscript.ts";
import { Transcript } from "../components/Transcript.tsx";
import { Footer } from "../components/Footer.tsx";

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

const cacheControl = {
	latest: `public, max-age=60, s-max-age=${ONE_HOUR}, stale-while-revalidate=${ONE_HOUR}`,
	old: `public, max-age=60, s-max-age=${ONE_DAY * 30}, stale-while-revalidate=${ONE_DAY * 30 * 3}`, // longer for old comics
};

export const handler = define.handlers({
	GET: async ({ params, state }) => {
		const number = Number(params.number);

		const [xkcd, latestXkcd] = await Promise.all([getXkcd(number), getXkcd()]);
		if (!xkcd || !latestXkcd) throw new HttpError(404);
		const transcript = await getTranscript(xkcd);

		// for <head>
		state.title = `${xkcd.num}: ${xkcd.title}`;

		const isLatest = number === latestXkcd?.num;

		return page({ xkcd, transcript, latestXkcd }, {
			headers: {
				"Cache-Control": isLatest ? cacheControl.latest : cacheControl.old,
			},
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
			<Footer
				num={data.xkcd.num}
				latestNum={data.latestXkcd?.num || Number.MAX_VALUE}
			/>
		</>
	);
});
