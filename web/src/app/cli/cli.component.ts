import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from "ng-terminal";
import {Terminal} from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import {SerializeAddon} from "xterm-addon-serialize";
import {CliService} from "../cli.service";

@Component({
  selector: 'app-cli',
  templateUrl: './cli.component.html',
  styleUrls: ['./cli.component.css'],
})
export class CliComponent implements OnInit, AfterViewInit, OnDestroy {
  visible: boolean = false;
  terminal?: Terminal;
  serializeAddon?: SerializeAddon;
  fitAddon?: FitAddon;

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
        //console.log(message)

        this.ng_terminal?.write(message.data);
      },
      (error) => console.error('WebSocket error:', error),
      () => console.log('WebSocket connection closed')
    );

    this.terminal = this.ng_terminal.underlying!!;
    this.terminal.options.fontSize = 15;
    this.serializeAddon = new SerializeAddon();
    this.terminal.loadAddon(this.serializeAddon);
    //this.fitAddon = new FitAddon();
    //this.terminal.loadAddon(this.fitAddon);

    this.ng_terminal.setXtermOptions({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      cursorBlink: true
    });

    if (restore) {
      let tmp = this.cliService.get_cli_state();
      if (tmp !== undefined)
        this.ng_terminal.write(tmp);
    }

    this.ng_terminal.setRows(10);

    this.cliService.resize(this.terminal.cols, this.terminal.rows);
    var _this = this;
    window.addEventListener("resize", (event) => {
      const core = (_this.terminal as any)._core;
      const dims = core._renderService.dimensions;

      console.log("mousemove", dims.css.cell.height, dims.css.cell.width);

      //_this.ng_terminal?.underlying?.element

      var cellheight = dims.css.cell.height;
      var tmp_height = (window.innerHeight);
      tmp_height = Math.floor(tmp_height / cellheight) - 1;
      if (tmp_height < 1) {
        tmp_height = 1;
      }

      //const scrollbarWidth = _this.terminal?.options.scrollback
      const scrollbar_width = _this.terminal?.options.scrollback === 0 ?
        0 : core.viewport.scrollBarWidth;

      var cell_width = dims.css.cell.width;
      var tmp_width = (window.innerWidth - scrollbar_width);// - event.pageY);
      tmp_width = Math.floor(tmp_width / cell_width);
      if (tmp_width < 2) {
        tmp_width = 2;
      }

      //tmp_height = tmp_height * cellheight;
      //console.log("tmp heigh", tmp_height);


      _this.ng_terminal?.setRows(tmp_height);
      _this.ng_terminal?.setCols(tmp_width - 1);
      console.error("window resize ");
    });
    // $(window).resize(function () {
    //
    //   if (term) {
    //     resize_terminal(term);
    //   }
    // });

    var terminal_container = document.getElementById('terminal-container');
    var terminal_dragbar = document.getElementById('terminal-dragbar');
    if (terminal_dragbar !== null) {
      var dragging = false;

      var mouse_move = function(event: MouseEvent) {
        const core = (_this.terminal as any)._core;
        const dims = core._renderService.dimensions;

        console.log("mousemove", dims.css.cell.height, dims.css.cell.width);

        //_this.ng_terminal?.underlying?.element

        var cellheight = dims.css.cell.height;
        var tmp_height = (window.innerHeight - event.pageY);
        tmp_height = Math.floor(tmp_height / cellheight) - 1;
        if (tmp_height < 1) {
          tmp_height = 1;
        }

        //const scrollbarWidth = _this.terminal?.options.scrollback
        const scrollbar_width = _this.terminal?.options.scrollback === 0 ?
          0 : core.viewport.scrollBarWidth;

        var cell_width = dims.css.cell.width;
        var tmp_width = (window.innerWidth - scrollbar_width);// - event.pageY);
        tmp_width = Math.floor(tmp_width / cell_width);
        if (tmp_width < 2) {
          tmp_width = 2;
        }

        //tmp_height = tmp_height * cellheight;
        //console.log("tmp heigh", tmp_height);


        _this.ng_terminal?.setRows(tmp_height);
        _this.ng_terminal?.setCols(tmp_width - 1);
        //terminal_container?.attributeStyleMap.set("height", tmp_height);
        //terminal_container.css("height", tmp_height);
        // term.fitAddon.fit();
      }

      terminal_dragbar.addEventListener("mousedown", (event) => {
        event.preventDefault();
        dragging = true;
        document.addEventListener("mousemove", mouse_move);

        document.addEventListener("mouseup", (ecent) => {
          console.log("mouseup");
          if (dragging) {
            document.removeEventListener("mousemove", mouse_move);
            _this.fitAddon?.fit();
            // resize_terminal(term)
            dragging = false;
          }
        });
      });
    }

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
