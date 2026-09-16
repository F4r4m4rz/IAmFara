import { useState } from "react";
import { useGameDispatch } from "../../../engine/GameStateProvider";
import NorthstarChrome from "../../../fakeweb/components/NorthstarChrome";
import StylizedPhoto from "../../../fakeweb/components/StylizedPhoto";
import { FakeNavigate } from "../../../fakeweb/types";

const FIGURES = [
  { id: "student-a", x: 18, y: 44 },
  { id: "student-b", x: 38, y: 44, scale: 1.1 },
  { id: "leo", x: 74, y: 42, scale: 0.85 },
];

export default function PhotoQuad2003({ navigate }: { navigate: FakeNavigate }) {
  const dispatch = useGameDispatch();
  const [inspected, setInspected] = useState(false);

  const handleFigureClick = () => {
    setInspected(true);
    dispatch({ type: "DISCOVER_CLUE", clueId: "photo-2003-leo" });
  };

  return (
    <NorthstarChrome pageTitle="Spring Quad, 2003" navigate={navigate}>
      <button onClick={() => navigate("northstar.net/archive/2003")} className="mb-4 text-sm text-[#2b1f6b] underline">
        &laquo; Back to 2003 Archive
      </button>
      <h2 className="mb-2 text-lg font-bold">Spring Quad, 2003</h2>
      <p className="mb-4 text-sm">
        Taken outside the main quad, sometime in April. A few people from my program are in the
        background. Click on someone in the photo to take a closer look.
      </p>
      <StylizedPhoto
        figures={FIGURES}
        interactiveFigureId="leo"
        onFigureClick={handleFigureClick}
        caption="spring quad, april 2003"
        className="w-full max-w-md"
      />
      {inspected && (
        <div className="mt-4 max-w-md border-2 border-[#7a1f1f] bg-[#f7e6e6] p-3 text-sm text-[#5c1a1a]">
          <p className="font-bold">Wait.</p>
          <p>
            That person in the background&mdash;that looks exactly like Leo. But this photo is
            dated 2003. Leo would have been a child in 2003.
          </p>
          <p className="mt-1">This shouldn&rsquo;t be possible.</p>
        </div>
      )}
    </NorthstarChrome>
  );
}
