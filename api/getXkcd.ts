const CACHE = await caches.open("xkcd-info/v0");

const ONE_HOUR = 3_600_000;

export async function getXkcd(number?: number) {
	const url = number
		? `https://xkcd.com/${number}/info.0.json`
		: `https://xkcd.com/info.0.json`;

	// Cache latest comic for 30 mins, and everything else indefinitely
	const cacheDuration = number ? undefined : 0.5 * ONE_HOUR;

	const response = await cachedFetch(url, { duration: cacheDuration });
	if (response?.ok) {
		return await response.json() as XkcdComic;
	}
	return null;
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
async function cachedFetch(
	url: string,
	{ duration }: { duration: number | undefined },
) {
	const cached = await CACHE.match(url);
	if (cached) {
		return cached;
	}

	console.log("Fetching", url);
	const response = await fetch(url);

	if (response.ok) {
		const cloned = response.clone();
		const headers = new Headers(cloned.headers);
		if (duration) {
			headers.set(
				"Expires",
				new Date(Date.now() + duration).toUTCString(),
			);
		}
		await CACHE.put(url, new Response(cloned.body, { headers }));
		return response;
	}

	return response;
}
