# Google Sheets Integration Setup Guide

## Problem
The 401 Unauthorized error occurs because **API keys only provide read-only access** to Google Sheets. Write operations require OAuth2 authentication, which is complex to implement in a client-side app.

## Solution: Google Apps Script Web App
We've implemented a Google Apps Script Web App that acts as a secure backend to write data to your Google Sheet.

---

## Setup Steps

### Step 1: Create the Web App

1. **Open your Google Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/1dULWW8j8ExvL5b-yMM7TP9kA5QABWWU7YQ9vGPi9HRI

2. **Open Apps Script Editor**
   - Click: `Extensions` → `Apps Script`
   - This opens the script editor in a new tab

3. **Add the Script**
   - Delete any existing code in `Code.gs`
   - Copy the entire content from `google-apps-script/Code.gs` in this project
   - Paste it into the Apps Script editor

4. **Save the Script**
   - Click the save icon (💾) or press `Ctrl+S` / `Cmd+S`
   - Name your project: "PingPong Stats API"

### Step 2: Deploy the Web App

1. **Start Deployment**
   - Click `Deploy` → `New deployment`

2. **Configure Deployment**
   - Click the ⚙️ (gear icon) next to "Select type"
   - Choose `Web app`
   
3. **Set Configuration**
   - **Description**: `PingPong Stats API v1`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: Choose one:
     - `Anyone` - No Google login required (easiest)
     - `Anyone with Google account` - Requires Google login (more secure)

4. **Deploy**
   - Click `Deploy`
   - **First time only**: You'll need to authorize:
     - Click `Authorize access`
     - Choose your Google account
     - Click `Advanced` → `Go to [Project Name] (unsafe)`
     - Click `Allow`

5. **Copy the Web App URL**
   - After deployment, copy the `Web app URL`
   - It will look like: `https://script.google.com/macros/s/AKfycby.../exec`
   - **IMPORTANT**: Save this URL!

### Step 3: Configure Your Angular App

1. **Update Development Environment**
   - Open `src/environments/environment.ts`
   - Replace the empty `webAppUrl` with your URL:
   ```typescript
   export const environment = {
     production: false,
     googleSheets: {
       spreadsheetId: '1dULWW8j8ExvL5b-yMM7TP9kA5QABWWU7YQ9vGPi9HRI',
       apiKey: 'AIzaSyAEYXF_l04hq9SSpcJCtW8qTlDIdRWH7OA',
       sheetName: 'Sheet1',
       webAppUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
     }
   };
   ```

2. **Update Production Environment**
   - Open `src/environments/environment.prod.ts`
   - Add the same URL to `webAppUrl`

3. **Rebuild and Test**
   ```bash
   npm run build
   npm start
   ```

---

## Testing

### Test in Apps Script (Optional)
1. In the Apps Script editor, select the `testAppendRow` function from the dropdown
2. Click `Run` (▶️)
3. Check your Google Sheet - a test row should appear

### Test Your App
1. Start your Angular app: `npm start`
2. Submit a match
3. Check your Google Sheet - the match should appear as a new row

---

## Troubleshooting

### "Authorization required" error
- **Solution**: The script needs permission to access your sheet
- Click `Review permissions` and authorize

### CORS errors (Status 0, "Unknown Error")
- **Solution**: Redeploy your Google Apps Script with the updated code
- Steps:
  1. Open your Google Sheet → Extensions → Apps Script
  2. Copy the LATEST code from `google-apps-script/Code.gs` (it was updated to fix CORS)
  3. Click `Deploy` → `Manage deployments`
  4. Click the edit icon (✏️) next to your active deployment
  5. Under "Version", select `New version`
  6. Add description: "Fixed CORS handling"
  7. Click `Deploy`
  8. The URL stays the same - no need to update your environment files
  9. Wait 1-2 minutes, then test your app again

### 404 error when posting
- **Solution**: Wrong URL or script not deployed
- Verify the URL is correct and deployment is active

### Data not appearing in sheet
- **Solution**: Check sheet name matches
- The script looks for 'Sheet1' - update if your sheet has a different name

### "Who has access" setting
- **"Anyone"**: Best for development, no authentication needed
- **"Anyone with Google account"**: More secure, requires Google login
- If you choose the latter, your app users will see a redirect to Google sign-in

---

## How It Works

```
Angular App → Google Apps Script Web App → Google Sheet
     ↓                    ↓                      ↓
  POST data         Authenticates          Writes data
                    with your             (no 401 error!)
                    credentials
```

The Web App runs with **your** Google account credentials, so it has permission to write to your sheet, eliminating the 401 error!

---

## Security Notes

1. **API Key**: Can stay in code (only for reading public data)
2. **Web App URL**: Can be public (it's designed for that)
3. **Script Access**: The script runs as YOU, so it has full access to your sheet
4. **Rate Limits**: Google Apps Script has quotas (100 requests/second for free accounts)

---

## Alternative: OAuth2 Implementation

If you need user-specific authentication (each user writes to their own sheet), you'll need to implement OAuth2:
- More complex setup
- Requires Google Cloud Console configuration
- Better for multi-tenant applications

For a personal/family app, the Web App approach is recommended.
