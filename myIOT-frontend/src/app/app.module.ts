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
    TemperatureSensorComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ChartsModule,
    BrowserAnimationsModule
  ],
  providers: [
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
