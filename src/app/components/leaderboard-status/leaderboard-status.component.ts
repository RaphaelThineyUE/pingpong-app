import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardResult } from '../../stats-leaderboard';

@Component({
  selector: 'app-leaderboard-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard-status.component.html',
  styleUrl: './leaderboard-status.component.css'
})
export class LeaderboardStatusComponent {
  @Input() leaderboard: LeaderboardResult | null = null;
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() matchCount = 0;
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();

  onStartDateChange(value: string) {
    this.startDate = value;
    this.startDateChange.emit(value);
  }

  onEndDateChange(value: string) {
    this.endDate = value;
    this.endDateChange.emit(value);
  }
}
