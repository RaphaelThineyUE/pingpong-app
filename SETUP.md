# Quick Setup Guide

## 🚀 Getting Started in 3 Steps

### 1. Configure Google Sheets (5 minutes)

Open `src/app/google-sheets.service.ts` and replace:

```typescript
private SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
private API_KEY = 'YOUR_API_KEY_HERE';
```

**How to get these:**

- **Spreadsheet ID**: Open your Google Sheet, copy the ID from the URL
  - Example: `https://docs.google.com/spreadsheets/d/1abc...xyz/edit`
  - Copy: `1abc...xyz`

- **API Key**: 
  1. Go to https://console.cloud.google.com/
  2. Enable Google Sheets API
  3. Create API Key in Credentials
  4. Copy the key

**Make your sheet public:**
- Click "Share" → "Anyone with the link" → "Viewer"

### 2. Install & Run (2 minutes)

```bash
cd /home/rapha/pingpong/pingpong-app
npm install
npm start
```

Open: http://localhost:4200/

### 3. Use the App

1. Select Player 1 from dropdown
2. Select Player 2 from dropdown
3. Enter scores for both players
4. Click "Record Match"

Done! 🎉

## 📱 Install as PWA

**On Mobile:**
1. Open the app in Chrome/Safari
2. Tap "Add to Home Screen"
3. Launch from home screen like a native app

**Features:**
- Works offline
- Saves matches locally
- Syncs to Google Sheets when online

## 🎨 Customize

**Change Players:**
Edit `src/app/app.component.ts`:
```typescript
players = ['Your', 'Player', 'Names', 'Here'];
```

**Change Colors:**
Edit Tailwind classes in `src/app/app.component.html`

## 🔧 Troubleshooting

**Can't connect to Google Sheets?**
- Check API key is correct
- Verify Spreadsheet ID
- Make sure sheet is public (Anyone with link → Viewer)
- Check browser console for error messages

**App not loading?**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📝 Data Format

Your Google Sheet will be populated like this:

| Player 1 | Score 1 | Player 2 | Score 2 |
|----------|---------|----------|---------|
| Dad      | 21      | Luc      | 19      |
| Alex     | 18      | Mom      | 21      |

## 🎯 Next Steps

1. ✅ Test the app locally
2. ✅ Configure Google Sheets API
3. ✅ Record a test match
4. ✅ Check your Google Sheet
5. ✅ Install as PWA on your phone

Need help? Check the full README.md for detailed instructions.
