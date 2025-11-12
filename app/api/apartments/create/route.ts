import { NextResponse } from "next/server"

const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
const ADD_APARTMENT_URL = `${API_BASE_URL}/add-apartment`

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

    if (!name || !price || !rooms || !location || !city || !utilities || !parking || !petPolicy || !available) {
      return NextResponse.json(
        { error: "All fields except Note are required" },
        { status: 400 }
      )
    }

    const response = await fetch(ADD_APARTMENT_URL, {
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
      throw new Error(`Failed to create apartment: ${errorMessage}`)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error creating apartment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create apartment" },
      { status: 500 }
    )
  }
}

