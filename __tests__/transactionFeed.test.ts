import { Transaction } from "../src/domain/models";
import {
  FetchTransactionPage,
  mergeTransactions,
  TransactionFeed,
} from "../src/domain/transactions";

function transaction(
  id: string,
  occurredAt: string,
  title = `Transaction ${id}`,
): Transaction {
  return {
    id,
    occurredAt,
    title,
    amountMinor: 10_000,
    direction: "credit",
    category: "transfer",
  };
}

describe("transaction pagination", () => {
  test("deduplicates transactions and sorts equal timestamps by ID", () => {
    const time = "2026-08-30T09:00:00.000Z";
    const older = transaction("duplicate", "2026-08-29T09:00:00.000Z");
    const updated = { ...older, title: "Updated transaction" };

    expect(
      mergeTransactions(
        [updated, transaction("b", time)],
        [older, transaction("a", time)],
      ),
    ).toEqual([
      transaction("a", time),
      transaction("b", time),
      updated,
    ]);
  });

  test("loads bounded pages in cursor order and stops at the final page", async () => {
    const first = transaction("first", "2026-08-30T09:00:00.000Z");
    const second = transaction("second", "2026-08-29T09:00:00.000Z");
    const fetchPage: FetchTransactionPage = jest
      .fn()
      .mockResolvedValueOnce({ items: [first], nextCursor: "1" })
      .mockResolvedValueOnce({ items: [second], nextCursor: null });
    const feed = new TransactionFeed();

    await expect(feed.loadNext(fetchPage)).resolves.toBe(true);
    await expect(feed.loadNext(fetchPage)).resolves.toBe(true);
    await expect(feed.loadNext(fetchPage)).resolves.toBe(false);

    expect(fetchPage).toHaveBeenNthCalledWith(1, null);
    expect(fetchPage).toHaveBeenNthCalledWith(2, "1");
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(feed.items).toEqual([first, second]);
    expect(feed.cursor).toBeNull();
  });

  test("preserves transactions and the page cursor when refresh fails", async () => {
    const cached = transaction("cached", "2026-08-30T09:00:00.000Z");
    const feed = new TransactionFeed();

    await feed.loadNext(
      jest.fn().mockResolvedValue({ items: [cached], nextCursor: "30" }),
    );

    await expect(
      feed.refresh(jest.fn().mockRejectedValue(new Error("Offline"))),
    ).resolves.toBe(false);
    expect(feed.items).toEqual([cached]);
    expect(feed.cursor).toBe("30");
  });

  test("ignores a second page request while one is active", async () => {
    let finishRequest:
      | ((page: { items: Transaction[]; nextCursor: null }) => void)
      | undefined;
    const fetchPage: FetchTransactionPage = jest.fn(
      () =>
        new Promise((resolve) => {
          finishRequest = resolve;
        }),
    );
    const feed = new TransactionFeed();

    const firstRequest = feed.loadNext(fetchPage);
    await expect(feed.loadNext(fetchPage)).resolves.toBe(false);

    expect(fetchPage).toHaveBeenCalledTimes(1);
    finishRequest?.({ items: [], nextCursor: null });
    await expect(firstRequest).resolves.toBe(true);
  });
});
