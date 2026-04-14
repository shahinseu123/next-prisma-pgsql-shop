import { PrismaClient } from "@prisma/client"


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}


export const db =
  globalForPrisma.prisma ?? new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']  // log all SQL in dev
        : ['error'],                  // only errors in prod
  })


if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}