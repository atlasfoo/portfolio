/**
 * Certification validity dates.
 *
 * Dates live in the content file as ISO `YYYY-MM-DD` (the format AWS uses on
 * the certificate) but are displayed as `YYYY-MM`: the exact day adds no
 * value to a portfolio and month precision keeps the mono type block short.
 */

export interface CertDateLabel {
  /** Display value, `YYYY-MM` (e.g. `2024-03`). */
  label: string;
  /** Machine-readable value for the `<time datetime>` attribute. */
  dateTime: string;
}

/**
 * Normalises an ISO date (or `YYYY-MM`) into its display and `datetime`
 * values. Returns `null` for missing or malformed input so callers can omit
 * the line instead of rendering `Invalid Date`.
 */
export function formatCertDate(iso: string | undefined): CertDateLabel | null {
  if (!iso) return null;

  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const monthNumber = Number(month);
  if (monthNumber < 1 || monthNumber > 12) return null;

  return {
    label: `${year}-${month}`,
    dateTime: day ? `${year}-${month}-${day}` : `${year}-${month}`,
  };
}
