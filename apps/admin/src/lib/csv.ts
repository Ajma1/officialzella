/** Escapes a single CSV field per RFC 4180: wraps in quotes and doubles
 *  any embedded quotes whenever the value contains a comma, quote, or
 *  newline. */
export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(",");
}
