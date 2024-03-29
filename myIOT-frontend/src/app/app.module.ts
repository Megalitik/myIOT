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
import { DashboardComponent } from './userPanel/dashboard/dashboard.component';
import { ControllersComponent } from './userPanel/controllers/controllers.component';
import { appRoutes } from 'src/routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserComponent } from './accountManagement/user/user.component';
import { UserService } from './shared/user.service';
import { LoginComponent } from './accountManagement/loginUser/login/login.component';
import { RegisterUserComponent } from './accountManagement/register-user/register-user.component';
import { ToastrModule } from 'ngx-toastr';
import { TokenInterceptor } from './_services/interceptor/token.interceptor';
import { ResetComponent } from './accountManagement/reset/reset.component';
import { FilterPipe } from './_services/helper/filter.pipe';
import { UserDevicesComponent } from './userPanel/user-devices/user-devices.component';
import { DeviceMessageTableComponent } from './userPanel/device-widgets/device-message-table/device-message-table.component';
import { DeviceLineGraphComponent } from './userPanel/device-widgets/device-line-graph/device-line-graph.component';
import { DeviceSendCommandsComponent } from './userPanel/device-widgets/device-send-commands/device-send-commands.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    DashboardComponent,
    ControllersComponent,
    UserComponent,
    LoginComponent,
    RegisterUserComponent,
    ResetComponent,
    FilterPipe,
    UserDevicesComponent,
    DeviceMessageTableComponent,
    DeviceLineGraphComponent,
    DeviceSendCommandsComponent,
    PagenotfoundComponent
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
