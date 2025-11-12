// Raw API response type from n8n Data Table
export interface RawApartment {
  id?: string | number
  Name?: string
  name?: string
  Description?: string
  description?: string
  Price?: string
  price?: string
  Rooms?: string
  rooms?: string
  Location?: string
  location?: string
  City?: string
  city?: string
  Utilities?: string
  utilities?: string
  Parking?: string
  parking?: string
  PetPolicy?: string
  petPolicy?: string
  pet_policy?: string
  Available?: string
  available?: string
  Note?: string
  note?: string
  status?: string
}

// Normalized Apartment type
export interface Apartment {
  id: string
  name: string
  price: string
  rooms: string
  location: string
  city: string
  utilities: string
  parking: string
  petPolicy: string
  available: string
  note: string
  status: string
  // Keep description for backward compatibility (will be generated from fields)
  description?: string
}

// API endpoints
const API_BASE_URL = "https://goldenvalley.app.n8n.cloud/webhook"
const LIST_APARTMENTS_URL = `${API_BASE_URL}-test/list-apartments`
const ADD_APARTMENT_URL = `${API_BASE_URL}/add-apartment`

/**
 * Normalizes raw apartment data from API to internal format
 */
export const mapApartment = (raw: RawApartment): Apartment => {
  const apartment: Apartment = {
    id: raw.id ? String(raw.id) : "",
    name: raw.Name || raw.name || "",
    price: raw.Price || raw.price || "",
    rooms: raw.Rooms || raw.rooms || "",
    location: raw.Location || raw.location || "",
    city: raw.City || raw.city || "",
    utilities: raw.Utilities || raw.utilities || "",
    parking: raw.Parking || raw.parking || "",
    petPolicy: raw.PetPolicy || raw.petPolicy || raw.pet_policy || "",
    available: raw.Available || raw.available || "",
    note: raw.Note || raw.note || "",
    status: raw.status || "Available",
  }
  
  // Generate description from fields for backward compatibility
  apartment.description = `Price: ${apartment.price}
Rooms: ${apartment.rooms}
Location: ${apartment.location}
City: ${apartment.city}
Utilities: ${apartment.utilities}
Parking: ${apartment.parking}
Pet Policy: ${apartment.petPolicy}
Available: ${apartment.available}
Note: ${apartment.note}`
  
  return apartment
}

/**
 * Fetches all apartments from n8n Data Table
 */
export const getApartments = async (): Promise<Apartment[]> => {
  const response = await fetch(LIST_APARTMENTS_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch apartments: ${response.statusText}`)
  }

  const data: RawApartment[] = await response.json()
  return data.map(mapApartment)
}

/**
 * Creates a new apartment in n8n Data Table
 */
export const createApartment = async (
  name: string,
  description: string
): Promise<void> => {
  const response = await fetch(ADD_APARTMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create apartment: ${response.statusText}`)
  }
}


