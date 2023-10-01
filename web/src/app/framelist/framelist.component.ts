import { Component } from '@angular/core';
import {Frame, FramePriority, FrameType} from "../frame";
import {FrameService} from "../frame.service";
import {SseService} from "../sse.service";

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
    // let fr = this.frames;
    // this.sseService.getServerSentEvent().subscribe({
    //   next(x) {
    //     console.log(typeof(x));
    //     console.log('got value ' + x);
    //     fr.unshift(x);
    //   },
    //   error(err) {
    //     console.error('something wrong occurred: ' + err);
    //   },
    //   complete() {
    //     console.log('done');
    //   },
    // });
  }

  onSelect(frame: Frame): void {
    if (this.selected_frame == frame)
      this.selected_frame = undefined;
    else
      this.selected_frame = frame;
    //this.frameService.set_id(frame);
  }

  on_copy(frame: Frame): void {
    this.frameService.set_all(frame);
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
    this.frames = this.frameService.get_frames();
  }

  pririty_name(p: number): string {
    return FramePriority[p].name;
  }

  type_name(p: number): string {
    return FrameType[p].name;
  }
}
