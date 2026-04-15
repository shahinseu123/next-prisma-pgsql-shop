import { prisma } from "@/lib/prisma";
import { paginate } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const result = await paginate(prisma.product, {
    page:  Number(searchParams.get('page')  ?? 1),
    limit: Number(searchParams.get('limit') ?? 12),
  }, {
    where:   { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(result)
}

