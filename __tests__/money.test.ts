import {
  describeNaira,
  formatNaira,
  parseNairaToMinorUnits,
} from "../src/domain/money";

describe("naira amounts", () => {
  test("parses naira input into integer minor units", () => {
    expect(parseNairaToMinorUnits("1,250.50")).toBe(125_050);
    expect(parseNairaToMinorUnits("50.5")).toBe(5_050);
    expect(parseNairaToMinorUnits("12.345")).toBeNull();
    expect(parseNairaToMinorUnits("-10")).toBeNull();
  });

  test("formats integer minor units consistently", () => {
    expect(formatNaira(125_050)).toBe("₦1,250.50");
    expect(formatNaira(-5_000)).toBe("-₦50.00");
    expect(describeNaira(125_050)).toBe("1,250 naira and 50 kobo");
  });

  test("rejects non-integer minor units", () => {
    expect(() => formatNaira(100.5)).toThrow(
      "Money must use integer minor units.",
    );
  });
});
