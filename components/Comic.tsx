export function Comic({ xkcd }: { xkcd: Record<string, string> }) {
	const { num, title, img, alt } = xkcd;

	return (
		<main class="paper container container-sm border margin-top-large margin-bottom-large">
			<div class="hero section">
				<h1>#{num}: {title}</h1>
				<img
					src={img}
					alt="XKCD comic, described below."
					class="no-border"
				/>
				<p>{alt}</p>
			</div>

			<details>
				<summary>Transcript</summary>
				<p>TODO</p>
			</details>

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
