import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GoogleSheetsService } from './google-sheets.service';

interface Match {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  dateTime: string;
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
export class AppComponent {
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
    private http: HttpClient,
    private googleSheetsService: GoogleSheetsService
  ) {
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
  }

  deleteMatch(index: number) {
    this.matches.splice(index, 1);
    this.saveMatches();
  }
}
