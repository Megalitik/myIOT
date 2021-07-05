import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SettingsComponent } from './userPanel/settings/settings.component';
import { DashboardComponent } from './userPanel/dashboard/dashboard.component';
import { SensorsComponent } from './userPanel/sensors/sensors.component';
import { ControllersComponent } from './userPanel/controllers/controllers.component';
import { appRoutes } from 'src/routes';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    SettingsComponent,
    DashboardComponent,
    SensorsComponent,
    ControllersComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
