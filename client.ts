import { createHash } from "node:crypto";
import { globSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { Hono } from "hono";

const hashes = new Map<string, string>();

/** `url` with a content hash of `file`, so it can be cached forever */
function hashed(url: string, file: string) {
	let hash = hashes.get(file);
	if (!hash) {
		hash = createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 8);
		hashes.set(file, hash);
	}
	return `${url}?v=${hash}`;
}

/** URL of a file in `static/` */
export const asset = (path: string) => hashed(path, `./static${path}`);

/** URL of a source file as a browser module, e.g. `clientModule("islands/ThemeSwitcher.tsx")` */
export const clientModule = (path: string) => hashed(`/_client/${path}`, path);

// Bare specifiers the client modules can import. These all (fortunately) resolve to a single file each.
const vendor = ["preact", "preact/hooks", "preact/jsx-runtime"];

// Source files the browser can load as modules
const sources = globSync("{islands,components}/*.tsx");

/** Contents of the `<script type="importmap">`: sends each import to its hashed URL */
export const importMap = JSON.stringify({
	imports: Object.fromEntries([
		// Vendor imports (npm)
		...vendor.map((name) => [
			name,
			hashed(`/_client/vendor/${name}.js`, fileURLToPath(import.meta.resolve(name))),
		]),
		// Relative imports
		...sources.map((path) => [`/_client/${path}`, clientModule(path)]),
	]),
});

/** Reads files from disk and transpiles them if necessary */
async function load(path: string) {
	if (path.startsWith("vendor/")) {
		const name = vendor.find((name) => path === `vendor/${name}.js`);
		if (!name) return null;
		return await readFile(fileURLToPath(import.meta.resolve(name)), "utf8");
	}

	if (!sources.includes(path)) return null;
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

// Loaded once per server start
const modules = new Map<string, string>();

/** Serves the modules above; anything else under `/_client/` falls through to a 404 */
export const client = new Hono().get("/_client/:path{.+}", async (c, next) => {
	const path = c.req.param("path");
	const code = modules.get(path) ?? (await load(path));
	if (!code) return next();
	modules.set(path, code);

	return c.body(code, 200, {
		"Content-Type": "text/javascript; charset=utf-8",
		"Cache-Control": c.req.query("v") ? "public, max-age=31536000, immutable" : "no-cache",
	});
});
