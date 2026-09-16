import NorthstarChrome from "../../../fakeweb/components/NorthstarChrome";
import { FakeNavigate } from "../../../fakeweb/types";

export default function NorthstarHome({ navigate }: { navigate: FakeNavigate }) {
  return (
    <NorthstarChrome pageTitle="Home" navigate={navigate}>
      <p className="mb-4">
        Welcome to <strong>Northstar Archive</strong>! This site is a home for photos taken by
        myself and a few friends around campus over the years. Mostly just stuff we thought
        looked cool. Feel free to look around :)
      </p>
      <p className="mb-4">
        <button onClick={() => navigate("northstar.net/archive/2003")} className="text-[#2b1f6b] underline">
          &raquo; View the 2003 Archive
        </button>
      </p>
      <p className="text-sm text-[#5c5540]">
        This page hasn&rsquo;t been updated in a while. Sorry about the dead links.
      </p>
      <hr className="my-6 border-[#a89f86]" />
      <p className="text-xs text-[#5c5540]">
        Site maintained by a Computer Science student, back when everyone had one of these.
        Contact info removed.
      </p>
    </NorthstarChrome>
  );
}
