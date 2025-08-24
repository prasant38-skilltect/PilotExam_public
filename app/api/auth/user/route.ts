
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This will be handled by the middleware rewrite to Express server
  return NextResponse.json({ message: 'This should be handled by Express' }, { status: 500 })
}
