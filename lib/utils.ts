
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

export function calculateDiscount(
  type: 'PERCENTAGE' | 'FIXED',
  value: number,
  subtotal: number
): number {
  if (type === 'PERCENTAGE') {
    return Math.min((subtotal * value) / 100, subtotal)
  }
  return Math.min(value, subtotal)
}