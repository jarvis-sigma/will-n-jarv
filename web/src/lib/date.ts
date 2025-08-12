// Date formatting helpers
// Ensures ISO `YYYY-MM-DD` dates are interpreted in local time, avoiding UTC off-by-one.

export function formatLocalDate(
  d?: string | null,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string | null {
  if (!d) return null;
  try {
    const date = new Date(`${d}T00:00:00`); // local midnight
    return date.toLocaleDateString(undefined, options);
  } catch {
    return d;
  }
}
