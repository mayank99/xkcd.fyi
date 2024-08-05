import { HttpError } from "fresh";
import { getXkcd } from "../api/getXkcd.ts";
import { Comic } from "../components/Comic.tsx";
import { Header } from "../components/Header.tsx";
import { getTranscript } from "../api/getTranscript.ts";
import { Transcript } from "../components/Transcript.tsx";

export default async function Page() {
  const latestXkcd = await getXkcd();
  if (!latestXkcd) throw new HttpError(404);
  const transcript = await getTranscript(latestXkcd);

  return (
    <>
      <Header />
      <Comic xkcd={latestXkcd} transcript={<Transcript {...transcript} />} />
    </>
  );
}
