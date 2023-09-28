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
  public socket$!: WebSocketSubject<any>;

  public is_connected: boolean = false;

  constructor() {
  }

  connect() {
    this.socket$ = webSocket({
      url: CLI_URL,
      openObserver: {
        next: () => {
          this.is_connected = true;
        }
      },
      closeObserver: {
        next: () => {
          this.is_connected = false;
        }
      }
    });
    this.socket$.subscribe();


  }

  disconnect() {
    this.socket$.complete();
  }

  isConnected(): boolean {
    return (this.socket$ === undefined ? false : this.is_connected);
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
}
