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

// Remove all chars that are not letters, numbers, spaces, colon, parenthesis or dashes
export function cleanTitleString(text: string) {
  return text.toString().replace(/[^a-zA-Z0-9\s:()\-]+/g, '');
}