import { useEffect } from "react";
import { useGameDispatch, useGameState } from "../../../engine/GameStateProvider";
import NorthstarChrome from "../../../fakeweb/components/NorthstarChrome";
import StylizedPhoto from "../../../fakeweb/components/StylizedPhoto";
import { FakeNavigate } from "../../../fakeweb/types";

const THUMBNAILS = [
  {
    url: "northstar.net/archive/2003/quad",
    caption: "spring quad, 2003",
    figures: [
      { id: "a", x: 20, y: 44 },
      { id: "b", x: 55, y: 44 },
      { id: "c", x: 72, y: 44 },
    ],
  },
  {
    url: "northstar.net/archive/2003/library",
    caption: "library steps",
    figures: [{ id: "a", x: 40, y: 44 }],
  },
  {
    url: "northstar.net/archive/2003/lab",
    caption: "the old CS lab",
    figures: [
      { id: "a", x: 30, y: 44 },
      { id: "b", x: 60, y: 44 },
    ],
  },
];

export default function NorthstarArchive2003({ navigate }: { navigate: FakeNavigate }) {
  const dispatch = useGameDispatch();
  const { discoveredClues } = useGameState();

  useEffect(() => {
    if (!discoveredClues.has("found-northstar")) {
      dispatch({ type: "DISCOVER_CLUE", clueId: "found-northstar" });
    }
    // Only ever needs to fire once, the first time this page is reached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NorthstarChrome pageTitle="2003 Archive" navigate={navigate}>
      <h2 className="mb-4 text-lg font-bold">2003 Archive</h2>
      <p className="mb-4 text-sm">A few photos from that year. Click one to view it full size.</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {THUMBNAILS.map((thumb) => (
          <button key={thumb.url} onClick={() => navigate(thumb.url)} className="text-left">
            <StylizedPhoto figures={thumb.figures} caption={thumb.caption} className="w-full" />
          </button>
        ))}
      </div>
    </NorthstarChrome>
  );
}
