import { parseHTML } from "linkedom";
import type { XkcdComic } from "./getXkcd.ts";

const CACHE = await caches.open("xkcd-transcripts/v0");

const ONE_HOUR = 3_600_000;
const ONE_DAY = 24 * ONE_HOUR;

export async function getTranscript(xkcd: XkcdComic) {
	// use original transcript if found
	if (xkcd.transcript) {
		return { text: xkcd.transcript };
	}

	const url = `https://explainxkcd.com/wiki/index.php/${xkcd.num}`;

	const cached = await CACHE.match(url);

	if (cached) {
		return { html: await cached.text() };
	}

	const now = new Date();
	const publishDate = new Date([xkcd.year, xkcd.month, xkcd.day].join("-"));
	const isRecent = (now.getTime() - publishDate.getTime()) < (7 * ONE_DAY);
	const isBrandNew = (now.getTime() - publishDate.getTime()) < (2 * ONE_DAY);

	const html = await fetchTranscript(url);
	if (html) {
		await CACHE.put(
			url,
			new Response(html, {
				headers: {
					"Expires": new Date(
						Date.now() +
							(isRecent
								// bust cache for recently published comics after a few hours
								? (isBrandNew ? 3 * ONE_HOUR : 6 * ONE_HOUR)
								: 45 * ONE_DAY),
					).toUTCString(),
				},
			}),
		);
	}

	return { html };
}

export async function fetchTranscript(url: string) {
	console.log("Fetching", url);

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
		if (
			element.localName === "p" && element.childElementCount === 1 &&
			element.firstElementChild?.localName === "br"
		) continue;

		transcript += element.outerHTML;
	}

	transcript = transcript.replaceAll("dl>", "div>").replaceAll("dd>", "p>");

	return transcript;
}
