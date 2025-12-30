import { Component, inject, computed, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService } from '../../services/dashboard.service';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StatusBadgeComponent],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css'
})
export class ClientDetailComponent {
  private dashboardService = inject(DashboardService);
  
  @Input() id: string = ''; // Route param mapped to input

  client = computed(() => this.dashboardService.clients().find(c => c.id === this.id));
  messages = this.dashboardService.messages;
  messageInput = signal('');

  sendMessage() {
    this.dashboardService.addMessage(this.messageInput());
    this.messageInput.set('');
  }
}