import mongoose, { Schema, Document } from 'mongoose'

export interface IApartment extends Document {
  userId: string
  name: string
  price: string
  rooms: string
  location: string
  city: string
  utilities: string
  parking: string
  petPolicy: string
  available: string
  note: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const ApartmentSchema = new Schema<IApartment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    rooms: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    utilities: {
      type: String,
      required: true,
    },
    parking: {
      type: String,
      required: true,
    },
    petPolicy: {
      type: String,
      required: true,
    },
    available: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Apartment || mongoose.model<IApartment>('Apartment', ApartmentSchema)

