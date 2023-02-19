export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

// Remove all chars that are not letters, numbers, spaces, colon or dashes
export function cleanString(text: string) {
  return text.toString().replace(/[^\w\s-:]/gi, '');
}

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

export function camelCaseToTitle(text: string) {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
}
