import { parseHTML } from "linkedom";
import { db, saveTranscript, type TranscriptSource } from "../db.ts";
import type { XkcdComic } from "./getXkcd.ts";

const ONE_HOUR = 3_600_000;
const ONE_DAY = 24 * ONE_HOUR;

type Row = {
	source: TranscriptSource;
	content: string | null;
	fetched_at: number | null;
	checked_at: number;
};

const selectTranscripts = db.prepare(
	"SELECT source, content, fetched_at, checked_at FROM transcripts WHERE num = ?",
);

export async function getTranscript(xkcd: XkcdComic) {
	const rows = selectTranscripts.all(xkcd.num) as Row[];

	// use original transcript if found
	const original = rows.find((row) => row.source === "xkcd")?.content;
	if (original) return { text: original };

	const saved = rows.find((row) => row.source === "explainxkcd");
	if (saved && !needsRefetch(saved, xkcd)) return { html: saved.content ?? "" };

	const url = `https://www.explainxkcd.com/wiki/index.php/${xkcd.num}`;

	// a failed fetch is saved like an empty result, so it isn't retried on every request
	const html = await fetchTranscript(url).catch(() => "");

	saveTranscript(xkcd.num, "explainxkcd", html);
	return { html: html || saved?.content || "" };
}

function needsRefetch(saved: Row, xkcd: XkcdComic) {
	const published = Date.parse(xkcd.published);

	// consider the transcript stabilized after one week
	if (saved.fetched_at && saved.fetched_at > published + 7 * ONE_DAY) return false;

	// until it stabilizes, refetch after a while
	const retryAfter = Date.now() - published < 7 * ONE_DAY ? 6 * ONE_HOUR : ONE_DAY;
	return Date.now() - saved.checked_at > retryAfter;
}

async function fetchTranscript(url: string) {
	console.log("Fetching", url);

	const page = await fetch(url, { signal: AbortSignal.timeout(10_000) })
		.then((r) => r.ok ? r.text() : "");
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
