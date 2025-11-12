import { NextResponse } from "next/server"

const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
const UPDATE_STATUS_URL = `${API_BASE_URL}/update-status`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, status } = body

    if (!name) {
      return NextResponse.json(
        { error: "Apartment name is required" },
        { status: 400 }
      )
    }

    if (!status || (status !== "Available" && status !== "Rented")) {
      return NextResponse.json(
        { error: "Status must be either 'Available' or 'Rented'" },
        { status: 400 }
      )
    }

    const response = await fetch(UPDATE_STATUS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        status,
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
      throw new Error(`Failed to update status: ${errorMessage}`)
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

