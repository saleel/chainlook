// Handle value in both ms and seconds format
export function numberToJsDate(number) {
  if (number instanceof Date) return number;

  if (Number.isNaN(Number(number))) return number; // Not a number, return original value

  if (number.toString().length === 10) return new Date(Number(number) * 1000);

  if (number.toString().length === 13) return new Date(Number(number));

  return number;
}
