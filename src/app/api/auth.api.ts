import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'http://localhost:5070/api'; // Update this to your real base URL

  login(request: LoginRequest): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.API_BASE_URL}/users/login`, request);
  }

  refresh(refreshToken: string): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.API_BASE_URL}/users/refresh-token`, { RefreshToken: refreshToken });
  }
}