import { CreateTransactionInput } from "./types";

interface CategorySpec {
  categoryId: string;
  type: "income" | "expense";
  minMajor: number;
  maxMajor: number;
  minCount: number;
  maxCount: number;
}

/** Only the default category ids — sample data is meant to demonstrate the
 * app, not a particular user's custom categories. */
const MONTHLY_SPECS: CategorySpec[] = [
  { categoryId: "salary", type: "income", minMajor: 35000, maxMajor: 45000, minCount: 1, maxCount: 1 },
  { categoryId: "rental-income", type: "income", minMajor: 8000, maxMajor: 12000, minCount: 0, maxCount: 1 },
  { categoryId: "groceries", type: "expense", minMajor: 250, maxMajor: 900, minCount: 6, maxCount: 10 },
  { categoryId: "house", type: "expense", minMajor: 1500, maxMajor: 4000, minCount: 1, maxCount: 2 },
  { categoryId: "mortgage", type: "expense", minMajor: 12000, maxMajor: 18000, minCount: 1, maxCount: 1 },
  { categoryId: "car", type: "expense", minMajor: 400, maxMajor: 2500, minCount: 1, maxCount: 3 },
  { categoryId: "restaurant", type: "expense", minMajor: 150, maxMajor: 550, minCount: 2, maxCount: 6 },
  { categoryId: "shopping", type: "expense", minMajor: 200, maxMajor: 1400, minCount: 1, maxCount: 4 },
  { categoryId: "child", type: "expense", minMajor: 150, maxMajor: 700, minCount: 0, maxCount: 3 },
  { categoryId: "travel", type: "expense", minMajor: 500, maxMajor: 4000, minCount: 0, maxCount: 1 },
  { categoryId: "health", type: "expense", minMajor: 200, maxMajor: 1200, minCount: 0, maxCount: 2 },
  { categoryId: "entertainment", type: "expense", minMajor: 100, maxMajor: 450, minCount: 1, maxCount: 4 },
];

function randomInt(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function daysInMonth(month: string): number {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum, 0).getDate();
}

function randomDayInMonth(random: () => number, month: string, maxDay: number): string {
  const day = randomInt(random, 1, Math.min(maxDay, daysInMonth(month)));
  return `${month}-${String(day).padStart(2, "0")}`;
}

function monthKeyOffset(offset: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Generates realistic-looking, clearly fake household transactions spanning
 * several months (so month navigation has something to demonstrate) —
 * pure function, no repository/DB access, so the caller is responsible for
 * actually persisting the result (see IndexedDbFinanceRepository's
 * importTransactions). `random` is injectable so this is deterministically
 * testable, same convention as the sliding-puzzle tests' seededRandom.
 */
export function generateSampleTransactions(
  monthsBack = 3,
  random: () => number = Math.random,
): CreateTransactionInput[] {
  const today = new Date();
  const transactions: CreateTransactionInput[] = [];

  for (let offset = 0; offset <= monthsBack; offset++) {
    const month = monthKeyOffset(offset);
    // Don't backdate future days within the current (offset 0) month.
    const maxDay = offset === 0 ? today.getDate() : daysInMonth(month);

    for (const spec of MONTHLY_SPECS) {
      const count = randomInt(random, spec.minCount, spec.maxCount);
      for (let i = 0; i < count; i++) {
        transactions.push({
          type: spec.type,
          amountMinor: randomInt(random, spec.minMajor, spec.maxMajor) * 100,
          date: randomDayInMonth(random, month, maxDay),
          categoryId: spec.categoryId,
        });
      }
    }
  }

  return transactions;
}
