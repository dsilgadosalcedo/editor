# Cloud Storage Setup Guide

This guide will help you set up cloud storage for your projects using Clerk authentication and Convex database.

## Prerequisites

- A Convex account (free tier available)
- A Clerk account (free tier available)

## Step 1: Configure Clerk

1. **Sign up for Clerk** at [clerk.com](https://clerk.com) if you haven't already
2. **Create a new application** in the Clerk dashboard
3. **Create a JWT Template**:

   - Go to "JWT Templates" in your Clerk dashboard
   - Click "New template" and choose "Convex"
   - Copy the "Issuer" URL (it looks like `https://your-app.clerk.accounts.dev`)
   - Make sure the template name is `convex` (this is required)
   - Click "Apply Changes"

4. **Get your Clerk keys**:
   - Go to "API Keys" in your Clerk dashboard
   - Copy the "Publishable key" (starts with `pk_`)
   - Copy the "Secret key" (starts with `sk_`)

## Step 2: Configure Convex

1. **Update the auth configuration**:

   - Open `convex/auth.config.ts`
   - Replace `"https://your-clerk-domain.clerk.accounts.dev"` with your actual Clerk issuer URL from Step 1.3

2. **Deploy your Convex functions**:
   ```bash
   npx convex dev
   ```

## Step 3: Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_your_publishable_key_here
CLERK_SECRET_KEY=sk_your_secret_key_here

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url_here
```

## Step 4: Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `/projects`
3. You should see a warning banner encouraging users to sign in
4. Click "Sign In to Save" to test the authentication flow
5. Once signed in, the warning should disappear and projects will be saved to the cloud

## Features

### For Unauthenticated Users:

- Projects are saved in local storage
- Warning banner encourages cloud storage
- Can still create and manage projects locally

### For Authenticated Users:

- Projects are automatically saved to Convex cloud database
- Projects sync across devices
- No risk of losing projects when clearing browser data
- Automatic migration of local projects to cloud (optional)

### Hybrid Approach:

- Seamless transition between local and cloud storage
- Fallback to local storage if cloud is unavailable
- Maintains all existing functionality

## Troubleshooting

### "Not authenticated" errors

- Ensure your Clerk JWT template is named exactly `convex`
- Verify the issuer URL in `convex/auth.config.ts` matches your Clerk domain
- Check that your environment variables are set correctly

### Network connectivity issues

- Try running `npx convex dev` again
- Check your internet connection
- Verify your Convex deployment URL

### Projects not syncing

- Check the browser console for errors
- Ensure the user is properly authenticated
- Verify Convex functions are deployed correctly

## Migration Notes

When a user signs in for the first time:

- Their existing local projects remain in local storage
- New projects are saved to the cloud
- You can implement automatic migration by calling `migrateToCloud()` from the `useHybridProjects` hook

## Next Steps

Consider implementing:

- Project sharing capabilities
- Real-time collaboration
- Project templates
- Export/import functionality
- Version history
