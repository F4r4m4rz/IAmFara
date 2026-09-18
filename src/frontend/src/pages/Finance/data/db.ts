import Dexie, { Table } from "dexie";
import { Category, FinanceSettings, FixedExpensePeriodOverride, FixedMonthlyExpense, Transaction } from "../domain/types";

export interface SettingsRecord extends FinanceSettings {
  id: string;
}

export class FinanceDb extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  settings!: Table<SettingsRecord, string>;
  fixedExpenses!: Table<FixedMonthlyExpense, string>;
  periodOverrides!: Table<FixedExpensePeriodOverride, [string, string]>;

  constructor(name = "iamfara-finance-demo") {
    super(name);
    this.version(1).stores({
      transactions: "id, date, categoryId, type",
      categories: "id, type",
    });
    // Additive migration — existing transactions/categories are untouched;
    // this only adds a table for the financial-period-start-day setting
    // (see domain/financialPeriod.ts).
    this.version(2).stores({
      settings: "id",
    });
    // Additive migration for Fixed Monthly Expenses. periodOverrides uses a
    // compound primary key [fixedExpenseId+periodId] — one override row per
    // (expense, period) pair, looked up by periodId when a period is being
    // displayed.
    this.version(3).stores({
      fixedExpenses: "id, categoryId, isActive",
      periodOverrides: "[fixedExpenseId+periodId], periodId",
    });
  }
}
