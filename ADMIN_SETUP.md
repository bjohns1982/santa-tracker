# Admin-Only Access Setup

## Overview

Registration has been disabled and the application now uses environment variable-based authentication. Only the admin (you) can log in using credentials stored in environment variables.

## Changes Made

1. ✅ **Registration endpoint disabled** - Returns 403 Forbidden
2. ✅ **Login updated** - Checks against `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
3. ✅ **Frontend updated** - Registration link removed from login page, register page shows disabled message

## Setting Up Environment Variables in ECS

### Step 1: Update Backend Task Definition

**AWS Console Steps:**

1. Go to **ECS → Task Definitions → `santa-tracker-backend`**
2. Click **"Create new revision"**
3. Click on the `backend` container
4. Scroll to **Environment variables** section
5. Add or update these environment variables:
   - **Key**: `ADMIN_EMAIL`
     - **Value**: Your email address (e.g., `your-email@example.com`)
   - **Key**: `ADMIN_PASSWORD`
     - **Value**: Your password (plain text - will be checked directly)
6. Verify other environment variables are still set:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `PORT` (`3001`)
   - `NODE_ENV` (`production`)
   - `FRONTEND_URL` (`https://www.santa-tour.com`)
7. Click **"Create"** to create new revision

### Step 2: Update ECS Service

1. Go to **ECS → Services → `santa-tracker-backend-service` → Update**
2. Under **Task definition**, select the new revision
3. Check **"Force new deployment"**
4. Click **"Update"**
5. Wait 2-3 minutes for deployment

### Step 3: Test Login

1. Go to `https://www.santa-tour.com/login`
2. Enter your `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. You should be able to log in successfully

## Security Notes

- **Password is stored in plain text** in the environment variable (for simplicity)
- **Only you know the credentials** - they're not exposed in the frontend
- **Registration is completely disabled** - no one can create new accounts
- **Environment variables are encrypted at rest** in ECS

## Changing Your Password

To change your password:

1. Go to **ECS → Task Definitions → `santa-tracker-backend` → Create new revision**
2. Update the `ADMIN_PASSWORD` environment variable
3. Update the service to use the new revision
4. Force new deployment

## Optional: Customize Admin Name

If you want to customize the admin name (currently defaults to "Admin"):

1. Add environment variable:
   - **Key**: `ADMIN_NAME`
   - **Value**: Your preferred name (e.g., `Brandon`)
2. Update the backend code to use `process.env.ADMIN_NAME` instead of hardcoded "Admin"

## Troubleshooting

### Can't Log In

- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly in the task definition
- Check that the service is using the latest task definition revision
- Check backend logs for any errors

### Registration Still Works

- Make sure you've deployed the new backend code
- Check that the service is using the updated task definition
- Clear browser cache and try again

## Summary

- ✅ Registration disabled
- ✅ Login checks against `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- ✅ Only you can access the application
- ✅ Simple to update credentials via environment variables

