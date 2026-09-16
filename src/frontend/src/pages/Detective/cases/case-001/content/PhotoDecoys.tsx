import NorthstarChrome from "../../../fakeweb/components/NorthstarChrome";
import StylizedPhoto from "../../../fakeweb/components/StylizedPhoto";
import { FakeNavigate } from "../../../fakeweb/types";

/**
 * Decoy photo pages — pure atmosphere and red herrings, so the "find the
 * right photo" puzzle (PhotoQuad2003) isn't the only page in the gallery.
 * Nothing here discovers a clue; that's the point.
 */

function DecoyPage({
  navigate,
  title,
  figures,
  body,
}: {
  navigate: FakeNavigate;
  title: string;
  figures: { id: string; x: number; y: number; scale?: number }[];
  body: string;
}) {
  return (
    <NorthstarChrome pageTitle={title} navigate={navigate}>
      <button onClick={() => navigate("northstar.net/archive/2003")} className="mb-4 text-sm text-[#2b1f6b] underline">
        &laquo; Back to 2003 Archive
      </button>
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      <p className="mb-4 text-sm">{body}</p>
      <StylizedPhoto figures={figures} caption={title.toLowerCase()} className="w-full max-w-md" />
    </NorthstarChrome>
  );
}

export function PhotoLibrary2002({ navigate }: { navigate: FakeNavigate }) {
  return (
    <DecoyPage
      navigate={navigate}
      title="Library Steps"
      figures={[{ id: "a", x: 40, y: 44 }]}
      body="One of the first photos I ever took with the new camera. The light was nice that day."
    />
  );
}

export function PhotoLab2001({ navigate }: { navigate: FakeNavigate }) {
  return (
    <DecoyPage
      navigate={navigate}
      title="The Old CS Lab"
      figures={[
        { id: "a", x: 30, y: 44 },
        { id: "b", x: 60, y: 44 },
      ]}
      body="Late night in the lab, finishing an assignment that was due at midnight. Miss these machines."
    />
  );
}
