export function toPostgresTimestamp(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const iso = date.toISOString();

  const [datePart] = iso.split("T");
  return `${datePart}`;
}
