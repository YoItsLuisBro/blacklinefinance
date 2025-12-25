// Parses "$1,234.56", "-12.34", "(45.67)" into integer cents

export function parseMoneyToCents(input) {
  if (input == null) return 0;

  const raw = String(input).trim();
  if (!raw) return 0;

  const isParenNeg = raw.startsWith("(") && raw.endsWith(")");
  const cleaned = raw
    .replace(/[()]/g, "")
    .replace(/[^0-9.,-]/g, "") // keep digits, dot, comma, minus
    .replace(/,/g, "")
    .trim();

  if (!cleaned) return 0;

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return 0;

  const cents = Math.round(n * 100);
  return isParenNeg ? -Math.abs(cents) : cents;
}

export function formatCents(cents, currency = "USD") {
  const n = (cents ?? 0) / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}
