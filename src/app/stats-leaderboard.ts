// ping-pong-leaderboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface Match {
  playerA: string;
  scoreA: number;
  playerB: string;
  scoreB: number;
}

export interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  games: number;
  winPct: number;
  elo: number;
}

export interface LeaderboardTitles {
  eloChampion: string;
  winPctChampion: string;
  mostWins: string;
  mostGames: string;
  statisticallyRelevant: string[];
}

export interface LeaderboardResult {
  players: PlayerStats[];
  titles: LeaderboardTitles;
  printable: string;
}

@Injectable({ providedIn: 'root' })
export class PingPongLeaderboardService {

    // get this fropm environment in real app
    private spreadsheetId = environment.googleSheets.spreadsheetId;

 
  private range = 'Sheet1!A1:Z1000';

  private K = 32;
  private START_ELO = 1500;
  private MIN_GAMES = 10;

  constructor(private http: HttpClient) {}

  async getLeaderboard(apiKey: string): Promise<LeaderboardResult> {
    const url =
      `${GOOGLE_SHEETS_API}/${this.spreadsheetId}/values/${this.range}` +
      `?key=${apiKey}`;

    const response: any = await this.http.get(url).toPromise();

    if (!response.values || response.values.length < 2) {
      throw new Error('Sheet is empty or missing match data.');
    }

    const [header, ...rows] = response.values;
    const matches = this.parseMatches(header, rows);
    return this.computeLeaderboard(matches);
  }

  computeFromMatches(matches: Match[]): LeaderboardResult {
    return this.computeLeaderboard(matches);
  }

  private parseMatches(headers: string[], rows: any[][]): Match[] {
    const matches: Match[] = [];

    rows.forEach((row, rowIndex) => {
      const scored = row
        .map((value, i) => ({
          player: headers[i],
          score: Number(value)
        }))
        .filter(cell => !isNaN(cell.score));

      if (scored.length !== 2) {
        throw new Error(
          `Invalid match at row ${rowIndex + 2}. Each match must have exactly two scores.`
        );
      }

      matches.push({
        playerA: scored[0].player,
        scoreA: scored[0].score,
        playerB: scored[1].player,
        scoreB: scored[1].score
      });
    });

    return matches;
  }

  private computeLeaderboard(matches: Match[]): LeaderboardResult {
    const stats: Record<string, PlayerStats> = {};

    const getPlayer = (name: string) => {
      if (!stats[name]) {
        stats[name] = {
          name,
          wins: 0,
          losses: 0,
          games: 0,
          winPct: 0,
          elo: this.START_ELO
        };
      }
      return stats[name];
    };

    const expected = (a: number, b: number) =>
      1 / (1 + Math.pow(10, (b - a) / 400));

    matches.forEach(match => {
      const A = getPlayer(match.playerA);
      const B = getPlayer(match.playerB);

      A.games++;
      B.games++;

      const winner = match.scoreA > match.scoreB ? A : B;
      const loser = winner === A ? B : A;

      winner.wins++;
      loser.losses++;

      const ew = expected(winner.elo, loser.elo);
      const el = expected(loser.elo, winner.elo);

      winner.elo += this.K * (1 - ew);
      loser.elo += this.K * (0 - el);
    });

    const players = Object.values(stats).map(p => ({
      ...p,
      winPct: p.games ? +(p.wins / p.games * 100).toFixed(1) : 0,
      elo: Math.round(p.elo)
    }));

    players.sort((a, b) =>
      b.elo - a.elo ||
      b.winPct - a.winPct ||
      b.games - a.games
    );

    const titles: LeaderboardTitles = {
      eloChampion: players[0].name,
      winPctChampion: [...players].sort((a, b) => b.winPct - a.winPct)[0].name,
      mostWins: [...players].sort((a, b) => b.wins - a.wins)[0].name,
      mostGames: [...players].sort((a, b) => b.games - a.games)[0].name,
      statisticallyRelevant: players
        .filter(p => p.games >= this.MIN_GAMES)
        .map(p => p.name)
    };

    const printable = this.buildPrintable(players, titles);

    return { players, titles, printable };
  }

  private buildPrintable(
    players: PlayerStats[],
    titles: LeaderboardTitles
  ): string {
    const header =
`HOUSE PING-PONG LEADERBOARD
Rank | Player | Wins | Games | Win % | Elo`;

    const rows = players.map((p, i) =>
      `${i + 1} | ${p.name} | ${p.wins} | ${p.games} | ${p.winPct}% | ${p.elo}`
    ).join('\n');

    const titlesBlock =
`
Titles:
Elo Champion: ${titles.eloChampion}
Win % Champion: ${titles.winPctChampion}
Most Wins: ${titles.mostWins}
Most Games Played: ${titles.mostGames}
Statistically relevant (≥10 games): ${
  titles.statisticallyRelevant.join(', ') || 'None'
}

Disclaimer: Elo does not care about excuses, warm-ups, or vibes.`;

    return `${header}\n${rows}\n${titlesBlock}`;
  }
}
