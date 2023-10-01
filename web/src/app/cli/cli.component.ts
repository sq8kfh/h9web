import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from "ng-terminal";
import {Terminal} from 'xterm';
import {SerializeAddon} from "xterm-addon-serialize";
import {CliService} from "../cli.service";

@Component({
  selector: 'app-cli',
  templateUrl: './cli.component.html',
  styleUrls: ['./cli.component.css'],
})
export class CliComponent implements OnInit, AfterViewInit, OnDestroy {
  terminal?: Terminal;
  serializeAddon?: SerializeAddon;
  @ViewChild('term', {static: false}) ng_terminal?: NgTerminal;

  constructor(private cliService: CliService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.ng_terminal)
      return;

    let restore = true;

    if (!this.cliService.is_connected()) {
      restore = false;
      this.cliService.connect();
    }

    this.cliService.socket$.subscribe(
      (message) => {
        console.log(message)

        this.ng_terminal?.write(message.data);
      },
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );

    this.terminal = this.ng_terminal.underlying!!;
    this.terminal.options.fontSize = 15;
    this.serializeAddon = new SerializeAddon();
    this.terminal.loadAddon(this.serializeAddon);
    // this.underlying.loadAddon(new WebLinksAddon());
    this.ng_terminal.setXtermOptions({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      cursorBlink: true
    });

    if (restore) {
      let tmp = this.cliService.get_cli_state();
      if (tmp !== undefined)
        this.ng_terminal.write(tmp);
    }

    this.cliService.resize(this.terminal.cols, this.terminal.rows);

    let s = this.cliService;
    this.terminal.onResize(function (arg: { cols: number, rows: number }, arg2: void) {
        console.log("onresize", arg.cols, arg.rows);
        s.resize(arg.cols, arg.rows);
      }
    );

    this.ng_terminal.onData().subscribe((input) => {
      if (!this.ng_terminal)
        return;

      this.cliService.send(input);
    })
  }

  ngOnDestroy(): void {
    console.log("ondestroy");
    if (this.cliService.is_connected())
      this.cliService.save_cli_state(this.serializeAddon?.serialize());
    // console.log(this.serializeAddon?.serialize());
  }
}
