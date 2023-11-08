import {Injectable} from '@angular/core';
import {SseService} from "./sse.service";
import {catchError, Observable, Subscription} from "rxjs";
import {AntennaSwitch, AntennaSwitchCtrl} from "./antenna-switch";
import {Frame} from "./frame";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Node} from "./node";
import {API_URL} from "./app.globals";


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
  private dev_id = 'antenna_switch';
  private dev_url = `${API_URL}/dev`;
  private on_dev_status_update_subscription: Subscription | null = null;

  state: AntennaSwitch = {
    selected_antenna: 0
  };

  constructor(private http: HttpClient, private sseService: SseService) {
    console.error("konstruktor");
  }

  private update_state(s: AntennaSwitch) {
    if (s.selected_antenna !== undefined) {
      this.state.selected_antenna = s.selected_antenna;
    }
  }

  private subscribe_on_dev_status_update_sse() {
    if (this.on_dev_status_update_subscription === null) {

      const url = `${this.dev_url}/${this.dev_id}/get_state`;
      this.http.get<AntennaSwitch>(url).subscribe(as_state => this.update_state(as_state));

      let _this = this;
      this.on_dev_status_update_subscription = this.sseService.get_antenna_switch_sse().subscribe({
        next(x) {
          _this.update_state(x)
          console.log(typeof (x));
          console.log('on_dev_status_update_sse ' + x.selected_antenna);
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
    const url = `${this.dev_url}/${this.dev_id}/select_antenna`;
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
