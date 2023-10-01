import {Injectable, NgZone} from '@angular/core';
import {Observable, Subscriber} from "rxjs";
import {Frame} from "./frame";

const EVENT_URL: string = 'http://127.0.0.1:8888/events';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  private event_source: EventSource|null = null;
  constructor(private _zone: NgZone) {
  }

  getServerSentEvent(): Observable<Frame> {
    let observable = new Observable((subscriber: Subscriber<Frame>) => {
      const eventSource = this.getEventSource();
      eventSource.addEventListener("on_frame", (e) => {
        console.warn("on_frame");
        console.warn(e.data)
        this._zone.run(() => {
          subscriber.next(JSON.parse(e.data));
        });
      });
      eventSource.onopen = (e) => {
        console.warn("open");
      }
      eventSource.onmessage = (event) => {
        console.warn("event")
        this._zone.run(() => {
          //subscriber.next(event);
        });
      };
      eventSource.onerror = (error) => {
        console.warn("error")
        this._zone.run(() => {
          subscriber.error(error);
        });
      };
    });
    return observable;
  }

  private getEventSource(): EventSource {
    if (this.event_source === null)
      this.event_source = new EventSource(EVENT_URL);

    return this.event_source;
  }

  is_connected(): boolean {
    if (this.event_source === null)
      return false;

    return this.event_source.readyState == this.event_source.OPEN;
  }
}
