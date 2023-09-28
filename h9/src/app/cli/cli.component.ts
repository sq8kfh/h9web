import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from "ng-terminal";
import {Terminal} from 'xterm';
import {CliService} from "../cli.service";

@Component({
  selector: 'app-cli',
  templateUrl: './cli.component.html',
  styleUrls: ['./cli.component.css'],
})
export class CliComponent implements OnInit, AfterViewInit {
  underlying?: Terminal;

  @ViewChild('term', {static: false}) child?: NgTerminal;

  constructor(private cliService: CliService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.child)
      return;

    if (!this.cliService.isConnected())
      this.cliService.connect();

    this.cliService.socket$.subscribe(
      (message) => {
        console.log(message)

        this.child?.write(message.data);
      },
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );

    this.underlying = this.child.underlying!!;
    this.underlying.options.fontSize = 15;
    // this.underlying.loadAddon(new WebLinksAddon());
    this.child.setXtermOptions({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      cursorBlink: true
    });

    this.cliService.resize(this.underlying.cols, this.underlying.rows);

    let s = this.cliService;
    this.underlying.onResize(function (arg: { cols: number, rows: number }, arg2: void) {
        console.log("onresize", arg.cols, arg.rows);
        s.resize(arg.cols, arg.rows);
      }
    );

    this.child.onData().subscribe((input) => {
      if (!this.child)
        return;

      this.cliService.send(input);
    })
  }
}
