import type { ComponentProps, VNode } from "preact";
import type { XkcdComic } from "../api/getXkcd.ts";

export function Comic(
	{ xkcd, transcript }: { xkcd: XkcdComic; transcript?: VNode },
) {
	const { num, title, img, alt } = xkcd;

	return (
		<main class="paper container container-sm border margin-top-large margin-bottom-large">
			<div class="hero">
				<hgroup role="group" class="margin-bottom-large">
					<h1>#{num}: {title}</h1>
					<a class="permalink margin-left" href={`/${num}`}>
						<span class="visually-hidden">Permalink</span>
						<LinkIcon aria-hidden="true" />
					</a>
				</hgroup>

				<img
					src={img}
					alt="XKCD comic, described below."
					srcset={`${img.replace(".png", "_2x.png")} 2x`}
					class="no-border"
					onerror="this.removeAttribute('srcset');this.removeAttribute('onerror');"
				/>

				<div class="transcript-container">{transcript}</div>

				<p>
					<span class="visually-hidden">Title text:</span>
					{alt}
				</p>

				<hr />
			</div>

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

const LinkIcon = (props: ComponentProps<"svg">) => {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				fill="currentColor"
				d="M15.729 3.884c1.434-1.44 3.532-1.47 4.693-.304c1.164 1.168 1.133 3.28-.303 4.72l-2.423 2.433a.75.75 0 0 0 1.062 1.059l2.424-2.433c1.911-1.919 2.151-4.982.303-6.838c-1.85-1.857-4.907-1.615-6.82.304L9.819 7.692c-1.911 1.919-2.151 4.982-.303 6.837a.75.75 0 1 0 1.063-1.058c-1.164-1.168-1.132-3.28.303-4.72z"
			/>
			<path
				fill="currentColor"
				d="M14.485 9.47a.75.75 0 0 0-1.063 1.06c1.164 1.168 1.133 3.279-.303 4.72l-4.847 4.866c-1.435 1.44-3.533 1.47-4.694.304c-1.164-1.168-1.132-3.28.303-4.72l2.424-2.433a.75.75 0 0 0-1.063-1.059l-2.424 2.433c-1.911 1.92-2.151 4.982-.303 6.838c1.85 1.858 4.907 1.615 6.82-.304l4.847-4.867c1.911-1.918 2.151-4.982.303-6.837"
			/>
		</svg>
	);
};
