# Fix CORS Error (Status 0)

## The Problem
You're getting: `status: 0, statusText: 'Unknown Error'` - this is a CORS error.

## The Solution
The Google Apps Script code has been updated to handle the request properly. You need to **redeploy** it.

## Steps to Fix (2 minutes)

### 1. Update Your Script
1. Open your Google Sheet
2. Go to: `Extensions` → `Apps Script`
3. **Copy the entire updated code** from `google-apps-script/Code.gs` in your project
4. **Replace all existing code** in the Apps Script editor
5. Save (Ctrl+S / Cmd+S)

### 2. Redeploy (IMPORTANT!)
1. Click `Deploy` → `Manage deployments`
2. Click the **edit icon (✏️)** next to your active deployment
3. Under "Version", select **`New version`**
4. Description: `Fixed CORS handling`
5. Click `Deploy`
6. ✅ Done! The URL stays the same

### 3. Test
1. Wait 1-2 minutes for Google to update
2. Refresh your Angular app
3. Submit a match - it should work now!

## Why This Happens
Google Apps Script needs special handling for POST requests. The updated code:
- Properly parses JSON data from Angular
- Handles different request formats
- Includes better error messages for debugging

## Still Having Issues?
Check the browser console for the error details and see [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) troubleshooting section.
