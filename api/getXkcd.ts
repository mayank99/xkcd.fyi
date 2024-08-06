const kv = await Deno.openKv();

const ONE_HOUR = 3_600_000;
const ONE_DAY = 24 * ONE_HOUR;

export async function getXkcd(number?: number) {
	const url = number
		? `https://xkcd.com/${number}/info.0.json`
		: `https://xkcd.com/info.0.json`;
	const cacheDuration = number ? 45 * ONE_DAY : 0.5 * ONE_HOUR;

	const response = await cachedFetch(url, { duration: cacheDuration });
	return response as XkcdComic | null;
}

export type XkcdComic = {
	num: number;
	title: string;
	transcript: string;
	img: string;
	alt: string;
	year: string;
	month: string;
	day: string;
};

/** caches response for the specified ms */
async function cachedFetch(url: string, { duration }: { duration: number }) {
	const cached = await kv.get(["xkcd-info", url]);
	if (cached.value) {
		return cached.value;
	}

	const response = await fetch(url);
	if (response.ok) {
		const info = await response.json();
		if (info) {
			await kv.set(["xkcd-info", url], info, { expireIn: duration });
		}
		return info;
	}

	return null;
}
