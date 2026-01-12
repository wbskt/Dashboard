import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.constants';

export interface PolicyResponse {
  RefId: string;
  Name: string;
  MaxClients: number | null;
  Expiry: string | null;
  Pin: string;
}

export interface PolicyListResponse {
  TotalCount: number;
  Items: PolicyResponse[];
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
  private readonly baseUrl = inject(API_URL);

  getPolicies(): Observable<PolicyListResponse> {
    return this.http.get<PolicyListResponse>(`${this.baseUrl}/policies`);
  }

  createPolicy(request: CreatePolicyRequest): Observable<PolicyResponse> {
    return this.http.post<PolicyResponse>(`${this.baseUrl}/policies`, request);
  }
}