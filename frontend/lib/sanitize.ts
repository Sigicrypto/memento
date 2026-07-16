export function sanitizeText(input: string, maxLength: number = 255): string {
  if (!input) return '';
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>?/gm, '');
  // Prevent common injection patterns
  sanitized = sanitized.replace(/[;&]/g, '');
  return sanitized.trim().substring(0, maxLength);
}

export function sanitizeCaption(input: string, maxLength: number = 500): string {
  if (!input) return '';
  // Remove script tags and on* attributes, but allow basic text and emojis
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');
  return sanitized.trim().substring(0, maxLength);
}

export function sanitizeSlug(input: string): string {
  if (!input) return '';
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
