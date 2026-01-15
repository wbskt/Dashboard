import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_API_URL } from '../app.constants';

export interface LoginRequest {
  Email: string;
  Password?: string;
}

export interface UserLoginResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private http = inject(HttpClient);
  private readonly authUrl = inject(AUTH_API_URL);

  login(request: LoginRequest): Observable<UserLoginResponse> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('username', request.Email)
      .set('password', request.Password || '')
      .set('scope', 'openid offline_access')
      .set('client_id', 'postman')
      .set('client_secret', 'postman-secret');

    return this.http.post<UserLoginResponse>(`${this.authUrl}/connect/token`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  refresh(refreshToken: string): Observable<UserLoginResponse> {
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', 'postman')
      .set('client_secret', 'postman-secret');

    return this.http.post<UserLoginResponse>(`${this.authUrl}/connect/token`, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
}