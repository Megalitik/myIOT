import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './accountManagement/user/user.component';
import { ControllersComponent } from './userPanel/controllers/controllers.component';
import { DashboardComponent } from './userPanel/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './accountManagement/loginUser/login/login.component';
import { ResetComponent } from './accountManagement/reset/reset.component';

const routes: Routes = [
  { path:'user', component:UserComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path:'login', component:LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'controllers', component: ControllersComponent, canActivate:[AuthGuard] },
  { path: 'reset', component: ResetComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
