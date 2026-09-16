import { Link } from "react-router-dom";
import { useState } from "react";
import Desktop from "./desktop/Desktop";
import { GameStateProvider, useGameState } from "./engine/GameStateProvider";

/**
 * Case briefing — Emma's initial message. Intentionally still uses the
 * portfolio's dark styling (it's just text, before "the computer" appears)
 * but is NOT wrapped in the site's <Layout>, so the portfolio nav bar never
 * shows once you're here — see the layout-route split in App.tsx.
 */
function CaseBriefing({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-term-bg px-4 font-mono text-term-text">
      <div className="max-w-lg">
        <p className="mb-1 text-xs uppercase tracking-widest text-term-muted">Case #001</p>
        <h1 className="mb-6 text-2xl font-bold">The Last Message</h1>
        <p className="mb-4 text-sm leading-relaxed text-term-muted">
          Emma has been messaging you all morning. Her brother Leo went missing two days ago. The
          police have a case number and not much else. She thinks it&rsquo;s connected to something
          he found online.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-term-muted">
          His last message to her: <span className="italic text-term-text">&ldquo;I think I finally
          figured out what&rsquo;s going on. I&rsquo;ll tell you tomorrow.&rdquo;</span>
        </p>
        <p className="mb-8 text-sm leading-relaxed text-term-muted">
          She&rsquo;s sent you what she has. It&rsquo;s a start.
        </p>
        <button
          onClick={onBegin}
          className="w-full border border-term-green px-4 py-2 text-term-green hover:bg-term-green hover:text-term-bg"
        >
          Begin Investigation
        </button>
        <Link to="/" className="mt-4 block text-center text-xs text-term-muted hover:text-term-text">
          &larr; back to iamfara.com
        </Link>
      </div>
    </div>
  );
}

/** A quiet, dismissible signal that this vertical slice has reached its end. */
function SliceCompleteBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 border-b border-term-green bg-term-panel px-4 py-2 text-sm text-term-text">
      <span>
        You&rsquo;ve found the photo. That&rsquo;s the end of this part of the investigation &mdash;
        more of the case is still being built.
      </span>
      <button onClick={onDismiss} className="flex-shrink-0 text-term-muted hover:text-term-text">
        Dismiss
      </button>
    </div>
  );
}

function GameShell() {
  const { discoveredClues } = useGameState();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = discoveredClues.has("photo-2003-leo") && !bannerDismissed;

  return (
    <div className="relative h-screen w-screen">
      {showBanner && <SliceCompleteBanner onDismiss={() => setBannerDismissed(true)} />}
      <Desktop />
    </div>
  );
}

export default function DetectiveGame() {
  const [started, setStarted] = useState(false);

  return (
    <GameStateProvider>
      {started ? <GameShell /> : <CaseBriefing onBegin={() => setStarted(true)} />}
    </GameStateProvider>
  );
}
