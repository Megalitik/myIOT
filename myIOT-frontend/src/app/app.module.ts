import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { ChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SettingsComponent } from './userPanel/settings/settings.component';
import { DashboardComponent } from './userPanel/dashboard/dashboard.component';
import { SensorsComponent } from './userPanel/sensors/sensors.component';
import { ControllersComponent } from './userPanel/controllers/controllers.component';
import { appRoutes } from 'src/routes';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserComponent } from './accountManagement/user/user.component';
import { UserService } from './shared/user.service';
import { HumiditySensorComponent } from './userPanel/sensor-features/humidity-sensor/humidity-sensor.component';
import { TemperatureSensorComponent } from './userPanel/sensor-features/temperature-sensor/temperature-sensor.component';
import { LoginComponent } from './accountManagement/loginUser/login/login.component';
import { RegisterUserComponent } from './accountManagement/register-user/register-user.component';
import { ProfileUserComponent } from './accountManagement/profile-user/profile-user.component';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    SettingsComponent,
    DashboardComponent,
    SensorsComponent,
    ControllersComponent,
    LineChartComponent,
    BarChartComponent,
    UserComponent,
    HumiditySensorComponent,
    TemperatureSensorComponent,
    LoginComponent,
    RegisterUserComponent,
    ProfileUserComponent
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
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
