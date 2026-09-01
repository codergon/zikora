import {
  Receipt,
  TransferInput,
  TransferOutcome,
  TransferState,
} from "./models";
import { MockServiceError } from "../services/mockBankApi";

type SubmitTransfer = (
  input: TransferInput,
  requestKey: string,
) => Promise<Receipt>;

type TransferCoordinatorOptions = {
  createRequestKey: () => string;
  submitTransfer: SubmitTransfer;
};

function intentSignature(input: TransferInput): string {
  return JSON.stringify([
    input.bankCode,
    input.bankName,
    input.accountNumber,
    input.accountName,
    input.amountMinor,
    input.category ?? "",
    input.remark?.trim() ?? "",
  ]);
}

function outcomeFromError(error: unknown): TransferOutcome {
  if (!(error instanceof MockServiceError)) {
    return {
      status: "failed",
      message: "The transfer could not be submitted. Please try again.",
      retryable: true,
    };
  }

  if (error.kind === "rejected") {
    return { status: "rejected", message: error.message };
  }

  if (error.kind === "unknown") {
    return {
      status: "unknown",
      message:
        "The transfer status is unknown. Check your balance before retrying.",
    };
  }

  return {
    status: "failed",
    message: error.message,
    retryable: true,
  };
}

export class TransferCoordinator {
  private currentState: TransferState = { status: "idle" };
  private activeRequest: Promise<TransferOutcome> | null = null;
  private currentIntent: string | null = null;
  private currentRequestKey: string | null = null;

  constructor(private readonly options: TransferCoordinatorOptions) {}

  get state(): TransferState {
    return this.currentState;
  }

  submit(input: TransferInput): Promise<TransferOutcome> {
    if (this.activeRequest) {
      return this.activeRequest;
    }

    const nextIntent = intentSignature(input);
    if (
      this.currentState.status === "success" &&
      nextIntent === this.currentIntent
    ) {
      return Promise.resolve(this.currentState);
    }

    if (nextIntent !== this.currentIntent) {
      this.currentIntent = nextIntent;
      this.currentRequestKey = this.options.createRequestKey();
    }

    const requestKey = this.currentRequestKey as string;
    this.currentState = { status: "pending", requestKey };

    const request = this.options
      .submitTransfer(input, requestKey)
      .then<TransferOutcome>((receipt) => ({ status: "success", receipt }))
      .catch(outcomeFromError)
      .then((outcome) => {
        this.currentState = outcome;
        return outcome;
      })
      .finally(() => {
        this.activeRequest = null;
      });

    this.activeRequest = request;
    return request;
  }
}
