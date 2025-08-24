export function Transcript({ text, html }: { text?: string; html?: string }) {
	if (!text && !html) return null;

	text = text?.split("\n").filter((line) => !line.startsWith("{{Title text:"))
		.join("\n");

	const transcriptContents = text
		? <p class="white-space-preserve">{text}</p>
		: html
		? <div dangerouslySetInnerHTML={{ __html: html }} />
		: "";

	return transcriptContents
		? (
			<details>
				<summary>Transcript</summary>
				{transcriptContents}
				{html && (
					<p class="text-right">
						<small>
							(Sourced from <a href="https://explainxkcd.com">explainxkcd.com</a>)
						</small>
					</p>
				)}
			</details>
		)
		: null;
}
