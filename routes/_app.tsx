import type { PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>xkcd.fyi</title>
        <link rel="stylesheet" href="/paper.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
