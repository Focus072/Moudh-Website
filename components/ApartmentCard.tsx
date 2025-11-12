"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Apartment } from "@/lib/api"
import { Loader2, Edit, Trash2 } from "lucide-react"
import { mutate } from "swr"
import { EditApartmentForm } from "@/components/EditApartmentForm"
import { DeleteApartmentDialog } from "@/components/DeleteApartmentDialog"

interface ApartmentCardProps {
  apartment: Apartment
}

export const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleStatusUpdate = async (newStatus: "Available" | "Rented") => {
    setIsUpdatingStatus(true)
    setError(null)

    // Optimistically update the status in the UI immediately
    mutate(
      "/api/apartments",
      async (currentApartments: Apartment[] | undefined) => {
        if (!currentApartments) return currentApartments
        const updated = currentApartments.map((apt) =>
          apt.name === apartment.name ? { ...apt, status: newStatus } : apt
        )
        // Also update localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("apartments_cache", JSON.stringify(updated))
          } catch {
            // Ignore localStorage errors
          }
        }
        return updated
      },
      false // Don't revalidate immediately
    )

    try {
      const response = await fetch("/api/apartments/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: apartment.name,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update status")
      }

      // Refresh the display (from localStorage)
      mutate("/api/apartments")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
      // Refresh to restore original status if update failed
      mutate("/api/apartments")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const isAvailable = apartment.status === "Available"
  const isDisabled = isUpdatingStatus

  // Ensure we have valid data
  if (!apartment.id && !apartment.name) {
    return null
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{apartment.name || "Unnamed Apartment"}</CardTitle>
            <Badge
              variant={isAvailable ? "success" : "rented"}
              className="ml-2"
            >
              {apartment.status || "Available"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-muted-foreground">Price:</span>
                <p className="text-foreground">{apartment.price || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Rooms:</span>
                <p className="text-foreground">{apartment.rooms || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Location:</span>
                <p className="text-foreground">{apartment.location || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">City:</span>
                <p className="text-foreground">{apartment.city || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Utilities:</span>
                <p className="text-foreground">{apartment.utilities || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Parking:</span>
                <p className="text-foreground">{apartment.parking || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Pet Policy:</span>
                <p className="text-foreground">{apartment.petPolicy || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Available:</span>
                <p className="text-foreground">{apartment.available || "N/A"}</p>
              </div>
            </div>
            {apartment.note && (
              <div className="pt-2 border-t">
                <span className="font-medium text-muted-foreground">Note:</span>
                <p className="text-foreground mt-1">{apartment.note}</p>
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              onClick={() => setIsEditOpen(true)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => setIsDeleteOpen(true)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button
            onClick={() => handleStatusUpdate(isAvailable ? "Rented" : "Available")}
            disabled={isDisabled}
            variant={isAvailable ? "default" : "secondary"}
            className="w-full"
            size="sm"
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : isAvailable ? (
              "Mark as Rented"
            ) : (
              "Mark as Available"
            )}
          </Button>
        </CardFooter>
      </Card>

      <EditApartmentForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        apartment={apartment}
      />

      <DeleteApartmentDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        apartmentId={apartment.id}
        apartmentName={apartment.name || "Unnamed Apartment"}
      />
    </>
  )
}

