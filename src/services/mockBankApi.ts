import {
  Receipt,
  Session,
  Transaction,
  TransactionPage,
  TransferInput,
} from "../domain/models";

export type MockScenario =
  | "success"
  | "rejected"
  | "server-error"
  | "offline"
  | "timeout"
  | "delayed";

export type MockErrorKind = "rejected" | "server" | "offline" | "unknown";

export class MockServiceError extends Error {
  constructor(
    public readonly kind: MockErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MockServiceError";
  }
}

type MockOperation = "login" | "transactions" | "transfer";

type MockBankApiOptions = {
  now?: () => number;
  wait?: (milliseconds: number) => Promise<void>;
};

const TOTAL_TRANSACTION_RECORDS = 3_200;
const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 50;
const BASE_TRANSACTION_TIME = Date.parse("2026-08-30T09:00:00.000Z");

const defaultWait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const rejectionByOperation: Record<
  MockOperation,
  { message: string; status: 400 | 401 | 422 }
> = {
  login: { message: "Email or password is incorrect.", status: 401 },
  transactions: {
    message: "The transaction request was rejected.",
    status: 400,
  },
  transfer: { message: "The transfer details were rejected.", status: 422 },
};

function transactionAt(position: number): Transaction {
  const sourcePosition =
    position > 0 && position % 37 === 0 ? position - 1 : position;
  const direction = sourcePosition % 4 === 0 ? "credit" : "debit";
  const category = sourcePosition % 11 === 0 ? "airtime" : "transfer";

  return {
    id: `transaction-${sourcePosition}`,
    title:
      category === "airtime"
        ? "Airtime purchase"
        : direction === "credit"
          ? `Credit from Demo User ${sourcePosition}`
          : `Transfer to Demo User ${sourcePosition}`,
    occurredAt: new Date(
      BASE_TRANSACTION_TIME - sourcePosition * 60_000,
    ).toISOString(),
    amountMinor: 5_000 + (sourcePosition % 200) * 10_000,
    direction,
    category,
  };
}

export class MockBankApi {
  private readonly now: () => number;
  private readonly wait: (milliseconds: number) => Promise<void>;

  constructor(options: MockBankApiOptions = {}) {
    this.now = options.now ?? Date.now;
    this.wait = options.wait ?? defaultWait;
  }

  private async applyScenario(
    scenario: MockScenario,
    operation: MockOperation,
  ): Promise<void> {
    await this.wait(scenario === "delayed" ? 1_500 : 250);

    if (scenario === "rejected") {
      const rejection = rejectionByOperation[operation];
      throw new MockServiceError(
        "rejected",
        rejection.message,
        rejection.status,
      );
    }
    if (scenario === "server-error") {
      throw new MockServiceError(
        "server",
        "The service is temporarily unavailable.",
        500,
      );
    }
    if (scenario === "offline") {
      throw new MockServiceError(
        "offline",
        "You appear to be offline. Check your connection.",
      );
    }
    if (scenario === "timeout") {
      throw new MockServiceError(
        "unknown",
        "The request timed out before it was confirmed.",
      );
    }
  }

  async login(
    email: string,
    password: string,
    scenario: MockScenario = "success",
  ): Promise<Session> {
    await this.applyScenario(scenario, "login");

    if (
      email.trim().toLowerCase() !== "demo@zikora.test" ||
      password !== "Demo123!"
    ) {
      throw new MockServiceError(
        "rejected",
        "Email or password is incorrect.",
        401,
      );
    }

    const now = this.now();
    return {
      sessionId: `mock-session-${now}`,
      expiresAt: now + 60 * 60 * 1_000,
      user: {
        id: "demo-user",
        firstName: "Richard",
        email: "demo@zikora.test",
      },
    };
  }

  async fetchTransactions({
    cursor = null,
    limit = DEFAULT_PAGE_SIZE,
    scenario = "success",
  }: {
    cursor?: string | null;
    limit?: number;
    scenario?: MockScenario;
  } = {}): Promise<TransactionPage> {
    await this.applyScenario(scenario, "transactions");

    const offset = cursor === null ? 0 : Number(cursor);
    if (
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset > TOTAL_TRANSACTION_RECORDS
    ) {
      throw new MockServiceError(
        "rejected",
        "The transaction cursor is invalid.",
        400,
      );
    }

    const requestedLimit = Number.isFinite(limit)
      ? Math.floor(limit)
      : DEFAULT_PAGE_SIZE;
    const pageSize = Math.max(1, Math.min(requestedLimit, MAX_PAGE_SIZE));
    const end = Math.min(offset + pageSize, TOTAL_TRANSACTION_RECORDS);

    return {
      items: Array.from({ length: end - offset }, (_, index) =>
        transactionAt(offset + index),
      ),
      nextCursor: end < TOTAL_TRANSACTION_RECORDS ? String(end) : null,
    };
  }

  async submitTransfer(
    input: TransferInput,
    requestKey: string,
    scenario: MockScenario = "success",
  ): Promise<Receipt> {
    await this.applyScenario(scenario, "transfer");

    if (!requestKey.trim()) {
      throw new MockServiceError("rejected", "A request key is required.", 400);
    }
    if (!/^\d{10}$/.test(input.accountNumber)) {
      throw new MockServiceError(
        "rejected",
        "Enter a valid 10-digit account number.",
        422,
      );
    }
    if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) {
      throw new MockServiceError(
        "rejected",
        "Enter a valid transfer amount.",
        422,
      );
    }

    return {
      reference: `ZKR-${requestKey.slice(0, 8).toUpperCase()}`,
      confirmedAt: new Date(this.now()).toISOString(),
      amountMinor: input.amountMinor,
      senderName: "Richard Demo",
      beneficiaryName: input.accountName,
      beneficiaryAccount: input.accountNumber,
      bankName: input.bankName,
      narration: input.remark?.trim() || "Transfer",
    };
  }
}
