import { Routes } from '@angular/router';

import { SettingsComponent } from './app/userPanel/settings/settings.component';
import { DashboardComponent } from './app/userPanel/dashboard/dashboard.component';
import { ControllersComponent } from './app/userPanel/controllers/controllers.component';
import { LoginComponent } from './app/accountManagement/loginUser/login/login.component';
import { RegisterUserComponent } from './app/accountManagement/register-user/register-user.component';

export const appRoutes: Routes = [
    { path: 'settings', component: SettingsComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'controllers', component: ControllersComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterUserComponent },

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];