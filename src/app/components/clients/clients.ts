import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService } from '../../services/dashboard.service';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge';
import { StatCardComponent } from '../ui/stat-card/stat-card';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StatusBadgeComponent, StatCardComponent],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class ClientsComponent {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  searchQuery = signal('');
  clients = this.dashboardService.clients;

  filteredClients = computed(() => 
    this.clients().filter(c => c.identifier.toLowerCase().includes(this.searchQuery().toLowerCase()))
  );

  onlineCount = computed(() => this.clients().filter(c => c.status === 'Online').length);
  hardwareCount = computed(() => this.clients().filter(c => c.type === 'Hardware').length);
  appCount = computed(() => this.clients().filter(c => c.type === 'Application').length);

  navigateToDetail(id: string) {
    this.router.navigate(['/clients', id]);
  }
}