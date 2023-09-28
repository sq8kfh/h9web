import {Injectable} from '@angular/core';
import {Frame} from "./frame";

@Injectable({
  providedIn: 'root'
})
export class FrameService {
  private framesUrl = 'api/frames';
  frame: Frame = {
    priority: 1,
    type: 0,
    seqnum: 30,
    destination_id: 0,
    source_id: 0,
    dlc: 0,
    data: [0, 2, 0, 0, 0, 0, 0, null]
  };

  frames: Frame[] = [{
    priority: 1,
    type: 0,
    seqnum: 30,
    destination_id: 0,
    source_id: 0,
    dlc: 0,
    data: [0, 2, 0, 0, 0, 0, 0, null]
  },
    {
      priority: 1,
      type: 1,
      seqnum: 1,
      destination_id: 0,
      source_id: 20,
      dlc: 2,
      data: [0, 2, 0, 0, 0, 0, 0, null]
    }];

  // constructor(private http: HttpClient) {
  constructor() {
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
    this.frame.data = f.data;
  }
  get_m_frames(): Frame {
    return this.frame;
  }
  getFrames(): Frame[] {
    return this.frames;
  }

  sendFrame(f: Frame): void {
    this.frames.unshift({ ...f});
  }
}
