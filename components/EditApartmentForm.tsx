"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { mutate } from "swr"
import { Loader2 } from "lucide-react"
import { type Apartment } from "@/lib/api"

interface EditApartmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apartment: Apartment | null
}

export const EditApartmentForm = ({ open, onOpenChange, apartment }: EditApartmentFormProps) => {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [rooms, setRooms] = useState("")
  const [location, setLocation] = useState("")
  const [city, setCity] = useState("")
  const [utilities, setUtilities] = useState("")
  const [parking, setParking] = useState("")
  const [petPolicy, setPetPolicy] = useState("")
  const [available, setAvailable] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Update form when apartment changes
  useEffect(() => {
    if (apartment) {
      setName(apartment.name || "")
      setPrice(apartment.price || "")
      setRooms(apartment.rooms || "")
      setLocation(apartment.location || "")
      setCity(apartment.city || "")
      setUtilities(apartment.utilities || "")
      setParking(apartment.parking || "")
      setPetPolicy(apartment.petPolicy || "")
      setAvailable(apartment.available || "")
      setNote(apartment.note || "")
    }
  }, [apartment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apartment) return

    setError(null)
    setValidationError(null)

    // Name is not editable, so we just need to ensure it exists
    if (!apartment.name) {
      setValidationError("Apartment name is missing")
      return
    }
    if (!price.trim()) {
      setValidationError("Price is required")
      return
    }
    if (!rooms.trim()) {
      setValidationError("Rooms is required")
      return
    }
    if (!location.trim()) {
      setValidationError("Location is required")
      return
    }
    if (!city.trim()) {
      setValidationError("City is required")
      return
    }
    if (!utilities.trim()) {
      setValidationError("Utilities is required")
      return
    }
    if (!parking.trim()) {
      setValidationError("Parking is required")
      return
    }
    if (!petPolicy.trim()) {
      setValidationError("Pet Policy is required")
      return
    }
    if (!available.trim()) {
      setValidationError("Available is required")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/apartments/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: apartment.id,
          name: apartment.name, // Use original name (not editable)
          price: price.trim(),
          rooms: rooms.trim(),
          location: location.trim(),
          city: city.trim(),
          utilities: utilities.trim(),
          parking: parking.trim(),
          petPolicy: petPolicy.trim(),
          available: available.trim(),
          note: note.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update apartment")
      }

      // Refresh the apartments list from the database
      mutate("/api/apartments")

      // Close dialog
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update apartment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen && apartment) {
        // Reset to apartment values when closing
        setName(apartment.name || "")
        setPrice(apartment.price || "")
        setRooms(apartment.rooms || "")
        setLocation(apartment.location || "")
        setCity(apartment.city || "")
        setUtilities(apartment.utilities || "")
        setParking(apartment.parking || "")
        setPetPolicy(apartment.petPolicy || "")
        setAvailable(apartment.available || "")
        setNote(apartment.note || "")
        setError(null)
        setValidationError(null)
      }
    }
  }

  if (!apartment) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Apartment</DialogTitle>
          <DialogDescription>
            Update the apartment details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-name"
                value={name}
                disabled={true}
                placeholder="Apartment name"
                className="bg-muted cursor-not-allowed"
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                The apartment name cannot be changed.
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-city" className="text-sm font-medium">
                City <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., New York, Los Angeles"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-price" className="text-sm font-medium">
                Price <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., $1450/month"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-rooms" className="text-sm font-medium">
                Rooms <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-rooms"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                placeholder="e.g., 2 bedroom"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Downtown, 123 Main St"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-utilities" className="text-sm font-medium">
                Utilities <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-utilities"
                value={utilities}
                onChange={(e) => setUtilities(e.target.value)}
                placeholder="e.g., Included, Not included"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-parking" className="text-sm font-medium">
                Parking <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-parking"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                placeholder="e.g., 1 space, Street parking"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-petPolicy" className="text-sm font-medium">
                Pet Policy <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-petPolicy"
                value={petPolicy}
                onChange={(e) => setPetPolicy(e.target.value)}
                placeholder="e.g., Cats allowed, No pets"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-available" className="text-sm font-medium">
                Available <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-available"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                placeholder="e.g., Immediately, Jan 1st"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-note" className="text-sm font-medium">
                Note
              </label>
              <Textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional notes (optional)"
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
