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
    const { 
      id,
      name, 
      price, 
      rooms, 
      location, 
      city,
      utilities, 
      parking, 
      petPolicy, 
      available, 
      note 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 }
      )
    }

    if (!name || !price || !rooms || !location || !city || !utilities || !parking || !petPolicy || !available) {
      return NextResponse.json(
        { error: "All fields except Note are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const apartment = await Apartment.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        name: name.trim(),
        price: price.trim(),
        rooms: rooms.trim(),
        location: location.trim(),
        city: city.trim(),
        utilities: utilities.trim(),
        parking: parking.trim(),
        petPolicy: petPolicy.trim(),
        available: available.trim(),
        note: (note || "").trim(),
      },
      { new: true }
    )

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating apartment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update apartment" },
      { status: 500 }
    )
  }
}

