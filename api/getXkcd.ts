const CACHE = await caches.open("xkcd-info/v0");
const ONE_HOUR = 3_600_000;

export async function getXkcd(number?: number) {
	const url = number
		? `https://xkcd.com/${number}/info.0.json`
		: `https://xkcd.com/info.0.json`;

	const cacheDuration = number ? 24 * ONE_HOUR : 0.25 * ONE_HOUR;

	const response = await cachedFetch(url, { duration: cacheDuration });

	return response.ok ? response.json() : null as
		| XkcdComic
		| null;
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
	const cached = await CACHE.match(url);
	const now = new Date();

	if (cached) {
		const cachedAt = Number(cached.headers.get("x-cached-at"));
		if ((now.getTime() - cachedAt) > duration) {
			await CACHE.delete(url);
		}
		return cached;
	}

	const response = await fetch(url);
	if (response.ok) {
		const headers = new Headers(response.headers);
		headers.set("x-cached-at", now.getTime().toString());
		await CACHE.put(url, new Response(response.body, { headers }));
	}
	return response;
}
