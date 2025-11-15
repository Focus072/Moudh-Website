import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import connectDB from "@/lib/db"
import Apartment from "@/models/Apartment"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    await connectDB()
    
    const apartments = await Apartment.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    const formattedApartments = apartments.map((apt) => ({
      id: apt._id.toString(),
      name: apt.name,
      price: apt.price,
      rooms: apt.rooms,
      location: apt.location,
      city: apt.city,
      utilities: apt.utilities,
      parking: apt.parking,
      petPolicy: apt.petPolicy,
      available: apt.available,
      note: apt.note,
      status: apt.status,
    }))

    return NextResponse.json(formattedApartments)
  } catch (error) {
    console.error("Error fetching apartments:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("MONGODB_URI")) {
        return NextResponse.json(
          { error: "Database not configured. Please set MONGODB_URI in .env.local" },
          { status: 500 }
        )
      }
      if (error.message.includes("connect")) {
        return NextResponse.json(
          { error: "Failed to connect to database. Check your MongoDB connection string." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch apartments" },
      { status: 500 }
    )
  }
}

