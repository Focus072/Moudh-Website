"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { signOut, useSession } from "next-auth/react"
import { ApartmentCard } from "@/components/ApartmentCard"
import { AddApartmentForm } from "@/components/AddApartmentForm"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Loader2, RefreshCw, LogOut } from "lucide-react"
import { type Apartment } from "@/lib/api"

// Helper functions to persist apartments in localStorage
const STORAGE_KEY = "apartments_cache"

const getCachedApartments = (): Apartment[] | null => {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const setCachedApartments = (apartments: Apartment[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments))
  } catch {
    // Ignore localStorage errors
  }
}

const fetcher = async (url: string): Promise<Apartment[]> => {
  // This app only sends data TO n8n, it doesn't receive data FROM n8n
  // So we always return apartments from localStorage
  if (typeof window === "undefined") {
    return []
  }
  const cached = getCachedApartments()
  return cached || []
}

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  
  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Get initial data safely (only on client after mount)
  const initialData = mounted ? (getCachedApartments() || []) : []
  
  const { data: apartments, error, isLoading, mutate: refreshApartments } = useSWR<Apartment[]>(
    "/api/apartments",
    fetcher,
    {
      // No auto-refresh - only refresh on user actions
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Use cached data as initial data
      fallbackData: initialData,
    }
  )
  
  // Use apartments from cache (we don't fetch from n8n)
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

        {!isLoading && (
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

