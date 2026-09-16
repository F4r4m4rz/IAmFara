import { Globe, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import BrowserApp from "../apps/Browser/BrowserApp";
import ImageViewerApp from "../apps/ImageViewer/ImageViewerApp";

type AppId = "browser" | "image-viewer";

const APPS: { id: AppId; label: string; icon: typeof Globe }[] = [
  { id: "browser", label: "Browser", icon: Globe },
  { id: "image-viewer", label: "Photos", icon: ImageIcon },
];

/**
 * The fake desktop shell. Deliberately not a real windowing system — apps
 * are full-viewport panels switched via the taskbar, not draggable/
 * resizable/overlapping windows. That gets nearly all of "you're sitting at
 * a computer" for a fraction of the engineering a real window manager would
 * need, which matters for a 15-30 minute game.
 */
export default function Desktop() {
  const [activeApp, setActiveApp] = useState<AppId>("browser");

  return (
    <div className="flex h-screen w-screen flex-col bg-term-bg font-mono">
      <div className="flex-1 overflow-hidden">
        {activeApp === "browser" && <BrowserApp />}
        {activeApp === "image-viewer" && <ImageViewerApp />}
      </div>

      <nav className="flex items-center gap-1 border-t border-term-border bg-term-panel px-3 py-2">
        {APPS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveApp(id)}
            aria-pressed={activeApp === id}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm ${
              activeApp === id ? "bg-term-border text-term-text" : "text-term-muted hover:text-term-text"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
