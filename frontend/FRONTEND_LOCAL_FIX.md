# Frontend Local Development Fix

## Issue
Vite is getting a permission error (`EPERM: operation not permitted`) when trying to write temporary files.

## Solutions

### Solution 1: Clear Vite Cache (Try This First)

```bash
cd frontend
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Solution 2: Check File Permissions

```bash
cd frontend
chmod -R u+w .
npm run dev
```

### Solution 3: Delete Vite Config Timestamp Files

```bash
cd frontend
rm -f vite.config.ts.timestamp-*
npm run dev
```

### Solution 4: Reinstall Dependencies

```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Solution 5: Check if Port 5173 is Already in Use

```bash
lsof -ti:5173
# If something is running, kill it:
kill -9 $(lsof -ti:5173)
npm run dev
```

## Environment Variables

Make sure you have a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## Expected Behavior

When working correctly, `npm run dev` should:
1. Start Vite dev server
2. Show: `Local: http://localhost:5173/`
3. Open browser automatically or provide the URL

## If Still Not Working

Try running with verbose output:
```bash
cd frontend
npm run dev -- --debug
```

This will show more detailed error messages.

