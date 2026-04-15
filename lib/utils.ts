
interface PaginateOptions {
  page:    number
  limit:   number
}

interface PaginatedResult<T> {
  data:       T[]
  total:      number
  page:       number
  totalPages: number
}

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



// Call this from any route handler instead of repeating skip/take logic
export async function paginate<T>(
  model: { findMany: Function; count: Function },
  options: PaginateOptions,
  query: { where?: object; orderBy?: object; select?: object } = {}
): Promise<PaginatedResult<T>> {
  const { page, limit } = options
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({ ...query, skip, take: limit }),
    model.count({ where: query.where }),
  ])

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}