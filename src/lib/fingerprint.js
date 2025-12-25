export function normalizeDescription(desc) {
  return String(desc ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function makeFingerprint({ occurred_on, description, amount_cents }) {
  const norm = normalizeDescription(description);
  return `${occurred_on}|${norm}|${amount_cents}`;
}
