"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { mutate } from "swr"
import { type Apartment } from "@/lib/api"

interface DeleteApartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apartmentId: string | null
  apartmentName: string
}

export const DeleteApartmentDialog = ({
  open,
  onOpenChange,
  apartmentId,
  apartmentName,
}: DeleteApartmentDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!apartmentName) return

    setIsDeleting(true)
    setError(null)

    // Optimistically remove the apartment from the UI immediately
    mutate(
      "/api/apartments",
      async (currentApartments: Apartment[] | undefined) => {
        // Remove the apartment from the list by name
        const updated = currentApartments
          ? currentApartments.filter((apt) => apt.name !== apartmentName)
          : []
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

    // Close dialog immediately
    onOpenChange(false)

    // Try to delete from backend in the background
    try {
      const response = await fetch("/api/apartments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: apartmentName,
        }),
      })

      // Refresh the display (from localStorage)
      mutate("/api/apartments")
    } catch (err) {
      console.error("Error deleting apartment:", err)
      // Refresh to restore the apartment if delete failed
      mutate("/api/apartments")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;{apartmentName}&quot;. This action cannot be undone.
          </AlertDialogDescription>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

