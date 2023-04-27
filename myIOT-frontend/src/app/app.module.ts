import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { ChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SettingsComponent } from './userPanel/settings/settings.component';
import { DashboardComponent } from './userPanel/dashboard/dashboard.component';
import { ControllersComponent } from './userPanel/controllers/controllers.component';
import { appRoutes } from 'src/routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserComponent } from './accountManagement/user/user.component';
import { UserService } from './shared/user.service';
import { LoginComponent } from './accountManagement/loginUser/login/login.component';
import { RegisterUserComponent } from './accountManagement/register-user/register-user.component';
import { ProfileUserComponent } from './accountManagement/profile-user/profile-user.component';
import { ToastrModule } from 'ngx-toastr';
import { TokenInterceptor } from './_services/interceptor/token.interceptor';
import { ResetComponent } from './accountManagement/reset/reset.component';
import { FilterPipe } from './_services/helper/filter.pipe';
import { UserDevicesComponent } from './userPanel/user-devices/user-devices.component';
import { DeviceMessageTableComponent } from './userPanel/device-widgets/device-message-table/device-message-table.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    SettingsComponent,
    DashboardComponent,
    ControllersComponent,
    UserComponent,
    LoginComponent,
    RegisterUserComponent,
    ProfileUserComponent,
    ResetComponent,
    FilterPipe,
    UserDevicesComponent,
    DeviceMessageTableComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
