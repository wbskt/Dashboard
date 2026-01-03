import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService } from '../../services/dashboard.service';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge';
import { StatCardComponent } from '../ui/stat-card/stat-card';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StatusBadgeComponent, StatCardComponent],
  providers: [DatePipe],
  templateUrl: './policies.html',
  styleUrl: './policies.css'
})
export class PoliciesComponent {
  private dashboardService = inject(DashboardService);

  searchQuery = signal('');
  policies = this.dashboardService.policies;
  showCreateModal = signal(false);

  newPolicy = {
    Name: '',
    MaxClients: 10,
    Expiry: ''
  };

  filteredPolicies = computed(() => 
    this.policies().filter(p => p.Name.toLowerCase().includes(this.searchQuery().toLowerCase()))
  );

  activeCount = computed(() => this.policies().length); // Mock logic for stats since backend doesn't provide status yet
  manualCheckCount = computed(() => 0); // Mock logic for stats

  createPolicy() {
    this.dashboardService.addPolicy({
      Name: this.newPolicy.Name,
      MaxClients: this.newPolicy.MaxClients,
      Expiry: this.newPolicy.Expiry ? new Date(this.newPolicy.Expiry).toISOString() : null
    }).subscribe(() => {
      this.showCreateModal.set(false);
      this.newPolicy = { Name: '', MaxClients: 10, Expiry: '' };
    });
  }
}
