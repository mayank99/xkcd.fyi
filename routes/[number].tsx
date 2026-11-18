import { type DataOf, type Handlers, HttpError, type PageProps } from "../utils.ts";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";
import { getXkcd } from "../api/getXkcd.ts";
import { getTranscript } from "../api/getTranscript.ts";
import { Transcript } from "../components/Transcript.tsx";
import { Footer } from "../components/Footer.tsx";

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

const cacheControl = {
	latest: `public, max-age=60, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_HOUR}`,
	old: `public, max-age=60, s-maxage=${ONE_DAY * 30}, stale-while-revalidate=${ONE_DAY * 30 * 3}`, // longer for old comics
};

export const handler = {
	GET: async ({ params }) => {
		const number = Number(params.number);

		const [xkcd, latestXkcd] = await Promise.all([getXkcd(number), getXkcd()]);
		if (!xkcd || !latestXkcd) throw new HttpError(404);
		const transcript = await getTranscript(xkcd);

		// matching 1 week period from getTranscript
		const isRecent = Date.now() - Date.parse(xkcd.published) < 7 * ONE_DAY * 1000;

		return {
			data: { xkcd, transcript, latestXkcd },
			title: `${xkcd.num}: ${xkcd.title}`, // for <head>
			headers: {
				"Cache-Control": isRecent ? cacheControl.latest : cacheControl.old,
			},
		};
	},
} satisfies Handlers<unknown>;

export default function Page({ data }: PageProps<DataOf<typeof handler>>) {
	return (
		<>
			<Header />
			<Comic xkcd={data.xkcd} transcript={<Transcript {...data.transcript} />} />
			<Footer num={data.xkcd.num} latestNum={data.latestXkcd?.num || Number.MAX_VALUE} />
		</>
	);
}
