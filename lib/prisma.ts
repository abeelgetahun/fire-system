import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function appendQueryParams(url: string, params: Record<string, string>): string {
  try {
    const u = new URL(url)
    for (const [k, v] of Object.entries(params)) {
      if (!u.searchParams.has(k)) {
        u.searchParams.set(k, v)
      }
    }
    return u.toString()
  } catch {
    return url
  }
}

// In local/dev with Neon or pgbouncer, keep connection footprint tiny to avoid pool exhaustion
const rawDbUrl = process.env.DATABASE_URL
const isNeon = rawDbUrl?.includes("neon.tech")
const patchedDbUrl = rawDbUrl
  ? appendQueryParams(rawDbUrl, isNeon ? { connection_limit: "3", pgbouncer: "true" } : {})
  : undefined

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? [] : ["query"],
    datasources: patchedDbUrl
      ? {
          db: {
            url: patchedDbUrl,
          },
        }
      : undefined,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
