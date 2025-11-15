import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import connectDB from "@/lib/db"
import Apartment from "@/models/Apartment"

// Force dynamic rendering (required for API routes using headers/sessions)
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, status } = body

    if (!id) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      )
    }

    if (!status || (status !== "Available" && status !== "Rented")) {
      return NextResponse.json(
        { error: "Status must be either 'Available' or 'Rented'" },
        { status: 400 }
      )
    }

    await connectDB()

    const apartment = await Apartment.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { status },
      { new: true }
    )

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found or unauthorized" },
        { status: 404 }
      )
    }

    // Also send to n8n webhook (don't fail if webhook is down)
    const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
    const UPDATE_STATUS_URL = `${API_BASE_URL}/update-status`
    
    try {
      await fetch(UPDATE_STATUS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: apartment.name,
          status: apartment.status,
        }),
      })
    } catch (webhookError) {
      // Log but don't fail - database update succeeded
      console.error("Failed to trigger n8n webhook:", webhookError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update apartment status" },
      { status: 500 }
    )
  }
}

