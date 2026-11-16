// Not every comic has a 2x image. Runs in <head> so it is listening before any image fails.
document.addEventListener(
	"error",
	({ target }) => {
		if (target instanceof HTMLImageElement) target.removeAttribute("srcset");
	},
	true,
);
