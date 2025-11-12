import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

export const getSession = async () => {
  return await getServerSession(authOptions)
}

export const requireAuth = async () => {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

