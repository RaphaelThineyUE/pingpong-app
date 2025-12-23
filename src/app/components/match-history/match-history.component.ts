import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../db/models/match.model';

@Component({
  selector: 'app-match-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-history.component.html',
  styleUrl: './match-history.component.css'
})
export class MatchHistoryComponent {
  @Input() matches: Match[] = [];
  @Input() filteredMatches: Match[] = [];
  @Input() googleSheetUrl = '';
  @Input() googleSheetName = '';
  @Output() deleteMatch = new EventEmitter<Match>();
}
