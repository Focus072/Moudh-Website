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
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Get apartment first to send name to webhook
    const apartment = await Apartment.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found or unauthorized" },
        { status: 404 }
      )
    }

    // Delete from database
    await Apartment.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    // Also send to n8n webhook (don't fail if webhook is down)
    const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
    const DELETE_APARTMENT_URL = `${API_BASE_URL}/delete-apartments`
    
    try {
      await fetch(DELETE_APARTMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: apartment.name,
        }),
      })
    } catch (webhookError) {
      // Log but don't fail - database delete succeeded
      console.error("Failed to trigger n8n webhook:", webhookError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting apartment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete apartment" },
      { status: 500 }
    )
  }
}

