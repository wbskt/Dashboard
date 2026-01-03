import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PolicyResponse {
  RefId: string;
  Name: string;
  MaxClients: number | null;
  Expiry: string | null;
  Pin: string;
}

export interface CreatePolicyRequest {
  Name: string;
  MaxClients: number | null;
  Expiry: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyApi {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = '/api'; // Update this to your real base URL

  getPolicies(): Observable<PolicyResponse[]> {
    return this.http.get<PolicyResponse[]>(`${this.API_BASE_URL}/policies`);
  }

  createPolicy(request: CreatePolicyRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(`${this.API_BASE_URL}/policies`, request);
  }
}
