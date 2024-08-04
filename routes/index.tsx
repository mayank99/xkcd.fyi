import { ThemeSwitcher } from "../islands/ThemeSwitcher.tsx";

async function getXkcd() {
  return await fetch("https://xkcd.com/info.0.json").then((r) => r.json());
}

export default async function Page() {
  const { num, title, img, alt } = await getXkcd();

  return (
    <>
      <header class="container container-sm margin-top-large row flex-middle flex-edges">
        <div class="isthisalogo">xkcd.fyi</div>
        <ThemeSwitcher />
      </header>

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
    </>
  );
}
