import { Routes } from '@angular/router';
import { SettingsComponent } from './app/userPanel/settings/settings.component';
import { DashboardComponent } from './app/userPanel/dashboard/dashboard.component';

export const appRoutes: Routes = [
    { path: 'settings', component: SettingsComponent },
    { path: 'dashboard', component: DashboardComponent },

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];