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
    if (!apartmentId) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch("/api/apartments/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: apartmentId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete apartment")
      }

      // Refresh the apartments list from the database
      mutate("/api/apartments")
      
      // Close dialog
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete apartment")
      console.error("Error deleting apartment:", err)
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

