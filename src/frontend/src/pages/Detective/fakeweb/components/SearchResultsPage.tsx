import { FakeSearchResult } from "../types";

/** Generic search.local results template — reusable by any case. */
export default function SearchResultsPage({
  query,
  results,
  onResultClick,
}: {
  query: string;
  results: FakeSearchResult[];
  onResultClick: (url: string) => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <p className="mb-4 text-sm text-term-muted">
        Results for <span className="text-term-text">&ldquo;{query}&rdquo;</span>
      </p>
      {results.length === 0 ? (
        <p className="text-term-muted">No results found.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.url}>
              <button
                onClick={() => onResultClick(result.url)}
                className="text-left text-term-blue hover:underline"
              >
                {result.title}
              </button>
              <p className="text-xs text-term-muted">{result.url}</p>
              <p className="text-sm text-term-text">{result.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
