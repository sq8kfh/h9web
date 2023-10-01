import {Component} from '@angular/core';
import {NgbConfig} from '@ng-bootstrap/ng-bootstrap';
import {CliService} from "./cli.service";
import {SseService} from "./sse.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'h9';

  constructor(ngbConfig: NgbConfig, public cliService: CliService, public sseService: SseService) {
    ngbConfig.animation = false;
  }
}
