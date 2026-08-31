import { act, render, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { HomeScreen } from "../src/screens/HomeScreen";
import { MockBankApi } from "../src/services/mockBankApi";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("HomeScreen", () => {
  const renderHome = (api: MockBankApi) =>
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <HomeScreen api={api} firstName="Richard" onLogout={jest.fn()} />
      </SafeAreaProvider>,
    );

  test("loads transactions into a bounded virtualized list", async () => {
    const api = new MockBankApi({ wait: async () => undefined });
    renderHome(api);

    await waitFor(() => {
      expect(screen.getByTestId("transaction-list").props.data).toHaveLength(
        30,
      );
    });

    const list = screen.getByTestId("transaction-list");
    expect(list.props.initialNumToRender).toBe(10);
    expect(list.props.maxToRenderPerBatch).toBe(8);
    expect(list.props.windowSize).toBe(7);
    expect(list.props.removeClippedSubviews).toBe(true);
    expect(screen.getByLabelText("Credit, 50 naira and 0 kobo")).toBeTruthy();
  });

  test("preserves visible transactions when pull-to-refresh fails", async () => {
    const api = new MockBankApi({ wait: async () => undefined });
    renderHome(api);

    await waitFor(() => {
      expect(screen.getByText("Airtime purchase")).toBeTruthy();
    });

    const list = screen.getByTestId("transaction-list");
    await act(async () => {
      await list.props.refreshControl.props.onRefresh();
    });

    expect(
      screen.getByText(
        "Refresh failed. Your saved transactions are still shown.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Airtime purchase")).toBeTruthy();
  });
});
