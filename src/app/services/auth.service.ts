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
  private readonly ID_TOKEN_KEY = 'wbskt_id_token';

  user = signal<UserProfile | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.user());

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    const idToken = this.getIdToken();
    if (idToken) {
      const decoded = this.decodeToken(idToken);
      if (decoded) {
        this.user.set(decoded);
      } else {
        // If id_token is invalid, we might still have a valid access token?
        // But for identity purposes, we need to clear.
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
          console.log('Login successful', response);
          this.handleAuthResponse(response);
          this.router.navigate(['/clients']).then(success => {
             console.log('Navigation to /clients result:', success);
          });
        },
        error: (err) => {
          console.error('Login error', err);
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
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);
    if (response.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    }
    if (response.id_token) {
      localStorage.setItem(this.ID_TOKEN_KEY, response.id_token);
      const decoded = this.decodeToken(response.id_token);
      console.log('Decoded ID token:', decoded);
      if (decoded) {
        this.user.set(decoded);
      }
    } else {
      // If doing a refresh and no new id_token comes back, we keep the old one?
      // Or we try to re-decode the existing one.
      const existingIdToken = this.getIdToken();
      if (existingIdToken) {
         this.user.set(this.decodeToken(existingIdToken));
      }
    }
    
    this.loading.set(false);
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ID_TOKEN_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getIdToken(): string | null {
    return localStorage.getItem(this.ID_TOKEN_KEY);
  }

  private decodeToken(token: string): UserProfile | null {
    if (!token) {
      console.warn('decodeToken: Token is empty');
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('decodeToken: Token does not have 3 parts (not a JWT)');
        return null;
      }

      const payload = parts[1];
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += new Array(5 - pad).join('=');
      }

      const decodedJson = atob(base64);
      const decoded = JSON.parse(decodedJson);
      
      console.log('Raw decoded claims:', decoded);

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