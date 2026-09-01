export type Session = {
  sessionId: string;
  expiresAt: number;
  user: {
    id: string;
    firstName: string;
    email: string;
  };
};

export type Transaction = {
  id: string;
  title: string;
  occurredAt: string;
  amountMinor: number;
  direction: "credit" | "debit";
  category: "transfer" | "airtime" | "fee";
};

export type TransactionPage = {
  items: Transaction[];
  nextCursor: string | null;
};

export type TransferInput = {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amountMinor: number;
  category?: string;
  remark?: string;
};

export type Receipt = {
  reference: string;
  confirmedAt: string;
  amountMinor: number;
  senderName: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  bankName: string;
  narration: string;
};

export type TransferOutcome =
  | { status: "success"; receipt: Receipt }
  | { status: "rejected"; message: string }
  | { status: "failed"; message: string; retryable: boolean }
  | { status: "unknown"; message: string };

export type TransferState =
  | { status: "idle" }
  | { status: "pending"; requestKey: string }
  | TransferOutcome;
