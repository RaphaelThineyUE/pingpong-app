import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetsService } from './google-sheets.service';

interface Match {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  dateTime: string;
  sheetRow?: number;
}

interface MatchForm {
  player1: string;
  player2: string;
  score1: number | null;
  score2: number | null;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PingPong Stats Tracker';

  players = ['Dad', 'Luc', 'Alex', 'Mom'];

  match: MatchForm = {
    player1: '',
    player2: '',
    score1: null,
    score2: null
  };

  matches: Match[] = [];
  submitting = false;

  constructor(
    private googleSheetsService: GoogleSheetsService
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  get availablePlayers2(): string[] {
    return this.players.filter(p => p !== this.match.player1);
  }

  submitMatch() {
    if (this.match.player1 && this.match.player2 &&
      this.match.score1 !== null && this.match.score2 !== null) {

      this.submitting = true;

      // Store match locally
      const now = new Date();
      const matchToSubmit: Match = {
        player1: this.match.player1,
        player2: this.match.player2,
        score1: this.match.score1,
        score2: this.match.score2,
        dateTime: now.toLocaleString()
      };

      this.matches.unshift(matchToSubmit);
      this.saveMatches();

      // Submit to Google Sheets (only if webAppUrl is configured)
      if (this.googleSheetsService.isConfigured()) {
        this.submitToGoogleSheets(matchToSubmit);
      } else {
        this.submitting = false;
        console.log('Google Sheets sync disabled - data saved locally only');
      }

      // Reset form
      this.match = {
        player1: this.match.player1,
        player2: this.match.player2,
        score1: null,
        score2: null
      };
    }
  }

  submitToGoogleSheets(match: Match) {
    this.googleSheetsService.submitMatch(match).subscribe({
      next: (response: unknown) => {
        console.log('Successfully submitted to Google Sheets:', response);
        this.submitting = false;
      },
      error: (error: unknown) => {
        console.error('Error submitting to Google Sheets:', error);
        console.log('Data is saved locally and can be synced later.');
        this.submitting = false;
      }
    });
  }

  saveMatches() {
    localStorage.setItem('pingpong_matches', JSON.stringify(this.matches));
  }

  loadMatches() {
    const stored = localStorage.getItem('pingpong_matches');
    if (stored) {
      this.matches = JSON.parse(stored);
    }

    if (!this.googleSheetsService.isReadConfigured()) {
      return;
    }

    this.googleSheetsService.getMatches().subscribe({
      next: (response: { values?: string[][] }) => {
        const rows = response?.values ?? [];
        const parsedMatches = this.parseMatchesFromSheetRows(rows);
        if (parsedMatches.length > 0) {
          this.matches = parsedMatches;
          this.saveMatches();
        }
      },
      error: (error: unknown) => {
        console.error('Error loading matches from Google Sheets:', error);
      }
    });
  }

  deleteMatch(index: number) {
    const [deleted] = this.matches.splice(index, 1);
    this.saveMatches();

    if (deleted?.sheetRow && this.googleSheetsService.isConfigured()) {
      this.googleSheetsService.deleteMatchFromSheet(deleted.sheetRow).subscribe({
        next: () => {
          console.log('Deleted match from Google Sheets:', deleted.sheetRow);
        },
        error: (error: unknown) => {
          console.error('Error deleting match from Google Sheets:', error);
        }
      });
    }
  }

  private parseMatchesFromSheetRows(rows: string[][]): Match[] {
    const playerColumns = this.players;
    const matches: Match[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      if (!row || row.length === 0) {
        continue;
      }

      const dateTime = row[0] ?? '';
      const normalizedDate = String(dateTime).toLowerCase();
      if (normalizedDate.includes('date')) {
        continue;
      }

      const scoredPlayers = playerColumns
        .map((player, index) => {
          const rawScore = row[index + 1];
          if (rawScore === undefined || rawScore === '') {
            return null;
          }
          const score = Number(rawScore);
          if (Number.isNaN(score)) {
            return null;
          }
          return { player, score };
        })
        .filter((entry): entry is { player: string; score: number } => entry !== null);

      if (scoredPlayers.length < 2) {
        continue;
      }

      matches.push({
        player1: scoredPlayers[0].player,
        player2: scoredPlayers[1].player,
        score1: scoredPlayers[0].score,
        score2: scoredPlayers[1].score,
        dateTime: String(dateTime),
        sheetRow: index + 1
      });
    }

    return matches.reverse();
  }
}
