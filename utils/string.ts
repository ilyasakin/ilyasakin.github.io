export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    // Remove parentheses but keep their content
    .replace(/[()]/g, '')
    // Replace special characters with a space
    .replace(/[^a-z0-9]+/g, ' ')
    // Replace spaces with hyphens and trim
    .trim()
    .replace(/\s+/g, '-')
    // Remove any trailing hyphens
    .replace(/-+$/, '');
} 