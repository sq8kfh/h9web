import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { NgTerminalModule } from 'ng-terminal';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NodesComponent } from './nodes/nodes.component';
import { RawframeComponent } from './rawframe/rawframe.component';
import { StatsComponent } from './stats/stats.component';
import { SettingsComponent } from './settings/settings.component';
import { SendframeComponent } from './sendframe/sendframe.component';
import { FramelistComponent } from './framelist/framelist.component';
import { CliComponent } from './cli/cli.component';
import {HttpClientModule} from "@angular/common/http";
import { AntennaSwitchComponent } from './antenna-switch/antenna-switch.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    NodesComponent,
    RawframeComponent,
    StatsComponent,
    SettingsComponent,
    SendframeComponent,
    FramelistComponent,
    CliComponent,
    AntennaSwitchComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgTerminalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
