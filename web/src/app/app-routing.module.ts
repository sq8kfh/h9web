import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {NodesComponent} from './nodes/nodes.component';
import {RawframeComponent} from './rawframe/rawframe.component';
import {StatsComponent} from './stats/stats.component';
import {SettingsComponent} from './settings/settings.component';
import {CliComponent} from "./cli/cli.component";

const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'nodes', component: NodesComponent},//, canActivate: [guard np do logowania]},
  {path: 'rawframe', component: RawframeComponent},
  {path: 'stats', component: StatsComponent},
  {path: 'settings', component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
