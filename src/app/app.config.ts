import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { LucideAngularModule, Users, Shield, Zap, FileText, Bell, RefreshCw, Search, Filter, Cpu, Monitor, Wifi, ChevronRight, MoreVertical, Trash2, Download, Send, ArrowUpRight, ArrowDownLeft, Activity, Calendar, Lock, Clipboard, Clock, X } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding()),
    importProvidersFrom(LucideAngularModule.pick({ Users, Shield, Zap, FileText, Bell, RefreshCw, Search, Filter, Cpu, Monitor, Wifi, ChevronRight, MoreVertical, Trash2, Download, Send, ArrowUpRight, ArrowDownLeft, Activity, Calendar, Lock, Clipboard, Clock, X }))
  ]
};