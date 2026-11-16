import { db, saveTranscript } from "../db.ts";

const ONE_HOUR = 3_600_000;

const columns = "num, title, img, title_text AS alt, published";
const selectComic = db.prepare(`SELECT ${columns} FROM comics WHERE num = ?`);
// Rows only come from xkcd.com, so the highest number stored is the latest comic we know of
const selectLatest = db.prepare(`SELECT ${columns} FROM comics ORDER BY num DESC LIMIT 1`);
const insertComic = db.prepare(`
	INSERT INTO comics (num, title, img, title_text, published) VALUES (?, ?, ?, ?, ?)
	ON CONFLICT (num) DO NOTHING
`);

let latestCheckedAt = 0;
let latestCheck: Promise<void> | undefined;

export async function getXkcd(number?: number) {
	if (number) {
		// return early for invalid numbers
		const latest = await getXkcd();
		if (!latest || number > latest.num || number === 404) return null;

		// Published comics never change, so the db copy is final
		if (!selectComic.get(number)) await fetchXkcd(`https://xkcd.com/${number}/info.0.json`);
		return (selectComic.get(number) as XkcdComic | undefined) ?? null;
	}

	// Ask xkcd.com for the latest comic at most every 30 mins.
	// Until it does, the latest is the newest comic stored.
	if (Date.now() - latestCheckedAt > 0.5 * ONE_HOUR) {
		latestCheckedAt = Date.now();
		latestCheck = fetchXkcd(`https://xkcd.com/info.0.json`);
	}
	await latestCheck; // requests that arrive during a check will wait for it

	return (selectLatest.get() as XkcdComic | undefined) ?? null;
}

export type XkcdComic = {
	num: number;
	title: string;
	img: string;
	alt: string;
	/** YYYY-MM-DD */
	published: string;
};

async function fetchXkcd(url: string) {
	console.log("Fetching", url);
	try {
		const response = await fetch(url);
		if (!response.ok) return;
		const json = await response.json();

		// without a number, the row would be stored under the next free one and become the latest
		if (!Number.isInteger(json.num)) throw new Error("Comic has no number");

		const published = new Temporal.PlainDate(json.year, json.month, json.day).toString();
		insertComic.run(json.num, json.title, json.img, json.alt, published);

		// once upon a time, transcripts used be part of xkcd.com json
		if (json.transcript) saveTranscript(json.num, "xkcd", json.transcript);
	} catch (error) {
		// network failure, or a body that isn't the JSON we expect
		console.error("Failed to fetch", url, error);
	}
}
