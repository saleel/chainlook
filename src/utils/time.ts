// Handle value in both ms and seconds format
export function numberToJsDate(number) {
  if (number instanceof Date) return number;

  if (Number.isNaN(Number(number))) return number; // Not a number, return original value

  if (number.toString().length === 10) return new Date(Number(number) * 1000);

  if (number.toString().length === 13) return new Date(Number(number));

  return number;
}

// Format date to locale string
export function formatDate(textOrDate: string | Date): string {
  const date = new Date(textOrDate);

  if (date.toString() === 'Invalid Date') {
    return textOrDate as string;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
