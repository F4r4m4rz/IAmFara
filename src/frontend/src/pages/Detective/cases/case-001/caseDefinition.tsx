import { FakePage, FakeSearchEntry } from "../../fakeweb/types";
import NorthstarArchive2003 from "./content/NorthstarArchive2003";
import NorthstarHome from "./content/NorthstarHome";
import { PhotoLab2001, PhotoLibrary2002 } from "./content/PhotoDecoys";
import PhotoQuad2003 from "./content/PhotoQuad2003";

/**
 * Case #001 — "The Last Message". Everything specific to this case's story
 * content lives here and under ./content — the desktop shell, browser, and
 * fakeweb resolver in the surrounding folders know nothing about Leo,
 * Emma, or Northstar. A future case-002 would be a sibling folder providing
 * its own page/search registry, wired in wherever DetectiveGame currently
 * hardcodes case-001 (see DetectiveGame.tsx) — no loader/registry system
 * needed until a second case actually exists to prove that boundary right.
 *
 * Each page's render() must return JSX (an element), not a plain function
 * call — calling a component as `Component(props)` instead of
 * `<Component {...props} />` would skip React's own element/fiber for it,
 * so any hooks used inside (useState, useGameDispatch, etc.) would attach
 * to whichever component actually invokes render() instead, breaking the
 * rules of hooks the moment two pages with different hooks are swapped
 * between navigations.
 */
export const CASE_001_PAGES: Record<string, FakePage> = {
  "northstar.net": {
    url: "northstar.net",
    title: "Northstar Archive",
    render: (navigate) => <NorthstarHome navigate={navigate} />,
  },
  "northstar.net/archive/2003": {
    url: "northstar.net/archive/2003",
    title: "Northstar Archive — 2003",
    render: (navigate) => <NorthstarArchive2003 navigate={navigate} />,
  },
  "northstar.net/archive/2003/quad": {
    url: "northstar.net/archive/2003/quad",
    title: "Spring Quad, 2003",
    render: (navigate) => <PhotoQuad2003 navigate={navigate} />,
  },
  "northstar.net/archive/2003/library": {
    url: "northstar.net/archive/2003/library",
    title: "Library Steps",
    render: (navigate) => <PhotoLibrary2002 navigate={navigate} />,
  },
  "northstar.net/archive/2003/lab": {
    url: "northstar.net/archive/2003/lab",
    title: "The Old CS Lab",
    render: (navigate) => <PhotoLab2001 navigate={navigate} />,
  },
};

export const CASE_001_SEARCH_ENTRIES: FakeSearchEntry[] = [
  {
    keywords: ["northstar", "archive 2003", "2003 archive", "photography archive"],
    results: [
      {
        title: "Northstar Archive — 2003",
        url: "northstar.net/archive/2003",
        snippet: "A photography & student archive. Photos from 2003, mostly around campus.",
      },
    ],
  },
  {
    keywords: ["archive"],
    results: [
      {
        title: "Northstar Archive",
        url: "northstar.net",
        snippet: "A photography & student archive.",
      },
      {
        title: "CloudVault Personal Backup",
        url: "cloudvault.local",
        snippet: "Store your photos, documents, and memories safely in the cloud. Sign up free.",
      },
    ],
  },
];
