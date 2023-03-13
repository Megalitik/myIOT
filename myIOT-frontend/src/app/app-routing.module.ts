import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './accountManagement/user/user.component';
import { ControllersComponent } from './userPanel/controllers/controllers.component';
import { DashboardComponent } from './userPanel/dashboard/dashboard.component';

const routes: Routes = [
  { path:'user', component:UserComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'controllers/:deviceId', component: ControllersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
