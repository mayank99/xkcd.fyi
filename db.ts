import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const path = process.env.DB_PATH ?? ".data/xkcd.db";
mkdirSync(dirname(path), { recursive: true });

export const db = new DatabaseSync(path);

db.exec(`
	CREATE TABLE IF NOT EXISTS comics (
		num        INTEGER PRIMARY KEY,
		title      TEXT NOT NULL,
		img        TEXT NOT NULL,
		title_text TEXT NOT NULL, -- "alt" in xkcd's JSON
		published  TEXT NOT NULL  -- YYYY-MM-DD
	) STRICT;

	-- One row per comic per source. No FK: a bulk import may run before the comic row exists.
	CREATE TABLE IF NOT EXISTS transcripts (
		num        INTEGER NOT NULL,
		source     TEXT NOT NULL,    -- 'xkcd' | 'explainxkcd' (later: 'bluesky')
		content    TEXT,             -- NULL: looked, found nothing
		fetched_at INTEGER,          -- when content was fetched; NULL if we never had any
		checked_at INTEGER NOT NULL, -- when we last asked (both ms since epoch)
		PRIMARY KEY (num, source)
	) STRICT, WITHOUT ROWID;
`);

export type TranscriptSource = "xkcd" | "explainxkcd";

const upsertTranscript = db.prepare(`
	INSERT INTO transcripts (num, source, content, fetched_at, checked_at) VALUES (?, ?, ?, ?, ?)
	ON CONFLICT (num, source) DO UPDATE SET
		-- an empty or failed refetch never erases what we have, or makes it look newer
		content = coalesce(excluded.content, content),
		fetched_at = coalesce(excluded.fetched_at, fetched_at),
		checked_at = excluded.checked_at
`);

/** Records the result of asking `source` for a transcript; pass "" if it had none */
export function saveTranscript(num: number, source: TranscriptSource, content: string) {
	const now = Date.now();
	upsertTranscript.run(num, source, content || null, content ? now : null, now);
}
