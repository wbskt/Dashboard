import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService, Policy } from '../../services/dashboard.service';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge';
import { StatCardComponent } from '../ui/stat-card/stat-card';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, StatusBadgeComponent, StatCardComponent],
  templateUrl: './policies.html',
  styleUrl: './policies.css'
})
export class PoliciesComponent {
  private dashboardService = inject(DashboardService);

  searchQuery = signal('');
  policies = this.dashboardService.policies;
  showCreateModal = signal(false);

  newPolicy = {
    name: '',
    pin: '',
    maxClients: 10,
    allowedIdentifiersStr: '',
    expiry: '',
    autoApprove: false
  };

  filteredPolicies = computed(() => 
    this.policies().filter(p => p.name.toLowerCase().includes(this.searchQuery().toLowerCase()))
  );

  activeCount = computed(() => this.policies().filter(p => p.status === 'Active').length);
  manualCheckCount = computed(() => this.policies().filter(p => !p.autoApprove).length);

  createPolicy() {
    this.dashboardService.addPolicy({
      name: this.newPolicy.name,
      pin: this.newPolicy.pin,
      maxClients: this.newPolicy.maxClients,
      expiry: this.newPolicy.expiry,
      autoApprove: this.newPolicy.autoApprove,
      allowedIdentifiers: this.newPolicy.allowedIdentifiersStr.split(',').map(i => i.trim()).filter(i => i)
    });
    this.showCreateModal.set(false);
    // Reset form
    this.newPolicy = { name: '', pin: '', maxClients: 10, allowedIdentifiersStr: '', expiry: '', autoApprove: false };
  }
}