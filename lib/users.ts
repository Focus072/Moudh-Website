export interface User {
  username: string
  password: string // This will be hashed
}

// Store users - in production, this should be in a database
// For now, we'll use a simple array. You can manually add users here.
// Password: Apartments123
const users: User[] = [
  {
    username: "Moudh",
    // Pre-hashed password for "Apartments123"
    password: "$2b$10$L8twL43Zra1/8DNkc43BauuuWGD/El6YCir9I8pTS/g0woG92phGy",
  },
]

// Verify user credentials
export const verifyUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // Dynamically import bcryptjs to avoid SSR issues
    const bcrypt = (await import("bcryptjs")).default
    
    // Case-insensitive username comparison
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (!user) {
      return null
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return null
    }
    
    return { username: user.username, password: user.password }
  } catch (error) {
    console.error("Error verifying user:", error)
    return null
  }
}

// Get user by username (case-insensitive)
export const getUserByUsername = async (username: string): Promise<User | null> => {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null
}

// Add a new user (for manual account creation)
// To add a new user, call this function and update the users array
export const addUser = async (username: string, password: string): Promise<string> => {
  // Dynamically import bcryptjs to avoid SSR issues
  const bcrypt = (await import("bcryptjs")).default
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword // Return the hash so you can add it to the users array manually
}

