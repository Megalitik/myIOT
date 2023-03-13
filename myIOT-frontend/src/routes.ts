import { Routes } from '@angular/router';

import { SettingsComponent } from './app/userPanel/settings/settings.component';
import { DashboardComponent } from './app/userPanel/dashboard/dashboard.component';
import { SensorsComponent } from './app/userPanel/sensors/sensors.component';
import { ControllersComponent } from './app/userPanel/controllers/controllers.component';
import { AuthGuard } from './app/auth/auth.guard';

export const appRoutes: Routes = [
    { path: 'settings', component: SettingsComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'sensors', component: SensorsComponent },
    { path: 'controllers', component: ControllersComponent },

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];