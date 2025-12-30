import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients';
import { ClientDetailComponent } from './components/client-detail/client-detail';
import { PoliciesComponent } from './components/policies/policies';
import { ApprovalsComponent } from './components/approvals/approvals';
import { LogsComponent } from './components/logs/logs';

export const routes: Routes = [
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  { path: 'clients', component: ClientsComponent },
  { path: 'clients/:id', component: ClientDetailComponent },
  { path: 'policies', component: PoliciesComponent },
  { path: 'approvals', component: ApprovalsComponent },
  { path: 'logs', component: LogsComponent },
  { path: '**', redirectTo: 'clients' }
];