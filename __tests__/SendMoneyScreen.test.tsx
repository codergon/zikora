import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { TransferCoordinator } from "../src/domain/transfer";
import { SendMoneyScreen } from "../src/screens/SendMoneyScreen";
import { MockServiceError } from "../src/services/mockBankApi";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const receipt = {
  reference: "ZKR-TEST",
  confirmedAt: "2026-08-31T12:00:00.000Z",
  amountMinor: 5_000,
  senderName: "Richard Demo",
  beneficiaryName: "Nnamdi Demo",
  beneficiaryAccount: "0123456789",
  bankName: "Zikora Bank",
  narration: "Transfer",
};

function fillRequiredFields() {
  fireEvent.press(screen.getByLabelText("Choose Bank, Select the bank"));
  fireEvent.press(screen.getByLabelText("Zikora Bank"));
  fireEvent.changeText(screen.getByLabelText("Account Number"), "0123456789");
  fireEvent.changeText(screen.getByLabelText("Amount"), "50");
}

describe("SendMoneyScreen", () => {
  test("identifies every missing required transfer field", () => {
    const coordinator = new TransferCoordinator({
      createRequestKey: () => "request-validation",
      submitTransfer: jest.fn(),
    });

    render(
      <SendMoneyScreen
        navigation={{ goBack: jest.fn(), replace: jest.fn() } as never}
        route={{ key: "send", name: "SendMoney" } as never}
        coordinator={coordinator}
      />,
    );
    fireEvent.press(screen.getByLabelText("Submit transfer"));

    expect(screen.getByText("Choose a destination bank.")).toBeTruthy();
    expect(
      screen.getByText("Enter a valid 10-digit account number."),
    ).toBeTruthy();
    expect(screen.getByText("Enter a valid amount.")).toBeTruthy();
  });

  test("opens the receipt only after the transfer is confirmed", async () => {
    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    const coordinator = new TransferCoordinator({
      createRequestKey: () => "request-1",
      submitTransfer: jest.fn().mockResolvedValue(receipt),
    });

    render(
      <SendMoneyScreen
        navigation={navigation as never}
        route={{ key: "send", name: "SendMoney" } as never}
        coordinator={coordinator}
      />,
    );
    fillRequiredFields();
    fireEvent.press(screen.getByLabelText("Submit transfer"));

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith("Receipt", { receipt });
    });
  });

  test("shows unknown status without opening a receipt", async () => {
    const navigation = { goBack: jest.fn(), replace: jest.fn() };
    const coordinator = new TransferCoordinator({
      createRequestKey: () => "request-2",
      submitTransfer: jest
        .fn()
        .mockRejectedValue(
          new MockServiceError(
            "unknown",
            "The request timed out before it was confirmed.",
          ),
        ),
    });

    render(
      <SendMoneyScreen
        navigation={navigation as never}
        route={{ key: "send", name: "SendMoney" } as never}
        coordinator={coordinator}
      />,
    );
    fillRequiredFields();
    fireEvent.press(screen.getByLabelText("Submit transfer"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(
        screen.getByText(
          "The transfer status is unknown. Check your balance before retrying.",
        ),
      ).toBeTruthy();
    });
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
