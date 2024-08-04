import type { ComponentProps } from "preact";
import { Switch } from "../components/Switch.tsx";
import { IS_BROWSER } from "fresh/runtime";

const initialTheme = (() => {
	if (!IS_BROWSER) return undefined;

	const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;

	let theme = prefersDark ? "dark" : "light";

	try {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			theme = savedTheme;
		}
	} catch { /* */ }

	document.documentElement.dataset.theme = theme;

	return theme;
})();

export function ThemeSwitcher(props: ComponentProps<"form">) {
	return (
		<form
			{...props}
			onChange={({ target }) => {
				if (
					!(target instanceof HTMLInputElement) || target.name !== "dark-mode"
				) return;

				const theme = target.checked ? "dark" : "light";
				document.documentElement.dataset.theme = theme;
				try {
					localStorage.setItem("theme", theme);
				} catch { /* */ }
			}}
		>
			<Switch
				label="Dark mode"
				disabled={!IS_BROWSER}
				name="dark-mode"
				defaultChecked={initialTheme === "dark"}
			/>
		</form>
	);
}
