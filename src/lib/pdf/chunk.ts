// src/lib/pdf/chunk.ts
// ─── Generic chunk utility ────────────────────────────────────────────────────
// Splits an array into sub-arrays of at most `size` items each.
// Used by the report engine to determine how many PDF parts to generate.
//
// The "rowsPerPdf" concept in our architecture is controlled by this function:
//   chunk(rows, 20) → [[row1..20], [row21..40], ...]

export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) throw new RangeError('chunk size must be greater than 0');
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}
