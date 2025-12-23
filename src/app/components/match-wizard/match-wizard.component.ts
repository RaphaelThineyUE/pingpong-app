import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Match, MatchForm } from '../../db/models/match.model';

interface ScoreOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-match-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-wizard.component.html',
  styleUrl: './match-wizard.component.css'
})
export class MatchWizardComponent implements OnInit {
  @Input() players: string[] = [];
  @Input() matches: Match[] = [];
  @Input() submitting = false;
  @Output() matchSubmit = new EventEmitter<MatchForm>();

  isCompact = false;
  step = 0;
  winner = '';
  opponent = '';
  winnerScore = 21;
  loserScore = 15;
  selectedGif = '';
  braggingLines: string[] = [];

  readonly scoreOptions: ScoreOption[] = [
    { label: '21 (Classic)', value: 21 },
    { label: '11 (Quick)', value: 11 },
    { label: '15 (Speedy)', value: 15 }
  ];

  readonly gifs = [
    'https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif',
    'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
    'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif',
    'https://media.giphy.com/media/l0HlB1OePqB2be2yQ/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif'
  ];

  ngOnInit(): void {
    this.updateCompactMode();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCompactMode();
  }

  get winnerOptions(): string[] {
    return this.players;
  }

  get opponentOptions(): string[] {
    return this.players.filter(player => player !== this.winner);
  }

  pickWinner(player: string) {
    this.winner = player;
    this.opponent = this.getSuggestedOpponent(player);
    if (this.opponent) {
      this.setLoserScoreFromHistory();
    }
    this.step = this.isCompact ? 2 : 1;
  }

  pickOpponent(player: string) {
    this.opponent = player;
    this.setLoserScoreFromHistory();
    this.step = 2;
  }

  setWinnerScore(score: number) {
    this.winnerScore = score;
  }

  submitMatch() {
    if (!this.winner || !this.opponent || this.loserScore === null) {
      return;
    }

    const currentMatch: Match = {
      player1: this.winner,
      player2: this.opponent,
      score1: this.winnerScore,
      score2: this.loserScore,
      dateTime: new Date().toLocaleString()
    };

    this.matchSubmit.emit({
      player1: this.winner,
      player2: this.opponent,
      score1: this.winnerScore,
      score2: this.loserScore
    });

    this.braggingLines = this.buildBraggingLines([currentMatch, ...this.matches]);
    this.selectedGif = this.gifs[Math.floor(Math.random() * this.gifs.length)];
    this.step = 3;
  }

  restart() {
    this.step = 0;
    this.winner = '';
    this.opponent = '';
    this.winnerScore = 21;
    this.loserScore = 15;
    this.selectedGif = '';
    this.braggingLines = [];
  }

  private updateCompactMode() {
    this.isCompact = window.innerWidth < 640;
  }

  private getSuggestedOpponent(player: string): string {
    const lastMatch = this.matches.find(match => match.player1 === player || match.player2 === player);
    if (!lastMatch) {
      return '';
    }
    return lastMatch.player1 === player ? lastMatch.player2 : lastMatch.player1;
  }

  private setLoserScoreFromHistory() {
    if (!this.winner || !this.opponent) {
      return;
    }
    const lastMatch = this.findLastHeadToHead(this.winner, this.opponent);
    if (!lastMatch) {
      return;
    }

    const opponentScore = lastMatch.player1 === this.opponent
      ? lastMatch.score1
      : lastMatch.score2;

    if (Number.isFinite(opponentScore)) {
      this.loserScore = opponentScore;
    }
  }

  private findLastHeadToHead(playerA: string, playerB: string): Match | null {
    for (const match of this.matches) {
      const players = [match.player1, match.player2];
      if (players.includes(playerA) && players.includes(playerB)) {
        return match;
      }
    }
    return null;
  }

  private buildBraggingLines(matches: Match[]): string[] {
    const headToHead = matches.filter(match =>
      (match.player1 === this.winner && match.player2 === this.opponent) ||
      (match.player1 === this.opponent && match.player2 === this.winner)
    );

    if (headToHead.length === 0) {
      return [
        `${this.winner} is 1-0 against ${this.opponent} so far.`,
        'Set the tone early and keep the streak alive.'
      ];
    }

    let winnerWins = 0;
    let opponentWins = 0;
    let totalMargin = 0;
    headToHead.forEach(match => {
      const winnerScore = match.player1 === this.winner ? match.score1 : match.score2;
      const opponentScore = match.player1 === this.opponent ? match.score1 : match.score2;
      if (winnerScore > opponentScore) {
        winnerWins += 1;
        totalMargin += winnerScore - opponentScore;
      } else {
        opponentWins += 1;
        totalMargin -= opponentScore - winnerScore;
      }
    });

    const recent = headToHead.slice(0, 3);
    const recentWins = recent.filter(match => {
      const winnerScore = match.player1 === this.winner ? match.score1 : match.score2;
      const opponentScore = match.player1 === this.opponent ? match.score1 : match.score2;
      return winnerScore > opponentScore;
    }).length;

    const averageMargin = Math.abs(totalMargin / headToHead.length).toFixed(1);
    const leadLine = `${this.winner} leads ${winnerWins}-${opponentWins} vs ${this.opponent}.`;
    const streakLine = `Won ${recentWins} of the last ${recent.length} meetings.`;
    const marginLine = `Average margin in this rivalry: ${averageMargin} points.`;

    return [leadLine, streakLine, marginLine];
  }
}
