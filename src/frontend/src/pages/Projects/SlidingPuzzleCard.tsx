import { ArrowRight, Puzzle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card/Card";

export function SlidingPuzzleCard() {
  const navigate = useNavigate();
  return (
    <Card
      icon={<Puzzle className="h-6 w-6" />}
      title="Sliding Puzzle"
      description={
        <>
          <span className="inline-block mb-2 px-2 py-0.5 rounded-full border border-term-purple/50 text-term-purple text-[10px] font-semibold uppercase tracking-wide">
            Experiment
          </span>
          <br />A responsive image puzzle built with TypeScript and the
          Canvas API. It uses a testable game engine separated from
          rendering and input, and supports both built-in images and local
          image uploads.
          <br />
          <span className="mt-2 inline-block text-xs text-term-muted/80">
            TypeScript · React · Canvas API
          </span>
        </>
      }
      button={
        <button
          onClick={() => navigate("/sliding-puzzle")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-term-green hover:text-term-blue transition-colors"
        >
          play the puzzle <ArrowRight className="h-4 w-4" />
        </button>
      }
    />
  );
}
