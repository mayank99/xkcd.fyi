import { HttpError } from "fresh";
import { getXkcd } from "../api/getXkcd.ts";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";

export default async function Page() {
  const latestXkcd = await getXkcd();
  if (!latestXkcd) throw new HttpError(404);

  return (
    <>
      <Header />
      <Comic xkcd={latestXkcd} />
    </>
  );
}
