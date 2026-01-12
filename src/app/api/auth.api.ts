import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.constants';

export interface LoginRequest {
  Email: string;
  Password?: string;
}

export interface UserLoginResponse {
  AccessToken: string;
  RefreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  login(request: LoginRequest): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.baseUrl}/users/login`, request);
  }

  refresh(refreshToken: string): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.baseUrl}/users/refresh-token`, { RefreshToken: refreshToken });
  }
}