import Dexie, { Table } from "dexie";
import { Category, Transaction } from "../domain/types";

export class FinanceDb extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;

  constructor(name = "iamfara-finance-demo") {
    super(name);
    this.version(1).stores({
      transactions: "id, date, categoryId, type",
      categories: "id, type",
    });
  }
}
