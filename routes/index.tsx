import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";

async function getXkcd() {
  return await fetch("https://xkcd.com/info.0.json").then((r) => r.json());
}

export default async function Page() {
  const latestXkcd = await getXkcd();

  return (
    <>
      <Header />
      <Comic xkcd={latestXkcd} />
    </>
  );
}
