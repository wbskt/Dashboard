import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthApi, UserLoginResponse, LoginRequest } from '../api/auth.api';

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = inject(AuthApi);
  private router = inject(Router);

  private readonly ACCESS_TOKEN_KEY = 'wbskt_access_token';
  private readonly REFRESH_TOKEN_KEY = 'wbskt_refresh_token';

  user = signal<UserProfile | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.user());

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    const token = this.getAccessToken();
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.user.set(decoded);
      } else {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.authApi.login(credentials).pipe(
      tap({
        next: (response) => {
          this.handleAuthResponse(response);
          this.router.navigate(['/clients']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed. Please try again.');
          this.loading.set(false);
        }
      })
    );
  }

  refresh(): Observable<UserLoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.authApi.refresh(refreshToken).pipe(
      tap({
        next: (response) => this.handleAuthResponse(response),
        error: () => this.logout()
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  private handleAuthResponse(response: UserLoginResponse) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    
    const decoded = this.decodeToken(response.accessToken);
    if (decoded) {
      this.user.set(decoded);
    }
    this.loading.set(false);
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private decodeToken(token: string): UserProfile | null {
    try {
      const payload = token.split('.')[1];
      const decodedJson = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const decoded = JSON.parse(decodedJson);
      
      // Map standard JWT claims or custom claims to our UserProfile
      // Usually: name is 'name' or 'unique_name', email is 'email'
      return {
        id: decoded.sub || decoded.nameid,
        email: decoded.email || decoded.upn,
        name: decoded.name || decoded.unique_name || 'User',
        ...decoded
      };
    } catch (e) {
      console.error('Failed to decode JWT token', e);
      return null;
    }
  }
}