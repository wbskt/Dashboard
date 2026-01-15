import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authService, authReq, next);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(authService: AuthService, request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refresh().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.access_token);
        return next(request.clone({
          setHeaders: {
            Authorization: `Bearer ${response.access_token}`
          }
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        return next(request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        }));
      })
    );
  }
}
