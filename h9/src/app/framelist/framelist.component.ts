import { Component } from '@angular/core';
import { Frame} from "../frame";
import {FrameService} from "../frame.service";

@Component({
  selector: 'app-framelist',
  templateUrl: './framelist.component.html',
  styleUrls: ['./framelist.component.css']
})
export class FramelistComponent {
  frames: Frame[] = [];
  selected_frame?: Frame;
  constructor(private frameService: FrameService) {
  }

  ngOnInit(): void {
    this.get_frames();
  }

  onSelect(frame: Frame): void {
    console.log("frame select")
    this.selected_frame = frame;
    //this.frameService.set_id(frame);
  }

  onSelectFrameSrcId(frame: Frame): void {
    this.frameService.set_id_from_source(frame);
  }

  onSelectFrameDstId(frame: Frame): void {
    this.frameService.set_id_from_destination(frame);
  }

  onSelectFrameType(frame: Frame): void {
    this.frameService.set_type(frame);
  }

  onSelectFrameSeqnum(frame: Frame): void {
    this.frameService.set_seqnum(frame);
  }

  onSelectFramePriority(frame: Frame): void {
    this.frameService.set_priority(frame);
  }

  onSelectFrameData(frame: Frame): void {
    this.frameService.set_data(frame);
  }

  get_frames(): void {
    this.frames = this.frameService.getFrames();
  }
}
