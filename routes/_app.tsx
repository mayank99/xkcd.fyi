import { define } from "../utils.ts";

export default define.page(({ Component, state }) => {
  const title = `${state.title ? `${state.title} | ` : ""} xkcd.fyi`;

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <link rel="stylesheet" href="/paper.css" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
