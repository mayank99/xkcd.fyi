import { ThemeSwitcher } from "../islands/ThemeSwitcher.tsx";

export function Header() {
	return (
		<header class="container container-sm margin-top-large row flex-middle flex-edges">
			<a href="/" class="isthisalogo">xkcd.fyi</a>
			<ThemeSwitcher />
		</header>
	);
}
