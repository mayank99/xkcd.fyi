import { getXkcd } from "../api/getXkcd.ts";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";

export default async function Page() {
  const latestXkcd = await getXkcd();

  return (
    <>
      <Header />
      <Comic xkcd={latestXkcd} />
    </>
  );
}
