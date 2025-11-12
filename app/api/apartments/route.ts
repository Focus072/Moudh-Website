import { NextResponse } from "next/server"

// This app only sends data TO n8n, it doesn't receive data FROM n8n
// So we always return an empty array - apartments are stored in localStorage on the client side
export async function GET() {
  return NextResponse.json([])
}

