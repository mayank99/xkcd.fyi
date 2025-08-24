#!/usr/bin/env -S deno run -A --watch=static/,routes/

import { Builder } from "fresh/dev";

const builder = new Builder();
if (Deno.args.includes("build")) {
	// This creates a production build
	// when running `deno run -A dev.ts build`
	await builder.build();
} else {
	// This starts a development server with live reload
	await builder.listen(() => import("./main.ts"));
}
