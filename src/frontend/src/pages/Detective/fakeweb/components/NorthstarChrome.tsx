import { ReactNode } from "react";
import { FakeNavigate } from "../types";

/**
 * Shared page chrome for every "northstar.net" page — deliberately the
 * opposite of this site's own dark "terminal" aesthetic (see
 * tailwind.config.js's term-* palette): a light, garish, table-layout-era
 * amateur photography site circa 2003. Serif body font, a tiled-looking
 * gradient header, a fake hit counter, harsh borders. This visual contrast
 * with the rest of the app (both the portfolio and the modern OS chrome
 * around it) is intentional — Northstar should look like it doesn't belong.
 */
export default function NorthstarChrome({
  pageTitle,
  children,
  hitCount = 4821,
  navigate,
}: {
  pageTitle: string;
  children: ReactNode;
  hitCount?: number;
  navigate: FakeNavigate;
}) {
  return (
    <div className="min-h-full bg-[#d7d3e0] font-serif text-[#1a1a1a]">
      <header className="border-b-4 border-[#4b3f72] bg-gradient-to-r from-[#6a5aa8] to-[#8a7ac0] px-6 py-4 text-center text-white shadow">
        <h1 className="text-2xl font-bold tracking-wide" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
          ☆ Northstar Archive ☆
        </h1>
        <p className="text-xs italic text-[#e8e4f5]">a photography &amp; student archive</p>
      </header>

      <nav className="flex flex-wrap items-center gap-1 border-b-2 border-[#4b3f72] bg-[#efe9d8] px-4 py-2 text-sm">
        {[
          { label: "Home", url: "northstar.net" },
          { label: "2003 Archive", url: "northstar.net/archive/2003" },
        ].map((item) => (
          <button
            key={item.url}
            onClick={() => navigate(item.url)}
            className="border border-[#a89f86] bg-[#f7f3e6] px-2 py-0.5 hover:bg-[#fffef8]"
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#5c5540]">{pageTitle}</span>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <footer className="border-t-2 border-[#4b3f72] bg-[#efe9d8] px-4 py-3 text-center text-xs text-[#5c5540]">
        <p>Best viewed at 800x600. Last updated 2003.</p>
        <p>You are visitor #{hitCount.toLocaleString()}</p>
      </footer>
    </div>
  );
}
