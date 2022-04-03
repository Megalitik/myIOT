import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './accountManagement/login/login.component';
import { SignUpComponent } from './accountManagement/sign-up/sign-up.component';
import { UserComponent } from './accountManagement/user/user.component';

const routes: Routes = [
  {path:'user', component:UserComponent,
   children: [
     {path:'register', component:SignUpComponent},
     {path:'login', component:LoginComponent}
   ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
