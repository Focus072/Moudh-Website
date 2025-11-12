import { NextResponse } from "next/server"

const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
const UPDATE_APARTMENT_URL = `${API_BASE_URL}/update-apartments`

export async function POST(request: Request) {
  try {
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

    if (!name) {
      return NextResponse.json(
        { error: "Apartment name is required" },
        { status: 400 }
      )
    }

    if (!price || !rooms || !location || !city || !utilities || !parking || !petPolicy || !available) {
      return NextResponse.json(
        { error: "All fields except Note are required" },
        { status: 400 }
      )
    }

    const response = await fetch(UPDATE_APARTMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price,
        rooms,
        location,
        city,
        utilities,
        parking,
        petPolicy,
        available,
        note: note || "",
      }),
    })

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
          if (errorData.hint) {
            errorMessage += `. ${errorData.hint}`
          }
        }
      } catch {
        // If response is not JSON, use the status text
      }
      throw new Error(`Failed to update apartment: ${errorMessage}`)
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

