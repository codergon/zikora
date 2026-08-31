import { Receipt, TransferInput } from "../src/domain/models";
import { TransferCoordinator } from "../src/domain/transfer";
import { MockServiceError } from "../src/services/mockBankApi";

const transferInput: TransferInput = {
  bankCode: "999",
  bankName: "Demo Bank",
  accountNumber: "0000000000",
  accountName: "Nnamdi Demo",
  amountMinor: 125_000,
  category: "Transport",
  remark: "Ride fare",
};

const receipt: Receipt = {
  reference: "ZKR-DEMO1234",
  confirmedAt: "2026-08-30T09:00:00.000Z",
  amountMinor: transferInput.amountMinor,
  senderName: "Richard Demo",
  beneficiaryName: transferInput.accountName,
  beneficiaryAccount: transferInput.accountNumber,
  bankName: transferInput.bankName,
  narration: transferInput.remark as string,
};

describe("transfer submission", () => {
  test("keeps a rejected request out of the success path", async () => {
    const coordinator = new TransferCoordinator({
      createRequestKey: () => "request-1",
      submitTransfer: jest
        .fn()
        .mockRejectedValue(
          new MockServiceError(
            "rejected",
            "The destination account was rejected.",
            422,
          ),
        ),
    });

    await expect(coordinator.submit(transferInput)).resolves.toEqual({
      status: "rejected",
      message: "The destination account was rejected.",
    });
    expect(coordinator.state.status).toBe("rejected");
  });

  test("shares one active request across repeated taps", async () => {
    let confirmTransfer: ((value: Receipt) => void) | undefined;
    const submitTransfer = jest.fn(
      () =>
        new Promise<Receipt>((resolve) => {
          confirmTransfer = resolve;
        }),
    );
    const coordinator = new TransferCoordinator({
      createRequestKey: () => "request-1",
      submitTransfer,
    });

    const firstTap = coordinator.submit(transferInput);
    const secondTap = coordinator.submit(transferInput);

    expect(firstTap).toBe(secondTap);
    expect(submitTransfer).toHaveBeenCalledTimes(1);
    expect(coordinator.state).toEqual({
      status: "pending",
      requestKey: "request-1",
    });

    confirmTransfer?.(receipt);
    await expect(firstTap).resolves.toEqual({ status: "success", receipt });
  });

  test("reports a timeout as unknown instead of success", async () => {
    const coordinator = new TransferCoordinator({
      createRequestKey: () => "request-1",
      submitTransfer: jest
        .fn()
        .mockRejectedValue(new MockServiceError("unknown", "Timed out.")),
    });

    const outcome = await coordinator.submit(transferInput);

    expect(outcome.status).toBe("unknown");
    expect(coordinator.state.status).toBe("unknown");
  });

  test("reuses the request key when retrying the same intent", async () => {
    const createRequestKey = jest.fn(() => "request-1");
    const submitTransfer = jest
      .fn()
      .mockRejectedValueOnce(
        new MockServiceError("offline", "You appear to be offline."),
      )
      .mockResolvedValueOnce(receipt);
    const coordinator = new TransferCoordinator({
      createRequestKey,
      submitTransfer,
    });

    await coordinator.submit(transferInput);
    await coordinator.submit(transferInput);

    expect(createRequestKey).toHaveBeenCalledTimes(1);
    expect(submitTransfer).toHaveBeenNthCalledWith(
      1,
      transferInput,
      "request-1",
    );
    expect(submitTransfer).toHaveBeenNthCalledWith(
      2,
      transferInput,
      "request-1",
    );
  });

  test("creates a new request key when the transfer intent changes", async () => {
    const createRequestKey = jest
      .fn()
      .mockReturnValueOnce("request-1")
      .mockReturnValueOnce("request-2");
    const submitTransfer = jest.fn().mockResolvedValue(receipt);
    const coordinator = new TransferCoordinator({
      createRequestKey,
      submitTransfer,
    });

    await coordinator.submit(transferInput);
    await coordinator.submit({ ...transferInput, amountMinor: 200_000 });

    expect(createRequestKey).toHaveBeenCalledTimes(2);
    expect(submitTransfer).toHaveBeenLastCalledWith(
      { ...transferInput, amountMinor: 200_000 },
      "request-2",
    );
  });
});
