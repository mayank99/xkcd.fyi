import { parseHTML } from "linkedom";

export async function getTranscript(number: number) {
	const url = `https://explainxkcd.com/wiki/index.php/${number}`;
	const page = await fetch(url).then((r) => r.ok ? r.text() : "");
	if (!page) return "";

	const { document } = parseHTML(page);
	let transcript = "";

	const heading = document.getElementById("Transcript")?.closest(
		"h1, h2, h3, h4",
	);

	let element = heading;

	while (true) {
		element = element?.nextElementSibling;
		if (!element) break;
		if (element.id === "Discussion") break;
		if (element.localName === "table") continue;
		if (["h1", "h2", "h3", "h4", "h5"].includes(element.localName)) break;

		transcript += element.outerHTML;
	}

	transcript = transcript.replaceAll("dl>", "div>").replaceAll("dd>", "p>");

	return transcript;
}
