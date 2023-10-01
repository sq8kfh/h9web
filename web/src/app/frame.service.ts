import {Injectable} from '@angular/core';
import {Frame} from "./frame";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, Subscription, throwError} from "rxjs";
import {SseService} from "./sse.service";

const SEND_FRAME_URL: string = 'http://127.0.0.1:8888/api/sendframe';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FrameService {
  private on_frame_subscription: Subscription | null = null;

  frame: Frame = {
    priority: 1,
    type: 0,
    seqnum: 0,
    destination_id: 0,
    source_id: 0,
    dlc: 0,
    data: [null, null, null, null, null, null, null, null]
  };

  frames: Frame[] = [];

  // constructor(private http: HttpClient) {
  constructor(private http: HttpClient, private sseService: SseService) {
    this.clean_frame(this.frame);
  }

  private log(message: string) {
    console.log(`FrameService: ${message}`);
  }

  set_id_from_source(f: Frame): void {
    this.frame.destination_id = f.source_id!;
  }

  set_id_from_destination(f: Frame): void {
    this.frame.destination_id = f.destination_id;
  }

  set_priority(f: Frame): void {
    this.frame.priority = f.priority;
  }

  set_type(f: Frame): void {
    this.frame.type = f.type;
  }

  set_seqnum(f: Frame): void {
    this.frame.seqnum = f.seqnum!;
  }

  set_data(f: Frame): void {
    this.frame.dlc = f.dlc;
    console.log(f.data);
    for (let i = 0; i < 8; i++) {
      this.frame.data[i] = f.data[i];
      //this.frame.data.
    }
  }

  set_all(f: Frame): void {
    this.frame.source_id = f.source_id!;
    this.set_id_from_destination(f);
    this.set_priority(f);
    this.set_type(f);
    this.set_seqnum(f);
    this.set_data(f);
  }

  get_m_frames(): Frame {
    return this.frame;
  }

  private subscribe_on_frame_sse() {
    if (this.on_frame_subscription === null) {
      let _this_frames = this.frames;
      this.on_frame_subscription = this.sseService.getServerSentEvent().subscribe({
        next(x) {
          console.log(typeof (x));
          console.log('got value ' + x);
          _this_frames.unshift(x);
        },
        error(err) {
          console.error('something wrong occurred: ' + err);
        },
        complete() {
          console.log('done');
        },
      });
    }
  }

  ngOnDestroy() {
    if (this.on_frame_subscription !== null) {
      this.on_frame_subscription.unsubscribe();
    }
    console.debug('frameService is destroyed');
  }

  get_frames(): Frame[] {
    this.subscribe_on_frame_sse();
    return this.frames;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  clean_frame(f: Frame): void {
    f.priority = 1;
    f.type = 0;
    f.seqnum = 0;
    f.destination_id = 0;
    f.source_id = 0;
    f.dlc = 0;
    for (let i = 0; i < 8; i++) {
      f.data[i] = null;
    }
  }

  send_frame(f: Frame, raw: boolean): void {
    let i = 0;
    console.log(f);
    for (i = 0; i < 8; i++) {

      if (typeof(f.data[i]) === "string") {
        let tmp = parseInt(JSON.parse(JSON.stringify(f.data[i])))
        if (!isNaN(tmp)) {
          f.data[i] = tmp;
        }
        else {
          f.data[i] = null;
        }
      }
      if (typeof(f.data[i]) !== "number")
        break;
    }
    f.dlc = i;
    for (; i < 8; i++) {
      f.data[i] = null;
    }
    //console.log(t.data.nul);

    let t = JSON.parse(JSON.stringify(f)) //deep copy 🤦

    console.log("try send")
    this.http.post<Frame>(SEND_FRAME_URL, t, httpOptions).subscribe({
      next(r) {
        // console.error(r);
      },
      error(e) {
        console.error("Send frame error: ", e);
      }
    });
    // pipe(catchError(this.handleError()));
  }
}
