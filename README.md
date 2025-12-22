# 🏓 PingPong Stats Tracker

A Progressive Web App (PWA) built with Angular 17 and Tailwind CSS for tracking ping pong match scores with Google Sheets integration.

## Features

- ✅ **Easy Score Entry**: Select two players and enter their scores
- 📱 **Progressive Web App**: Install on mobile devices and use offline
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 💾 **Local Storage**: Automatically saves matches locally
- ☁️ **Google Sheets Sync**: Syncs match data to Google Sheets
- 🏆 **Match History**: View recent matches with winner indicators

## Prerequisites

- Node.js v18.19.1 or higher
- npm 9.2.0 or higher
- Google Cloud Platform account (for Google Sheets API)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /home/rapha/pingpong/pingpong-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Google Sheets API Setup

To enable Google Sheets integration, you need to set up the Google Sheets API:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Application restrictions", you can restrict by HTTP referrers

### Step 3: Prepare Your Google Sheet

1. Open your Google Sheet (or create a new one)
2. Make sure your sheet is named "Sheet1" (or update the service accordingly)
3. Set the sheet to be publicly readable:
   - Click "Share" button
   - Change "Restricted" to "Anyone with the link"
   - Set permission to "Viewer"
4. Copy your Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the `SPREADSHEET_ID` part

### Step 4: Configure the Application

Edit the file `src/app/google-sheets.service.ts`:

```typescript
// Replace these values with your own
private SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
private API_KEY = 'YOUR_API_KEY_HERE';
private SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name
```

## Data Format

The app submits data to Google Sheets in the following format:

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| Player 1 | Score 1  | Player 2 | Score 2  |
| Dad      | 21       | Luc      | 19       |
| Mom      | 18       | Alex     | 21       |

This matches your existing CSV structure.

## Running the Application

### Development Mode

```bash
npm start
```

or

```bash
ng serve
```

The application will be available at `http://localhost:4200/`

### Production Build

To build the application with PWA support:

```bash
npm run build
```

The production files will be in the `dist/pingpong-app` directory.

### Serve Production Build Locally

To test the production build with PWA features:

```bash
npx http-server -p 8080 -c-1 dist/pingpong-app/browser
```

Then open `http://localhost:8080/` in your browser.

## PWA Features

### Installing on Mobile

1. Open the app in a mobile browser (Chrome, Safari, etc.)
2. Look for the "Add to Home Screen" or "Install" prompt
3. The app will be installed as a standalone app on your device

### Offline Support

- The app uses a service worker to cache resources
- Matches are saved to local storage
- When offline, matches are stored locally and can be synced when back online

## Project Structure

```
pingpong-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # Main component with match logic
│   │   ├── app.component.html        # UI template
│   │   ├── app.component.css         # Component styles
│   │   ├── app.config.ts             # App configuration with PWA
│   │   └── google-sheets.service.ts  # Google Sheets API integration
│   ├── assets/                       # Static assets
│   ├── index.html                    # Main HTML file
│   ├── manifest.webmanifest          # PWA manifest
│   └── styles.css                    # Global styles (Tailwind)
├── angular.json                      # Angular configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── ngsw-config.json                 # Service worker configuration
└── package.json                     # Dependencies
```

## Technologies Used

- **Angular 17**: Modern web framework
- **Tailwind CSS**: Utility-first CSS framework
- **Google Sheets API**: Data synchronization
- **Service Worker**: PWA offline support
- **TypeScript**: Type-safe development

## Customization

### Change Players

Edit the `players` array in `src/app/app.component.ts`:

```typescript
players = ['Dad', 'Luc', 'Alex', 'Mom'];
```

### Change Theme Colors

Edit `src/manifest.webmanifest` and Tailwind classes in the HTML template.

### Change App Name

1. Update `name` and `short_name` in `src/manifest.webmanifest`
2. Update the title in `src/index.html`
3. Update the title in `src/app/app.component.ts`

## Troubleshooting

### Google Sheets API Errors

- **403 Forbidden**: Check that your API key is correct and not restricted
- **404 Not Found**: Verify your Spreadsheet ID is correct
- **CORS errors**: Make sure your sheet is publicly accessible

### Service Worker Not Working

- Service workers only work over HTTPS or localhost
- Clear your browser cache and reload
- Check the browser console for service worker registration errors

### Build Issues

If you encounter build errors:

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## Browser Support

- Chrome/Edge (recommended for PWA features)
- Firefox
- Safari (iOS 11.3+)
- Opera

## License

MIT

## Support

For issues or questions, please check the browser console for errors and ensure:
1. Google Sheets API is properly configured
2. Your spreadsheet is accessible
3. Your API key has the correct permissions

---

Made with ❤️ for ping pong enthusiasts!
