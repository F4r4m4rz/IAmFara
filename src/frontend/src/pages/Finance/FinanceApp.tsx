import { useState } from "react";
import FinanceAppShell from "./FinanceAppShell";
import { IndexedDbFinanceRepository } from "./data/IndexedDbFinanceRepository";

/**
 * Top-level route for the finance demo (`/expenses/demo`). Deliberately not
 * wrapped in the portfolio's <Layout> (see App.tsx) — see FinanceAppShell,
 * which renders its own full-viewport shell with a bottom nav, so it feels
 * like its own app rather than a section of the portfolio.
 */
export default function FinanceApp() {
  // Created once per mount, not at module scope — avoids holding a Dexie
  // connection open for the lifetime of the whole site when the user has
  // never visited the finance app.
  const [repository] = useState(() => new IndexedDbFinanceRepository());

  return <FinanceAppShell repository={repository} basePath="/expenses/demo" />;
}
