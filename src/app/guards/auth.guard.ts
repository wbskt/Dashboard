import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard checking for:', state.url, 'Is Authenticated:', authService.isAuthenticated());

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login if not authenticated
  console.log('AuthGuard: Access denied, redirecting to login');
  router.navigate(['/login']);
  return false;
};
