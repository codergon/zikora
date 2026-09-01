import { Transaction, TransactionPage } from "./models";

export type FetchTransactionPage = (
  cursor: string | null,
) => Promise<TransactionPage>;

export function mergeTransactions(...groups: Transaction[][]): Transaction[] {
  const transactionsById = new Map<string, Transaction>();

  for (const group of groups) {
    for (const transaction of group) {
      if (!transactionsById.has(transaction.id)) {
        transactionsById.set(transaction.id, transaction);
      }
    }
  }

  return [...transactionsById.values()].sort((left, right) => {
    const timeDifference =
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
    return timeDifference || left.id.localeCompare(right.id);
  });
}

export class TransactionFeed {
  private transactions: Transaction[];
  private nextCursor: string | null = null;
  private loading = false;
  private loadedPage = false;

  constructor(initialTransactions: Transaction[] = []) {
    this.transactions = mergeTransactions(initialTransactions);
  }

  get items(): readonly Transaction[] {
    return this.transactions;
  }

  get cursor(): string | null {
    return this.nextCursor;
  }

  async loadNext(fetchPage: FetchTransactionPage): Promise<boolean> {
    if (this.loading || (this.loadedPage && this.nextCursor === null)) {
      return false;
    }

    this.loading = true;
    try {
      const page = await fetchPage(this.nextCursor);
      this.transactions = mergeTransactions(this.transactions, page.items);
      this.nextCursor = page.nextCursor;
      this.loadedPage = true;
      return true;
    } finally {
      this.loading = false;
    }
  }

  async refresh(fetchPage: FetchTransactionPage): Promise<boolean> {
    if (this.loading) {
      return false;
    }

    this.loading = true;
    try {
      const page = await fetchPage(null);
      this.transactions = mergeTransactions(page.items, this.transactions);
      this.nextCursor = page.nextCursor;
      this.loadedPage = true;
      return true;
    } catch {
      return false;
    } finally {
      this.loading = false;
    }
  }
}
