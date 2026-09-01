import { render, screen } from "@testing-library/react-native";

import { ReceiptScreen } from "../src/screens/ReceiptScreen";

describe("ReceiptScreen", () => {
  test("shows confirmed transfer details", () => {
    const receipt = {
      reference: "ZKR-ABCD1234",
      confirmedAt: "2026-08-31T12:00:00.000Z",
      amountMinor: 50_000,
      senderName: "Richard Demo",
      beneficiaryName: "Nnamdi Demo",
      beneficiaryAccount: "0123456789",
      bankName: "Zikora Bank",
      narration: "Family support",
    };

    render(
      <ReceiptScreen
        navigation={{} as never}
        route={
          { key: "receipt", name: "Receipt", params: { receipt } } as never
        }
      />,
    );

    expect(screen.getByText("TRANSACTION RECEIPT")).toBeTruthy();
    expect(screen.getByText("₦500.00")).toBeTruthy();
    expect(screen.getByText("ZKR-ABCD1234")).toBeTruthy();
    expect(screen.getByText(/Nnamdi Demo/)).toBeTruthy();
    // The design has no back control; the receipt is a terminal screen reached
    // via navigation.replace, so hardware back returns to Home.
    expect(screen.queryByLabelText("Return home")).toBeNull();
  });
});
