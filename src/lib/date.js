import { isValid, parse, parseISO } from "date-fns";

const DATE_PATTERNS = [
  "M/d/yy",
  "M/d/yyyy",
  "MM/dd/yy",
  "MM/dd/yyyy",
  "yyyy-MM-dd",
];

export function parseDateSmart(input) {
  if (input == null) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Try ISO first
  const iso = parseISO(raw);
  if (isValid(iso)) return iso;

  // Try common statement formats
  for (const pattern of DATE_PATTERNS) {
    const d = parse(raw, pattern, new Date());
    if (isValid(d)) return d;
  }

  // Last resort
  const fallback = new Date(raw);
  if (isValid(fallback)) return fallback;

  return null;
}

export function toISODateOnly(date) {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
