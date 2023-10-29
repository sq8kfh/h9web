import { Component } from '@angular/core';
import {AntennaSwitchService} from "../antenna-switch.service";
import {AntennaSwitch} from "../antenna-switch";

@Component({
  selector: 'app-antenna-switch',
  templateUrl: './antenna-switch.component.html',
  styleUrls: ['./antenna-switch.component.css']
})
export class AntennaSwitchComponent {
  state: AntennaSwitch = {
    selected_antenna: 0
  };

  antenna_number: number[];

  constructor(private antenna_switch_service: AntennaSwitchService) {
    this.antenna_number = Array(8).fill(0).map((x,i)=>i+1);
  }

  ngOnInit(): void {
    this.state = this.antenna_switch_service.get_state();
  }
}
