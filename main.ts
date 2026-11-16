import { readdirSync } from "node:fs";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type Context, Hono, type Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { h, type VNode } from "preact";
import { renderToString } from "preact-render-to-string";
import { asset, client } from "./client.ts";
import App from "./routes/_app.tsx";
import ErrorPage from "./routes/_error.tsx";
import { type Handlers, HttpError, type PageProps } from "./utils.ts";

const routes = {
	index: await import("./routes/index.tsx"),
	number: await import("./routes/[number].tsx"),
};

/** Calls the route `handler` to load data and renders its default export (inside `_app.tsx`). */
function render<Data>({
	handler,
	default: Page,
}: {
	handler: Handlers<Data>;
	default: (props: PageProps<Data>) => VNode | null;
}) {
	return async (c: Context) => {
		const { data, title, headers } = await handler.GET({ params: c.req.param() });
		const html = renderToString(h(App, { title, children: h(Page, { data }) }));
		return c.html("<!DOCTYPE html>" + html, 200, headers);
	};
}

function errorPage(c: Context, error: unknown) {
	const status = error instanceof HttpError ? error.status : 500;
	if (status >= 500) console.error(error);
	const html = renderToString(h(App, { children: h(ErrorPage, { error }) }));
	return c.html("<!DOCTYPE html>" + html, status as ContentfulStatusCode);
}

/** Redirects `/327/` to `/327` */
async function trailingSlashes(c: Context, next: Next) {
	const { pathname, search } = new URL(c.req.url);
	if (pathname === "/" || !pathname.endsWith("/")) return next();

	// strip extra leading and trailing slashes
	return c.redirect("/" + pathname.replace(/^\/+|\/+$/g, "") + search, 302);
}

const staticFiles = new Set(readdirSync("./static").map((name) => `/${name}`));

/** Redirects a static file's URL with the wrong query param to the correct one from `asset()`. */
async function staleAssets(c: Context, next: Next) {
	const { search } = new URL(c.req.url);
	const { path } = c.req;
	if (!search || !staticFiles.has(path) || path + search === asset(path)) return next();
	return c.redirect(asset(path), 302);
}

export const app = new Hono()
	.use(staleAssets)
	.use(
		serveStatic({
			root: "./static",
			onFound: (_path, c) => {
				// URLs from `asset()` carry a content hash
				if (c.req.query("v")) c.header("Cache-Control", "public, max-age=31536000, immutable");
			},
		}),
	)
	.use(trailingSlashes)
	.route("/", client)
	.get("/", render(routes.index))
	.get("/:number{[1-9][0-9]*}", render(routes.number))
	.notFound((c) => errorPage(c, new HttpError(404)))
	.onError((error, c) => errorPage(c, error));

if (import.meta.main) {
	serve({ fetch: app.fetch, port: Number(process.env.PORT) || 8000 }, ({ port }) => {
		console.log(`Listening on http://localhost:${port}`);
	});
}
