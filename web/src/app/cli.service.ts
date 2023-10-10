import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

const CLI_URL: string = "ws://127.0.0.1:8888/cli?id=1";

export interface Message {
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class CliService {
  visible: boolean = false;
  public socket$!: WebSocketSubject<any>;

  private _is_connected: boolean = false;
  public cli_state: string | undefined;

  constructor() {
  }

  show_hide_utility(){
    this.visible = this.visible ? false:true;
  }

  connect() {
    this.socket$ = webSocket({
      url: CLI_URL,
      openObserver: {
        next: () => {
          this._is_connected = true;
        }
      },
      closeObserver: {
        next: () => {
          this._is_connected = false;
        }
      }
    });
    this.socket$.subscribe();


  }

  disconnect() {
    this.socket$.complete();
  }

  is_connected(): boolean {
    return (this.socket$ === undefined ? false : this._is_connected);
  }

  onMessage(): Observable<any> {
    return this.socket$!.asObservable().pipe(
      map(message => message)
    );
  }

  send(data: any) {
    this.socket$.next({"data": data});
  }

  resize(cols: number, rows: number): void {
    this.socket$.next({"resize": [cols, rows]});
  }

  save_cli_state(state: string | undefined): void {
    this.cli_state = state;
  }

  get_cli_state(): string | undefined {
    return this.cli_state;
  }
}
