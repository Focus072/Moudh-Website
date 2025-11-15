import mongoose from 'mongoose'

// Force reload environment variables
// Support both MONGODB_URI (local) and Storage_MONGODB_URI (Vercel Storage)
const MONGODB_URI = process.env.Storage_MONGODB_URI || process.env.MONGODB_URI || ''

// Extensive debug logging
console.log('🔍 [DB] Checking MONGODB_URI...')
console.log('🔍 [DB] NODE_ENV:', process.env.NODE_ENV)
console.log('🔍 [DB] MONGODB_URI exists:', !!MONGODB_URI)
console.log('🔍 [DB] MONGODB_URI value:', MONGODB_URI ? MONGODB_URI.substring(0, 30) + '...' : 'EMPTY')

if (MONGODB_URI) {
  console.log('✅ MONGODB_URI loaded successfully')
} else {
  console.error('❌ MONGODB_URI is NOT loaded from environment variables')
  console.error('❌ Make sure .env.local exists in the project root and restart the dev server')
  console.error('❌ Current working directory:', process.cwd())
}

if (!MONGODB_URI || MONGODB_URI === 'your-mongodb-connection-string-here') {
  console.error('⚠️  MONGODB_URI is not set or is using placeholder value')
  console.error('Please set MONGODB_URI in your .env.local file')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

const connectDB = async (): Promise<typeof mongoose> => {
  if (!MONGODB_URI || MONGODB_URI === 'your-mongodb-connection-string-here') {
    throw new Error('MONGODB_URI is not configured. Please set MONGODB_URI in .env.local file. See DATABASE_SETUP.md for instructions.')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    }).catch((error) => {
      cached.promise = null
      throw error
    })
  }

  try {
    // Add timeout wrapper
    cached.conn = await Promise.race([
      cached.promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout. Make sure MongoDB is running.')), 10000)
      )
    ])
  } catch (e) {
    cached.promise = null
    if (e instanceof Error) {
      if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND')) {
        throw new Error('Cannot connect to MongoDB. Please make sure MongoDB is running at ' + MONGODB_URI.split('@')[1]?.split('/')[0] || 'localhost:27017')
      }
      throw e
    }
    throw e
  }

  return cached.conn
}

export default connectDB

