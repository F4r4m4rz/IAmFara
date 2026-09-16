import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { FormEvent, useState } from "react";
import { CASE_001_PAGES, CASE_001_SEARCH_ENTRIES } from "../../cases/case-001/caseDefinition";
import SearchResultsPage from "../../fakeweb/components/SearchResultsPage";
import { buildSearchUrl, parseSearchQuery, searchFakeWeb } from "../../fakeweb/search";
import { normalizeUrl, resolveUrl } from "../../fakeweb/resolveUrl";

// The browser opens on search.local, not Northstar itself — the whole point
// of puzzles 1-2 is that the player has to discover and navigate to
// Northstar themselves; starting there would hand them the answer.
const HOME_URL = "search.local";

function SearchLanding({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h2 className="mb-6 text-2xl text-term-text">search.local</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (query.trim()) onSearch(query.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search..."
          className="flex-1 border border-term-border bg-term-panel px-3 py-2 text-term-text outline-none focus:border-term-blue"
          autoFocus
        />
        <button type="submit" className="border border-term-border bg-term-panel px-4 py-2 text-term-text hover:border-term-blue">
          Search
        </button>
      </form>
    </div>
  );
}

function NotFoundPage({ url }: { url: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-term-muted">
      <p className="mb-2 text-lg text-term-text">This page can&rsquo;t be reached.</p>
      <p className="text-sm">
        <span className="text-term-orange">{url}</span> took too long to respond, or doesn&rsquo;t exist.
      </p>
    </div>
  );
}

export default function BrowserApp() {
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [addressInput, setAddressInput] = useState(HOME_URL);

  const currentUrl = history[historyIndex];

  const navigate = (rawUrl: string) => {
    const normalized = normalizeUrl(rawUrl);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), normalized]);
    setHistoryIndex((prev) => prev + 1);
    setAddressInput(normalized);
  };

  const goBack = () => {
    if (historyIndex === 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setAddressInput(history[nextIndex]);
  };

  const goForward = () => {
    if (historyIndex === history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setAddressInput(history[nextIndex]);
  };

  const handleAddressSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate(addressInput);
  };

  const searchQuery = parseSearchQuery(currentUrl);

  const renderContent = () => {
    if (searchQuery !== null) {
      if (searchQuery === "") return <SearchLanding onSearch={(q) => navigate(buildSearchUrl(q))} />;
      const results = searchFakeWeb(searchQuery, CASE_001_SEARCH_ENTRIES);
      return <SearchResultsPage query={searchQuery} results={results} onResultClick={navigate} />;
    }

    const page = resolveUrl(currentUrl, CASE_001_PAGES);
    if (!page) return <NotFoundPage url={currentUrl} />;
    return page.render(navigate);
  };

  return (
    <div className="flex h-full flex-col bg-term-bg">
      <div className="flex items-center gap-2 border-b border-term-border bg-term-panel px-3 py-2">
        <button
          onClick={goBack}
          disabled={historyIndex === 0}
          aria-label="Back"
          className="rounded p-1 text-term-text disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
          aria-label="Forward"
          className="rounded p-1 text-term-text disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => navigate(currentUrl)}
          aria-label="Reload"
          className="rounded p-1 text-term-text"
        >
          <RotateCw size={14} />
        </button>
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <input
            value={addressInput}
            onChange={(event) => setAddressInput(event.target.value)}
            className="w-full rounded border border-term-border bg-term-bg px-3 py-1 text-sm text-term-text outline-none focus:border-term-blue"
            aria-label="Address bar"
          />
        </form>
      </div>
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
}
