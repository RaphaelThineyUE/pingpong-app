# Quick Fix for 401 Error

## What's the Problem?
❌ **API keys cannot write to Google Sheets** - they only allow read access
✅ **Solution**: Use Google Apps Script Web App

## Quick Setup (5 minutes)

### 1. Deploy the Script
```
1. Open: https://docs.google.com/spreadsheets/d/1dULWW8j8ExvL5b-yMM7TP9kA5QABWWU7YQ9vGPi9HRI
2. Extensions → Apps Script
3. Copy content from: google-apps-script/Code.gs
4. Deploy → New deployment → Web app
   - Execute as: Me
   - Access: Anyone
5. Copy the Web App URL
```

### 2. Update Your Config
Edit `src/environments/environment.ts`:
```typescript
webAppUrl: 'https://script.google.com/macros/s/YOUR_URL/exec'
```

Edit `src/environments/environment.prod.ts` (same thing)

### 3. Rebuild & Run
```bash
npm run build
npm start
```

## Need Help?
See detailed guide: [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
