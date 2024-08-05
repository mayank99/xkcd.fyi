export async function getXkcd(number?: number) {
	const url = number
		? `https://xkcd.com/${number}/info.0.json`
		: `https://xkcd.com/info.0.json`;

	return await fetch(url).then((r) => r.json()) as XkcdComic;
}

type XkcdComic = {
	num: number;
	title: string;
	transcript: string;
	img: string;
	alt: string;
	year: string;
	month: string;
	day: string;
};
