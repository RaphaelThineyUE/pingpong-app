import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSheetsService } from './google-sheets.service';
import { PingPongLeaderboardService, LeaderboardResult, Match as LeaderboardMatch } from './stats-leaderboard';
import { environment } from '../environments/environment';
import { Match, MatchForm } from './db/models/match.model';
import { MatchFormComponent } from './components/match-form/match-form.component';
import { LeaderboardStatusComponent } from './components/leaderboard-status/leaderboard-status.component';
import { MatchHistoryComponent } from './components/match-history/match-history.component';
import { MatchWizardComponent } from './components/match-wizard/match-wizard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatchFormComponent, LeaderboardStatusComponent, MatchHistoryComponent, MatchWizardComponent],
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
  leaderboard: LeaderboardResult | null = null;
  startDate = '';
  endDate = '';

  constructor(
    private googleSheetsService: GoogleSheetsService,
    private leaderboardService: PingPongLeaderboardService
  ) { }

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
      this.updateLeaderboard();

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

  submitWizardMatch(match: MatchForm) {
    this.match = { ...match };
    this.submitMatch();
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
    this.updateLeaderboard();

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
          this.updateLeaderboard();
        }
      },
      error: (error: unknown) => {
        console.error('Error loading matches from Google Sheets:', error);
      }
    });
  }

  deleteMatch(match: Match) {
    const index = this.matches.indexOf(match);
    if (index === -1) {
      return;
    }

    const [deleted] = this.matches.splice(index, 1);
    this.saveMatches();
    this.updateLeaderboard();

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

  updateLeaderboard() {
    const filteredMatches = this.filteredMatches;
    if (filteredMatches.length === 0) {
      this.leaderboard = null;
      return;
    }

    const leaderboardMatches: LeaderboardMatch[] = filteredMatches.map(match => ({
      playerA: match.player1,
      scoreA: match.score1,
      playerB: match.player2,
      scoreB: match.score2
    }));

    this.leaderboard = this.leaderboardService.computeFromMatches(leaderboardMatches);
  }

  get leaderboardMatchCount(): number {
    return this.filteredMatches.length;
  }

  get filteredMatches(): Match[] {
    return this.filterMatchesByDate(this.matches);
  }

  get googleSheetUrl(): string {
    const spreadsheetId = environment.googleSheets.spreadsheetId;
    if (!spreadsheetId) {
      return '';
    }
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  }

  get googleSheetName(): string {
    return environment.googleSheets.sheetName || 'Sheet1';
  }

  onStartDateChange(value: string) {
    this.startDate = value;
    this.updateLeaderboard();
  }

  onEndDateChange(value: string) {
    this.endDate = value;
    this.updateLeaderboard();
  }

  private filterMatchesByDate(matches: Match[]): Match[] {
    if (!this.startDate && !this.endDate) {
      return matches;
    }

    const start = this.parseDateInput(this.startDate);
    const end = this.parseDateInput(this.endDate);
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    return matches.filter(match => {
      const parsed = new Date(match.dateTime);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      if (start && parsed < start) {
        return false;
      }
      if (end && parsed > end) {
        return false;
      }
      return true;
    });
  }

  private parseDateInput(value: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return null;
    }
    return new Date(year, month - 1, day);
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
