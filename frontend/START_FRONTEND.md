# Starting Frontend Locally

## Quick Start

1. **Kill any existing processes on port 5173:**
   ```bash
   kill -9 $(lsof -ti:5173) 2>/dev/null
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Clear Vite cache (if having issues):**
   ```bash
   rm -rf node_modules/.vite
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Should automatically open to `http://localhost:5173`
   - Or manually navigate to: `http://localhost:5173`

## Troubleshooting

### Port Already in Use

If you see "Port 5173 is in use", kill the process:
```bash
kill -9 $(lsof -ti:5173)
npm run dev
```

### ERR_FAILED in Browser

1. Make sure the dev server is actually running (check terminal output)
2. Try `http://127.0.0.1:5173` instead of `localhost:5173`
3. Check if firewall is blocking the connection
4. Clear browser cache and try again

### Permission Errors

```bash
cd frontend
chmod -R u+w .
rm -rf node_modules/.vite
npm run dev
```

### Still Not Working?

Try with explicit host binding:
```bash
npm run dev -- --host localhost --port 5173
```

## Expected Output

When working correctly, you should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The browser should automatically open, or you can manually navigate to the URL shown.

