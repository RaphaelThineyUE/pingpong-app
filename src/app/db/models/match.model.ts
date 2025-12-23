export interface Match {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  dateTime: string;
  sheetRow?: number;
}

export interface MatchForm {
  player1: string;
  player2: string;
  score1: number | null;
  score2: number | null;
}
