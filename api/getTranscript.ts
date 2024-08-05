import { parseHTML } from "linkedom";
import type { XkcdComic } from "./getXkcd.ts";

const CACHE = await caches.open("xkcd-transcripts/v0");
const ONE_WEEK = 604_800_000;
const ONE_HOUR = 3_600_000;

export async function getTranscript(xkcd: XkcdComic) {
	// use original transcript if found
	if (xkcd.transcript) {
		return { text: xkcd.transcript };
	}

	const url = `https://explainxkcd.com/wiki/index.php/${xkcd.num}`;
	const now = new Date();
	const publishDate = new Date([xkcd.year, xkcd.month, xkcd.day].join("-"));

	const cached = await CACHE.match(url);
	if (cached) {
		const isRecent = (now.getTime() - publishDate.getTime()) < ONE_WEEK;

		// bust cache for recently published comics after two hours
		if (isRecent) {
			const cachedAt = Number(cached.headers.get("x-cached-at"));
			if ((now.getTime() - cachedAt) > (ONE_HOUR * 2)) {
				await CACHE.delete(url);
			}
		}

		return { html: await cached.text() };
	}

	const html = await fetchTranscript(url);

	const response = new Response(html);
	response.headers.set("x-cached-at", now.getTime().toString());
	await CACHE.put(url, response.clone());

	return { html };
}

export async function fetchTranscript(url: string) {
	const page = await fetch(url).then((r) => r.ok ? r.text() : "");
	if (!page) return "";

	const { document } = parseHTML(page);
	let transcript = "";

	const heading = document.getElementById("Transcript")?.closest(
		"h1, h2, h3, h4",
	);

	let element = heading;

	while (true) {
		element = element?.nextElementSibling;
		if (!element) break;
		if (element.id === "Discussion") break;
		if (element.localName === "table") continue;
		if (["h1", "h2", "h3", "h4", "h5"].includes(element.localName)) break;

		transcript += element.outerHTML;
	}

	transcript = transcript.replaceAll("dl>", "div>").replaceAll("dd>", "p>");

	return transcript;
}
