import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { LoginScreen } from "../src/screens/LoginScreen";
import { MockServiceError } from "../src/services/mockBankApi";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("LoginScreen", () => {
  test("labels the fields and disables login until the form is valid", () => {
    render(<LoginScreen onLogin={jest.fn()} />);

    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByLabelText("Login").props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });
  });

  test("toggles password visibility with an accessible control", () => {
    render(<LoginScreen onLogin={jest.fn()} />);
    const password = screen.getByLabelText("Password");

    expect(password.props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByLabelText("Show password"));
    expect(password.props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText("Hide password")).toBeTruthy();
  });

  test("shows validation errors for invalid input", () => {
    render(<LoginScreen onLogin={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText("Email"), "invalid");
    fireEvent.changeText(screen.getByLabelText("Password"), "short");

    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    expect(
      screen.getByText("Password must contain at least 8 characters."),
    ).toBeTruthy();
  });

  test("shows rejected credentials without entering a success state", async () => {
    const onLogin = jest
      .fn()
      .mockRejectedValue(
        new MockServiceError(
          "rejected",
          "Email or password is incorrect.",
          401,
        ),
      );
    render(<LoginScreen onLogin={onLogin} />);

    fireEvent.changeText(
      screen.getByLabelText("Email"),
      "rejected@zikora.test",
    );
    fireEvent.changeText(screen.getByLabelText("Password"), "Demo123!");
    fireEvent.press(screen.getByLabelText("Login"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText("Email or password is incorrect.")).toBeTruthy();
    });
    expect(onLogin).toHaveBeenCalledWith(
      "demo@zikora.test",
      "Demo123!",
      "rejected",
    );
  });
});
