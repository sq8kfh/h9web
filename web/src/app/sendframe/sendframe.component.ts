import { Component } from '@angular/core';
import {Frame, FramePriority, FrameType} from "../frame";
import {FrameService} from "../frame.service";

@Component({
  selector: 'app-sendframe',
  templateUrl: './sendframe.component.html',
  styleUrls: ['./sendframe.component.css']
})
export class SendframeComponent {
  Priority = FramePriority;
  Type = FrameType;

  frame: Frame = {
    priority: 1,
    type: 0,
    seqnum: 30,
    destination_id: 0,
    source_id: 0,
    dlc: 0,
    data: [0, 2, 0, 0, 0, 0, 0, null]
  };

  raw_frame: boolean = false;

  constructor(private frameService: FrameService) {
  }

  ngOnInit(): void {
    this.get_last_frame();
  }

  clean_frame(frame: Frame): void {
    this.frameService.clean_frame(frame);
  }

  send_frame(frame: Frame): void {
    this.frameService.send_frame(frame, this.raw_frame);
    this.raw_frame = false;
  }

  get_last_frame(): void {
    console.log('get_last_frame');
    this.frame = this.frameService.get_m_frames();
  }
}
