import { Search } from "lucide-react";
import { ReactNode, useState } from "react";
import { useGameDispatch, useGameState } from "../../engine/GameStateProvider";

/**
 * Emma's screenshot of Leo's last conversation, rendered as an actual chat
 * UI (not a bitmap image) — this game ships with no photographic assets.
 * One message contains a partial URL, deliberately small/easy to skim past
 * at normal size; the player has to actively zoom in to read it, which is
 * the point of this puzzle (notice the detail, don't just read past it).
 */
function ChatBubble({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <div className={`max-w-[75%] rounded-2xl rounded-bl-sm bg-[#3a3a3c] px-3 py-2 text-sm text-white ${muted ? "opacity-90" : ""}`}>
      {children}
    </div>
  );
}

export default function ImageViewerApp() {
  const dispatch = useGameDispatch();
  const { discoveredClues } = useGameState();
  const [zoomed, setZoomed] = useState(false);

  const handleZoom = () => {
    setZoomed(true);
    dispatch({ type: "DISCOVER_CLUE", clueId: "screenshot-url-fragment" });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-term-bg px-4 py-8">
      <p className="text-sm text-term-muted">screenshot_leo_chat.png &mdash; sent by Emma</p>

      <div className="w-full max-w-sm rounded-xl border border-term-border bg-[#1c1c1e] shadow-xl">
        <div className="border-b border-term-border px-4 py-3 text-center text-sm font-semibold text-white">Leo</div>
        <div className="flex flex-col gap-2 px-4 py-4">
          <ChatBubble>you still there?</ChatBubble>

          <div className="relative flex items-start gap-1">
            <ChatBubble muted>
              check this out, found it going through some old bookmarks...
              <span className="block text-[10px] leading-tight text-term-muted">
                northstar.net/arch&#8203;&hellip;&#8203;2003
              </span>
            </ChatBubble>
            <button
              onClick={handleZoom}
              aria-label="Zoom in on this message"
              className="mt-1 flex-shrink-0 rounded-full border border-term-border bg-term-panel p-1 text-term-blue hover:border-term-blue"
            >
              <Search size={14} />
            </button>
          </div>

          <ChatBubble>i think i finally figured out what&rsquo;s going on. i&rsquo;ll tell you tomorrow.</ChatBubble>
        </div>
      </div>

      {zoomed && (
        <div className="w-full max-w-sm border-2 border-term-blue bg-term-panel p-4">
          <p className="mb-1 text-xs text-term-muted">Zoomed in:</p>
          <p className="break-all text-lg text-term-text">northstar.net/archive/2003</p>
          <p className="mt-2 text-sm text-term-muted">
            That&rsquo;s a full URL, once you can actually read it. Worth trying in a browser.
          </p>
        </div>
      )}

      {discoveredClues.has("screenshot-url-fragment") && !zoomed && (
        <p className="text-xs text-term-green">Clue already found &mdash; open it again above to re-read it.</p>
      )}
    </div>
  );
}
