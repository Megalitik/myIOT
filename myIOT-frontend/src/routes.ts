import { Routes } from '@angular/router';

import { DashboardComponent } from './app/userPanel/dashboard/dashboard.component';
import { ControllersComponent } from './app/userPanel/controllers/controllers.component';
import { LoginComponent } from './app/accountManagement/loginUser/login/login.component';
import { RegisterUserComponent } from './app/accountManagement/register-user/register-user.component';

export const appRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'controllers', component: ControllersComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterUserComponent },

    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];