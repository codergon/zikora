import { TransferInput } from "../src/domain/models";
import { MockBankApi, MockScenario } from "../src/services/mockBankApi";

const credentials = {
  email: "demo@zikora.test",
  password: "Demo123!",
};

const transferInput: TransferInput = {
  bankCode: "999",
  bankName: "Demo Bank",
  accountNumber: "0000000000",
  accountName: "Nnamdi Demo",
  amountMinor: 125_050,
  category: "Transport",
  remark: "Ride fare",
};

describe("MockBankApi", () => {
  test("returns a deterministic session for valid credentials", async () => {
    const now = Date.parse("2026-08-30T09:00:00.000Z");
    const api = new MockBankApi({
      now: () => now,
      wait: async () => undefined,
    });

    await expect(
      api.login(credentials.email, credentials.password),
    ).resolves.toEqual({
      sessionId: `mock-session-${now}`,
      expiresAt: now + 60 * 60 * 1_000,
      user: {
        id: "demo-user",
        firstName: "Richard",
        email: credentials.email,
      },
    });
  });

  test("rejects invalid credentials with a 401 response", async () => {
    const api = new MockBankApi({ wait: async () => undefined });

    await expect(
      api.login(credentials.email, "incorrect"),
    ).rejects.toMatchObject({
      kind: "rejected",
      status: 401,
      message: "Email or password is incorrect.",
    });
  });

  test.each<{
    scenario: Exclude<MockScenario, "success" | "delayed" | "rejected">;
    kind: string;
    status?: number;
  }>([
    { scenario: "server-error", kind: "server", status: 500 },
    { scenario: "offline", kind: "offline" },
    { scenario: "timeout", kind: "unknown" },
  ])(
    "reports $scenario without returning a session",
    async ({ scenario, kind, status }) => {
      const api = new MockBankApi({ wait: async () => undefined });

      await expect(
        api.login(credentials.email, credentials.password, scenario),
      ).rejects.toMatchObject({
        kind,
        status,
      });
    },
  );

  test("uses the documented delay and then returns a successful response", async () => {
    const wait = jest.fn(async () => undefined);
    const api = new MockBankApi({ wait });

    await api.login(credentials.email, credentials.password, "delayed");

    expect(wait).toHaveBeenCalledWith(1_500);
  });

  test("serves more than 3000 unique transactions in pages capped at 50 rows", async () => {
    const api = new MockBankApi({ wait: async () => undefined });
    const transactionIds = new Set<string>();
    let cursor: string | null = null;

    do {
      const page = await api.fetchTransactions({ cursor, limit: 500 });
      expect(page.items).toHaveLength(50);
      page.items.forEach((transaction) => transactionIds.add(transaction.id));
      cursor = page.nextCursor;
    } while (cursor !== null);

    expect(transactionIds.size).toBeGreaterThan(3_000);
  });

  test("rejects an invalid transaction cursor with a 400 response", async () => {
    const api = new MockBankApi({ wait: async () => undefined });

    await expect(
      api.fetchTransactions({ cursor: "invalid" }),
    ).rejects.toMatchObject({
      kind: "rejected",
      status: 400,
    });
  });

  test("returns a receipt containing integer minor units after a successful transfer", async () => {
    const now = Date.parse("2026-08-30T09:00:00.000Z");
    const api = new MockBankApi({
      now: () => now,
      wait: async () => undefined,
    });

    await expect(
      api.submitTransfer(transferInput, "request-1234"),
    ).resolves.toEqual({
      reference: "ZKR-REQUEST-",
      confirmedAt: "2026-08-30T09:00:00.000Z",
      amountMinor: 125_050,
      senderName: "Richard Demo",
      beneficiaryName: "Nnamdi Demo",
      beneficiaryAccount: "0000000000",
      bankName: "Demo Bank",
      narration: "Ride fare",
    });
  });
});
