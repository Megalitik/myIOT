import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ChartsModule } from 'ng2-charts';

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
import { LoginComponent } from './accountManagement/login/login.component';
import { SignUpComponent } from './accountManagement/sign-up/sign-up.component';


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
    LoginComponent,
    SignUpComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    AppRoutingModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
