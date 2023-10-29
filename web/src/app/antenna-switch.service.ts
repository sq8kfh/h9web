import {Injectable} from '@angular/core';
import {SseService} from "./sse.service";
import {Subscription} from "rxjs";
import {AntennaSwitch} from "./antenna-switch";
import {Frame} from "./frame";

@Injectable({
  providedIn: 'root'
})
export class AntennaSwitchService {
  private on_dev_status_update_subscription: Subscription | null = null;

  state: AntennaSwitch = {
    selected_antenna: 0
  };

  constructor(private sseService: SseService) {
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
}
