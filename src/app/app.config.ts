import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LucideAngularModule, Users, Shield, Zap, FileText, Bell, RefreshCw, Search, Filter, Cpu, Monitor, Wifi, ChevronRight, MoreVertical, Trash2, Download, Send, ArrowUpRight, ArrowDownLeft, Activity, Calendar, Lock, Clipboard, Clock, X, LogOut, Plus } from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { API_URL, AUTH_API_URL } from './app.constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_URL, useValue: '/api' }, // Proxied to http://localhost:5070/api
    { provide: AUTH_API_URL, useValue: '/auth' }, // Proxied to https://localhost:7001
    importProvidersFrom(LucideAngularModule.pick({ Users, Shield, Zap, FileText, Bell, RefreshCw, Search, Filter, Cpu, Monitor, Wifi, ChevronRight, MoreVertical, Trash2, Download, Send, ArrowUpRight, ArrowDownLeft, Activity, Calendar, Lock, Clipboard, Clock, X, LogOut, Plus }))
  ]
};