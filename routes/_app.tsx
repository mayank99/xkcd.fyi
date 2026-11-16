import { asset, clientModule, importMap } from "../client.ts";
import type { ComponentChildren } from "preact";

export default function App(props: { title?: string; children: ComponentChildren }) {
	const title = `${props.title ? `${props.title} | ` : ""} xkcd.fyi`;

	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<meta property="og:title" content={title} />
				<link rel="stylesheet" href={asset("/paper.css")} />
				<link rel="stylesheet" href={asset("/styles.css")} />
				<script src={asset("/img-fallback.js")} />
				<script type="importmap" dangerouslySetInnerHTML={{ __html: importMap }} />
				<link rel="modulepreload" href={clientModule("components/Switch.tsx")} />
				<script type="module" src={clientModule("islands/ThemeSwitcher.tsx")} />
			</head>
			<body>
				{props.children}
			</body>
		</html>
	);
}
