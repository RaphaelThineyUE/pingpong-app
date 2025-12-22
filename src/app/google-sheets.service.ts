import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface MatchData {
    player1: string;
    player2: string;
    score1: number;
    score2: number;
    dateTime: string;
}

@Injectable({
    providedIn: 'root'
})
export class GoogleSheetsService {

    // Configuration from environment file
    private SPREADSHEET_ID = environment.googleSheets.spreadsheetId;
    private API_KEY = environment.googleSheets.apiKey;
    private SHEET_NAME = environment.googleSheets.sheetName;
    private WEB_APP_URL = environment.googleSheets.webAppUrl;

    // Google Sheets API endpoints
    private readonly SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

    constructor(private http: HttpClient) { }

    /**
     * Check if Google Sheets Web App is configured
     */
    isConfigured(): boolean {
        return !!this.WEB_APP_URL && this.WEB_APP_URL.trim().length > 0;
    }

    /**
     * Submit a match to Google Sheets
     * The data will be appended as: [Date, Dad, Luc, Alex, Mom]
     * Only the two players who played will have scores, others will be empty
     */
    submitMatch(match: MatchData): Observable<any> {
        // If Web App URL is configured, use it (recommended for write operations)
        if (this.WEB_APP_URL) {
            return this.submitViaWebApp(match);
        }

        // Fallback to direct API (will fail with 401 for write operations without OAuth)
        return this.submitViaAPI(match);
    }

    /**
     * Submit via Google Apps Script Web App (recommended)
     */
    private submitViaWebApp(match: MatchData): Observable<any> {
        // Format data according to your CSV structure
        const players: { [key: string]: string | number } = {
            'Dad': '',
            'Luc': '',
            'Alex': '',
            'Mom': ''
        };

        players[match.player1] = match.score1;
        players[match.player2] = match.score2;

        const data = {
            dateTime: match.dateTime,
            dad: players['Dad'],
            luc: players['Luc'],
            alex: players['Alex'],
            mom: players['Mom']
        };

        // Use fetch API with redirect handling for Google Apps Script
        return new Observable(observer => {
            fetch(this.WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                redirect: 'follow'
            })
            .then(() => {
                // With no-cors mode, we can't read the response
                // But if it doesn't throw, it likely succeeded
                observer.next({ success: true, message: 'Match submitted (no-cors mode)' });
                observer.complete();
            })
            .catch((error: unknown) => {
                observer.error(error);
            });
        });
    }

    /**
     * Submit via Google Sheets API (requires OAuth2 for write operations)
     */
    private submitViaAPI(match: MatchData): Observable<any> {
        const url = `${this.SHEETS_API_URL}/${this.SPREADSHEET_ID}/values/${this.SHEET_NAME}:append`;

        const params = {
            valueInputOption: 'USER_ENTERED',
            key: this.API_KEY
        };

        // Format data according to your CSV structure
        // Each row: Date, Dad, Luc, Alex, Mom
        // Initialize all player columns as empty
        const players: { [key: string]: string | number } = {
            'Dad': '',
            'Luc': '',
            'Alex': '',
            'Mom': ''
        };

        // Set scores for the two players who played
        players[match.player1] = match.score1;
        players[match.player2] = match.score2;

        const body = {
            values: [[
                match.dateTime,
                players['Dad'],
                players['Luc'],
                players['Alex'],
                players['Mom']
            ]]
        };

        return this.http.post(url, body, { params });
    }

    /**
     * Read all matches from Google Sheets
     */
    getMatches(): Observable<any> {
        const range = `${this.SHEET_NAME}!A:E`;
        const url = `${this.SHEETS_API_URL}/${this.SPREADSHEET_ID}/values/${range}`;

        const params = {
            key: this.API_KEY
        };

        return this.http.get(url, { params });
    }
}
