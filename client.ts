import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { Hono } from "hono";

const hashes = new Map<string, string>();

/** URL of a file in `static/`, with a content hash so it can be cached forever */
export function asset(path: string) {
	let hash = hashes.get(path);
	if (!hash) {
		hash = createHash("sha1").update(readFileSync(`./static${path}`)).digest("hex").slice(0, 8);
		hashes.set(path, hash);
	}
	return `${path}?v=${hash}`;
}

/** URL of a source file as a browser module, e.g. `clientModule("islands/ThemeSwitcher.tsx")` */
export const clientModule = (path: string) => `/_client/${path}`;

// Bare specifiers the client modules can import. These all (fortunately) resolve to a single file each.
const vendor = ["preact", "preact/hooks", "preact/jsx-runtime"];

/** Contents of the `<script type="importmap">` that client modules rely on */
export const importMap = JSON.stringify({
	imports: Object.fromEntries(vendor.map((name) => [name, `/_client/vendor/${name}.js`])),
});

async function load(path: string) {
	if (path.startsWith("vendor/")) {
		const name = vendor.find((name) => path === `vendor/${name}.js`);
		if (!name) return null;
		return await readFile(fileURLToPath(import.meta.resolve(name)), "utf8");
	}

	if (!/^(islands|components)\/[\w.-]+\.tsx$/.test(path)) return null;
	const source = await readFile(path, "utf8").catch(() => null);
	if (source === null) return null;

	// Per-file transpile only (types + JSX); no bundling.
	const { code } = await transform(source, {
		loader: "tsx",
		jsx: "automatic",
		jsxImportSource: "preact",
	});
	return code;
}

/** Serves the modules above; anything else under `/_client/` falls through to a 404 */
export const client = new Hono().get("/_client/:path{.+}", async (c, next) => {
	const code = await load(c.req.param("path"));
	if (!code) return next();

	return c.body(code, 200, {
		"Content-Type": "text/javascript; charset=utf-8",
		// TODO: These URLs don't change when the code does, so they can't be cached yet
		"Cache-Control": "no-cache",
	});
});
