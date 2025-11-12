import { NextResponse } from "next/server"

const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
const DELETE_APARTMENT_URL = `${API_BASE_URL}/delete-apartments`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: "Apartment name is required" },
        { status: 400 }
      )
    }

    const response = await fetch(DELETE_APARTMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
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
      throw new Error(`Failed to delete apartment: ${errorMessage}`)
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

