import { Component } from '@angular/core';
import { Frame} from "../frame";
import {FrameService} from "../frame.service";

@Component({
  selector: 'app-sendframe',
  templateUrl: './sendframe.component.html',
  styleUrls: ['./sendframe.component.css']
})
export class SendframeComponent {
  Priority = [
    {id: 0, name: "H"},
    {id: 1, name: "L"}
  ];
  Type = [
    {id:  0, name: "NOP"},
    {id:  1, name: "PAGE_START"},
    {id:  2, name: "QUIT_BOOTLOADER"},
    {id:  3, name: "PAGE_FILL"},
    {id:  4, name: "BOOTLOADER_TURNED_ON"},
    {id:  5, name: "PAGE_FILL_NEXT"},
    {id:  6, name: "PAGE_WRITED"},
    {id:  7, name: "PAGE_FILL_BREAK"},
    {id:  8, name: "SET_REG"},
    {id:  9, name: "GET_REG"},
    {id: 10, name: "SET_BIT"},
    {id: 11, name: "CLEAR_BIT"},
    {id: 12, name: "TOGGLE_BIT"},
    {id: 13, name: "NODE_UPGRADE"},
    {id: 14, name: "NODE_RESET"},
    {id: 15, name: "DISCOVER"},
    {id: 16, name: "REG_EXTERNALLY_CHANGED"},
    {id: 17, name: "REG_INTERNALLY_CHANGED"},
    {id: 18, name: "REG_VALUE_BROADCAST"},
    {id: 19, name: "REG_VALUE"},
    {id: 20, name: "ERROR"},
    {id: 21, name: "NODE_HEARTBEAT"},
    {id: 22, name: "NODE_INFO"},
    {id: 23, name: "NODE_TURNED_ON"},
    {id: 24, name: "NODE_SPECIFIC_BULK0"},
    {id: 25, name: "NODE_SPECIFIC_BULK1"},
    {id: 26, name: "NODE_SPECIFIC_BULK2"},
    {id: 27, name: "NODE_SPECIFIC_BULK3"},
    {id: 28, name: "NODE_SPECIFIC_BULK4"},
    {id: 29, name: "NODE_SPECIFIC_BULK5"},
    {id: 30, name: "NODE_SPECIFIC_BULK6"},
    {id: 31, name: "NODE_SPECIFIC_BULK7"}
  ];
  frame: Frame = {
    priority: 1,
    type: 0,
    seqnum: 30,
    destination_id: 0,
    source_id: 0,
    dlc: 0,
    data: [0, 2, 0, 0, 0, 0, 0, null]
  };

  constructor(private frameService: FrameService) {
  }

  ngOnInit(): void {
    this.get_last_frame();
  }

  send_frame(frame: Frame): void {
    this.frameService.sendFrame(frame);
  }

  get_last_frame(): void {
    console.log('get_last_frame');
    this.frame = this.frameService.get_m_frames();
  }
}
