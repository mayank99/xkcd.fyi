import { HttpError } from "../utils.ts";
import { Header } from "../components/Header.tsx";

export default function ErrorPage({ error }: { error: unknown }) {
	let h1 = "Something went wrong…";

	if (error instanceof HttpError && error.status === 404) {
		h1 = "Error 404: Page not found";
	}

	return (
		<>
			<Header />

			<main class="container container-sm margin-top-large margin-bottom-large">
				<h1>{h1}</h1>
			</main>
		</>
	);
}
