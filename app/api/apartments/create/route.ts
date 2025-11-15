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

    if (!name || !price || !rooms || !location || !city || !utilities || !parking || !petPolicy || !available) {
      return NextResponse.json(
        { error: "All fields except Note are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const apartment = new Apartment({
      userId: session.user.id,
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
      status: "Available",
    })

    await apartment.save()

    return NextResponse.json(
      { 
        success: true,
        apartment: {
          id: apartment._id.toString(),
          name: apartment.name,
          price: apartment.price,
          rooms: apartment.rooms,
          location: apartment.location,
          city: apartment.city,
          utilities: apartment.utilities,
          parking: apartment.parking,
          petPolicy: apartment.petPolicy,
          available: apartment.available,
          note: apartment.note,
          status: apartment.status,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating apartment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create apartment" },
      { status: 500 }
    )
  }
}

