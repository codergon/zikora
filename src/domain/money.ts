const MINOR_UNITS_PER_NAIRA = 100;

export function parseNairaToMinorUnits(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [naira, kobo = ""] = normalized.split(".");
  const amount =
    Number(naira) * MINOR_UNITS_PER_NAIRA + Number(kobo.padEnd(2, "0"));

  return Number.isSafeInteger(amount) ? amount : null;
}

export function formatNaira(amountMinor: number): string {
  assertMinorUnits(amountMinor);

  const sign = amountMinor < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amountMinor);
  const naira = Math.floor(absoluteAmount / MINOR_UNITS_PER_NAIRA)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const kobo = (absoluteAmount % MINOR_UNITS_PER_NAIRA)
    .toString()
    .padStart(2, "0");

  return `${sign}₦${naira}.${kobo}`;
}

export function describeNaira(amountMinor: number): string {
  assertMinorUnits(amountMinor);

  const absoluteAmount = Math.abs(amountMinor);
  const naira = Math.floor(absoluteAmount / MINOR_UNITS_PER_NAIRA);
  const kobo = absoluteAmount % MINOR_UNITS_PER_NAIRA;
  const sign = amountMinor < 0 ? "minus " : "";

  return `${sign}${naira.toLocaleString("en-NG")} naira and ${kobo} kobo`;
}

function assertMinorUnits(amountMinor: number): void {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error("Money must use integer minor units.");
  }
}
