export function numberToJsDate(input: number | string | Date) {
  if (input instanceof Date) return input;

  if (Number.isNaN(Number(input))) return input; // Not a number, return original value

  // Handle value in both ms and seconds format
  if (input.toString().length === 10) return new Date(Number(input) * 1000);

  if (input.toString().length === 13) return new Date(Number(input));

  return input;
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
