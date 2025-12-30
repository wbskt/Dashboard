import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService } from '../../services/dashboard.service';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StatusBadgeComponent],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class LogsComponent {
  private dashboardService = inject(DashboardService);

  searchQuery = signal('');
  logs = this.dashboardService.logs;

  filteredLogs = computed(() => 
    this.logs().filter(l => 
      l.event.toLowerCase().includes(this.searchQuery().toLowerCase()) || 
      l.details.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
      l.source.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );
}