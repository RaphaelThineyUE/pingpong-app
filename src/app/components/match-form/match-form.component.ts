import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchForm } from '../../db/models/match.model';

@Component({
  selector: 'app-match-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-form.component.html',
  styleUrl: './match-form.component.css'
})
export class MatchFormComponent {
  @Input() players: string[] = [];
  @Input() match: MatchForm = {
    player1: '',
    player2: '',
    score1: null,
    score2: null
  };
  @Input() availablePlayers2: string[] = [];
  @Input() submitting = false;
  @Output() matchSubmit = new EventEmitter<void>();
}
