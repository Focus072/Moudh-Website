"use client"

import { useState } from "react"
import useSWR from "swr"
import { signOut, useSession } from "next-auth/react"
import { ApartmentCard } from "@/components/ApartmentCard"
import { AddApartmentForm } from "@/components/AddApartmentForm"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Loader2, RefreshCw, LogOut } from "lucide-react"
import { type Apartment } from "@/lib/api"

const fetcher = async (url: string): Promise<Apartment[]> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch apartments' }))
      throw new Error(errorData.error || `Failed to fetch apartments: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Check if MongoDB is running and accessible.')
      }
      throw error
    }
    throw new Error('Failed to fetch apartments')
  }
}

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { data: session } = useSession()
  
  const { data: apartments, error, isLoading, mutate: refreshApartments } = useSWR<Apartment[]>(
    "/api/apartments",
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )
  
  const displayApartments = apartments || []

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Property Management Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage your apartment listings and track rental status
              </p>
              {session?.user?.name && (
                <p className="text-sm text-muted-foreground mt-1">
                  Signed in as: <span className="font-medium">{session.user.name}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refreshApartments()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                Add Apartment
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading apartments...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive text-lg mb-2">
              Error loading apartments
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <Button onClick={() => refreshApartments()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {displayApartments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No apartments found. Add your first apartment to get started.
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  Add Apartment
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayApartments.map((apartment) => (
                  <ApartmentCard key={apartment.id} apartment={apartment} />
                ))}
              </div>
            )}
          </>
        )}

        <AddApartmentForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>
    </main>
    </ProtectedRoute>
  )
}

