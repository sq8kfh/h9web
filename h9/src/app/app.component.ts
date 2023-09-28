import {Component} from '@angular/core';
import {NgbConfig} from '@ng-bootstrap/ng-bootstrap';
import {CliService} from "./cli.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'h9';

  constructor(ngbConfig: NgbConfig, public cliService: CliService) {
    ngbConfig.animation = false;
  }
}
