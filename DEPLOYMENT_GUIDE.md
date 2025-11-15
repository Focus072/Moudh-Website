# Deployment Guide - Make Your Website Work 24/7

## Overview
To make your website work when your computer is off, you need:
1. **MongoDB Atlas** (cloud database) - FREE
2. **Vercel** (cloud hosting) - FREE

## Step 1: Set Up MongoDB Atlas (Cloud Database)

### 1.1 Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for FREE account
3. Choose the FREE (M0) tier

### 1.2 Create Cluster
1. Click "Build a Database"
2. Select **FREE (M0)** tier
3. Choose a cloud provider and region (closest to you)
4. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (SAVE THESE!)
5. Set privileges to "Atlas admin"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### 1.6 Update Connection String
Replace `<password>` with your actual password and add database name:
```
mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/property-management?retryWrites=true&w=majority
```

## Step 2: Update Your Local .env.local

Update your `.env.local` file with the MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/property-management?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

**Important:** Replace `username`, `password`, and `cluster0.xxxxx` with your actual values!

## Step 3: Test Locally

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Test adding an apartment - it should save to MongoDB Atlas

3. Check MongoDB Atlas → Browse Collections to see your data

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub
1. Make sure your code is committed to GitHub
2. If not, commit and push:
   ```bash
   git add .
   git commit -m "Add database integration"
   git push origin main
   ```

### 4.2 Deploy on Vercel
1. Go to: https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### 4.3 Add Environment Variables in Vercel
**CRITICAL STEP!**

1. In Vercel project settings, go to "Environment Variables"
2. Add these variables:
   - **Name:** `MONGODB_URI`
   - **Value:** Your MongoDB Atlas connection string
   - **Environment:** Production, Preview, Development (select all)
   
   - **Name:** `NEXTAUTH_SECRET`
   - **Value:** Generate a random secret (run: `openssl rand -base64 32`)
   - **Environment:** Production, Preview, Development (select all)

3. Click "Save"

### 4.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your website will be live at: `your-project.vercel.app`

## Step 5: Verify It Works

1. Visit your Vercel URL
2. Log in
3. Add an apartment
4. Turn off your computer
5. Visit the URL again - it should still work! 🎉

## Troubleshooting

### Database Connection Issues
- Make sure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
- Verify connection string has correct password
- Check Vercel environment variables are set correctly

### Deployment Issues
- Make sure all environment variables are added in Vercel
- Check Vercel build logs for errors
- Verify `.env.local` is NOT committed to GitHub (it's in .gitignore)

## Cost

- **MongoDB Atlas:** FREE (M0 tier - 512MB storage)
- **Vercel:** FREE (Hobby plan - unlimited projects)

Both are free for your use case! 🎉

