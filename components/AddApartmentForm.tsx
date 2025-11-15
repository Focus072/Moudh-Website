"use client"

import { useState } from "react"
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

interface AddApartmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddApartmentForm = ({ open, onOpenChange }: AddApartmentFormProps) => {
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationError(null)
    setSuccessMessage(null)

    // Validate required fields
    if (!name.trim()) {
      setValidationError("Name is required")
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
      const response = await fetch("/api/apartments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
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
        throw new Error(errorData.error || "Failed to create apartment")
      }

      // Reset form
      setName("")
      setPrice("")
      setRooms("")
      setLocation("")
      setCity("")
      setUtilities("")
      setParking("")
      setPetPolicy("")
      setAvailable("")
      setNote("")
      
      // Show success message
      setSuccessMessage("Apartment created successfully!")
      
      // Refresh the apartments list from the database
      mutate("/api/apartments")
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create apartment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      // Reset form when closing
      if (!newOpen) {
        setName("")
        setPrice("")
        setRooms("")
        setLocation("")
        setCity("")
        setUtilities("")
        setParking("")
        setPetPolicy("")
        setAvailable("")
        setNote("")
        setError(null)
        setValidationError(null)
        setSuccessMessage(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Apartment</DialogTitle>
          <DialogDescription>
            Add a new apartment listing. Please fill out all required fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Apartment name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="city" className="text-sm font-medium">
                City <span className="text-destructive">*</span>
              </label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., New York, Los Angeles"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price <span className="text-destructive">*</span>
              </label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., $1450/month"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="rooms" className="text-sm font-medium">
                Rooms <span className="text-destructive">*</span>
              </label>
              <Input
                id="rooms"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                placeholder="e.g., 2 bedroom"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Downtown, 123 Main St"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="utilities" className="text-sm font-medium">
                Utilities <span className="text-destructive">*</span>
              </label>
              <Input
                id="utilities"
                value={utilities}
                onChange={(e) => setUtilities(e.target.value)}
                placeholder="e.g., Included, Not included"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="parking" className="text-sm font-medium">
                Parking <span className="text-destructive">*</span>
              </label>
              <Input
                id="parking"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                placeholder="e.g., 1 space, Street parking"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="petPolicy" className="text-sm font-medium">
                Pet Policy <span className="text-destructive">*</span>
              </label>
              <Input
                id="petPolicy"
                value={petPolicy}
                onChange={(e) => setPetPolicy(e.target.value)}
                placeholder="e.g., Cats allowed, No pets"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="available" className="text-sm font-medium">
                Available <span className="text-destructive">*</span>
              </label>
              <Input
                id="available"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                placeholder="e.g., Immediately, Jan 1st"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="note" className="text-sm font-medium">
                Note
              </label>
              <Textarea
                id="note"
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
            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
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
                "Add Apartment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
