import { inject, Injectable, signal } from '@angular/core';
import { PolicyApi, PolicyResponse, CreatePolicyRequest } from '../api/policy.api';
import { tap } from 'rxjs';

export interface Client {
  id: string;
  identifier: string;
  type: 'Hardware' | 'Application';
  protocol: 'WebSocket' | 'HTTP';
  status: 'Online' | 'Offline' | 'Pending';
  lastSeen: string;
  policy: string;
  ip: string;
  firmware?: string;
  version?: string;
}

export interface Log {
  id: string;
  timestamp: string;
  level: 'Info' | 'Success' | 'Warning' | 'Error';
  source: string;
  event: string;
  details: string;
}

export interface Message {
  id: number;
  type: 'uplink' | 'downlink';
  payload: string;
  timestamp: string;
}

const INITIAL_CLIENTS: Client[] = [
  { id: 'cli_1', identifier: 'esp8266-9912', type: 'Hardware', protocol: 'WebSocket', status: 'Online', lastSeen: 'Just now', policy: 'NYC_Warehouse_ESP', ip: '192.168.1.45', firmware: 'v2.1.0' },
  { id: 'cli_2', identifier: 'ios-app-pro', type: 'Application', protocol: 'HTTP', status: 'Online', lastSeen: '45s ago', policy: 'London_Office_App', ip: '72.14.21.9', version: '1.4.2' },
  { id: 'cli_3', identifier: 'esp32-temp-04', type: 'Hardware', protocol: 'WebSocket', status: 'Offline', lastSeen: '2h ago', policy: 'NYC_Warehouse_ESP', ip: '192.168.1.112', firmware: 'v1.0.8' },
  { id: 'cli_4', identifier: 'dashboard-web', type: 'Application', protocol: 'WebSocket', status: 'Online', lastSeen: '1m ago', policy: 'Default', ip: '108.12.5.1', version: 'N/A' },
];

const INITIAL_LOGS: Log[] = [
  { id: 'log_1', timestamp: '2025-12-28 10:42:01', level: 'Info', source: 'System', event: 'System Startup', details: 'Dashboard initialized successfully.' },
  { id: 'log_2', timestamp: '2025-12-28 10:45:12', level: 'Success', source: 'Admin', event: 'Policy Created', details: 'Policy "NYC_Warehouse_ESP" created with PIN 8821-X.' },
  { id: 'log_3', timestamp: '2025-12-28 11:20:05', level: 'Warning', source: 'esp8266-9912', event: 'High Latency', details: 'Client reported 450ms latency.' },
  { id: 'log_4', timestamp: '2025-12-28 11:30:00', level: 'Error', source: 'Auth', event: 'Invalid PIN', details: 'Failed enrollment attempt from IP 192.168.1.100.' },
  { id: 'log_5', timestamp: '2025-12-28 12:00:01', level: 'Success', source: 'Admin', event: 'Client Approved', details: 'Manual approval for client "esp8266-new-04".' },
];

const MOCK_MESSAGES: Message[] = [
  { id: 1, type: 'uplink', payload: '{"temp": 24.5, "humidity": 60}', timestamp: '12:04:01' },
  { id: 2, type: 'downlink', payload: '{"led": "ON"}', timestamp: '12:04:15' },
  { id: 3, type: 'uplink', payload: '{"status": "OK", "uptime": 3600}', timestamp: '12:05:01' },
];

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private policyApi = inject(PolicyApi);

  policies = signal<PolicyResponse[]>([]);
  clients = signal<Client[]>(INITIAL_CLIENTS);
  logs = signal<Log[]>(INITIAL_LOGS);
  messages = signal<Message[]>(MOCK_MESSAGES);

  constructor() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.policyApi.getPolicies().subscribe(policies => {
      this.policies.set(policies.Items);
    });
  }

  addPolicy(newPolicy: CreatePolicyRequest) {
    return this.policyApi.createPolicy(newPolicy).pipe(
      tap(policy => {
        this.policies.update(p => [policy, ...p]);

        // Add Log
        const newLog: Log = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          level: 'Success',
          source: 'Admin',
          event: 'Policy Created',
          details: `Policy "${policy.Name}" created with PIN ${policy.Pin}.`
        };
        this.logs.update(l => [newLog, ...l]);
      })
    );
  }

  addMessage(payload: string) {
     if (!payload.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      type: 'downlink',
      payload: payload,
      timestamp: new Date().toLocaleTimeString([], { hour12: false })
    };
    this.messages.update(m => [...m, newMsg]);
  }
}