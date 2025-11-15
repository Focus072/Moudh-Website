# Database Setup Guide

## Overview
Your application now uses MongoDB to store apartments persistently. Each apartment is associated with the logged-in user, so apartments will persist across different browsers and devices.

## Setup Steps

### 1. Get MongoDB Connection String

You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Use connection string: `mongodb://localhost:27017/property-management`

### 2. Create `.env.local` File

Create a `.env.local` file in the root directory with:

```env
MONGODB_URI=your-mongodb-connection-string-here
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

**Important:** Replace `your-mongodb-connection-string-here` with your actual MongoDB connection string.

### 3. Update MongoDB Connection String

In your MongoDB connection string, replace:
- `<password>` with your actual password
- `<database>` with `property-management` (or any name you prefer)

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/property-management?retryWrites=true&w=majority
```

### 4. Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to your application
3. Add an apartment
4. Log out and log in from a different browser/device
5. Your apartments should still be there!

## What Changed

- ✅ All apartments are now stored in MongoDB
- ✅ Each apartment is linked to the logged-in user
- ✅ Data persists across browsers/devices
- ✅ Removed localStorage dependency
- ✅ All CRUD operations (Create, Read, Update, Delete) work with the database

## Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"
- Make sure you created `.env.local` file in the root directory
- Make sure `MONGODB_URI` is set correctly
- Restart your development server after creating/updating `.env.local`

### Error: "Failed to connect to MongoDB"
- Check your MongoDB connection string
- Make sure your IP is whitelisted in MongoDB Atlas (if using Atlas)
- Check your internet connection

### Apartments not showing up
- Make sure you're logged in
- Check the browser console for errors
- Verify MongoDB connection is working

## Next Steps

After testing locally, you'll need to:
1. Set `MONGODB_URI` in your production environment (Vercel, etc.)
2. Set `NEXTAUTH_SECRET` in production
3. Deploy and test

