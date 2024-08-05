import type { VNode } from "preact";
import type { XkcdComic } from "../api/getXkcd.ts";

export function Comic(
	{ xkcd, transcript }: { xkcd: XkcdComic; transcript?: VNode },
) {
	const { num, title, img, alt } = xkcd;

	return (
		<main class="paper container container-sm border margin-top-large margin-bottom-large">
			<div class="hero section">
				<hgroup class="margin-bottom-large">
					<h1>#{num}: {title}</h1>
					<a class="permalink margin-left" href={`/${num}`}>
						<span class="visually-hidden">Permalink</span>
					</a>
				</hgroup>

				<img
					src={img}
					alt="XKCD comic, described below."
					class="no-border"
				/>

				<p>{alt}</p>
			</div>

			{transcript}

			<div class="row margin-top-large">
				<a
					href={`https://explainxkcd.com/wiki/index.php/${num}`}
					class="paper-btn margin-right"
				>
					Explain
				</a>
				<a href={`https://xkcd.com/${num}`} class="paper-btn">Original</a>
			</div>
		</main>
	);
}
