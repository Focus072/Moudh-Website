import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import connectDB from "@/lib/db"
import Apartment from "@/models/Apartment"

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

    const apartment = await Apartment.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found or unauthorized" },
        { status: 404 }
      )
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

