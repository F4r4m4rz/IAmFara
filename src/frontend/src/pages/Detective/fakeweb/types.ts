import { ReactNode } from "react";

/** A page can navigate the fake browser by URL, just like a real link. */
export type FakeNavigate = (url: string) => void;

/** One page of the fictional internet, keyed by its normalized URL. */
export interface FakePage {
  /** Canonical URL as typed/displayed, e.g. "northstar.net/archive/2003". */
  url: string;
  title: string;
  render: (navigate: FakeNavigate) => ReactNode;
}

/** search.local's index of what a query should surface. */
export interface FakeSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface FakeSearchEntry {
  /** Lowercase keywords; a query matches if it contains any of these. */
  keywords: string[];
  results: FakeSearchResult[];
}
