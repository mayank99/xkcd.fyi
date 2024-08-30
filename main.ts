import { App, fsRoutes, staticFiles, trailingSlashes } from "fresh";
import { type State } from "./utils.ts";

export const app = new App<State>();
app.use(staticFiles()).use(trailingSlashes("always"));

await fsRoutes(app, {
  dir: "./",
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

if (import.meta.main) {
  await app.listen();
}
