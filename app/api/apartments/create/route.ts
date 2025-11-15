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

    // Also send to n8n webhook (don't fail if webhook is down)
    const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
    const ADD_APARTMENT_URL = `${API_BASE_URL}/add-apartment`
    
    try {
      await fetch(ADD_APARTMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      })
    } catch (webhookError) {
      // Log but don't fail - database save succeeded
      console.error("Failed to trigger n8n webhook:", webhookError)
    }

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

