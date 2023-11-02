import {Injectable} from '@angular/core';
import {SseService} from "./sse.service";
import {Subscription} from "rxjs";
import {AntennaSwitch, AntennaSwitchCtrl} from "./antenna-switch";
import {Frame} from "./frame";
import {HttpClient, HttpHeaders} from "@angular/common/http";

const ANTENNA_SWITCH_CTRL_URL: string = 'http://127.0.0.1:8888/api/dev';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AntennaSwitchService {
  private on_dev_status_update_subscription: Subscription | null = null;

  state: AntennaSwitch = {
    selected_antenna: 0
  };

  constructor(private http: HttpClient, private sseService: SseService) {
  }

  private subscribe_on_dev_status_update_sse() {
    if (this.on_dev_status_update_subscription === null) {
      let _this = this;
      this.on_dev_status_update_subscription = this.sseService.get_antenna_switch_sse().subscribe({
        next(x) {
          console.log(typeof (x));
          console.log('on_dev_status_update_sse ' + x.selected_antenna);
          _this.state.selected_antenna = x.selected_antenna;
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

  get_state(): AntennaSwitch {
    this.subscribe_on_dev_status_update_sse();
    return this.state;
  }

  select_antenna(an: number): void {
    let dev_id: string = "as";
    const url = `${ANTENNA_SWITCH_CTRL_URL}/${dev_id}/select_antenna`;
    this.http.put<string>(url, `{"antenna_number": ${an}}`, httpOptions).subscribe({
      next(r) {
        console.error(r);
      },
      error(e) {
        console.error("Select antenna error: ", e);
      }
    });
  }
}
