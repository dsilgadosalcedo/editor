# Clerk JWT Template Setup for Convex

## The Issue

You're getting the error: "No auth provider found matching the given token"

This means the JWT template in Clerk is not set up correctly for Convex.

## Steps to Fix

### 1. Go to your Clerk Dashboard

- Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
- Select your application (the one with domain: eager-impala-7.clerk.accounts.dev)

### 2. Create JWT Template

1. In the left sidebar, click on **"JWT Templates"**
2. Click **"+ New template"**
3. Select **"Convex"** from the list of templates
4. **IMPORTANT**: The template name MUST be exactly `convex` (lowercase)
5. The issuer should automatically be set to: `https://eager-impala-7.clerk.accounts.dev`
6. Click **"Apply Changes"**

### 3. Verify the Template

- Make sure the template is named exactly `convex`
- The issuer URL should match: `https://eager-impala-7.clerk.accounts.dev`
- The audience should be set to `convex`

### 4. Test the Setup

After creating the template:

1. Sign out of your app completely
2. Sign back in
3. Check the browser console for debug logs
4. The authentication should now work

## Current Configuration

Your current auth config in `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: "https://eager-impala-7.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

This matches your Clerk domain, so the issue is likely the missing JWT template.

## If Still Not Working

1. Check that the JWT template is named exactly `convex` (case-sensitive)
2. Verify the issuer URL matches exactly
3. Try clearing your browser cookies and signing in again
4. Check the browser console for any additional error messages
