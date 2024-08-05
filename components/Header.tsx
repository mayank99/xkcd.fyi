import { ThemeSwitcher } from "../islands/ThemeSwitcher.tsx";

export function Header() {
	return (
		<header class="container container-sm margin-top-large row flex-middle flex-edges">
			<div class="isthisalogo">xkcd.fyi</div>
			<ThemeSwitcher />
		</header>
	);
}
