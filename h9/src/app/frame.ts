type DataType = (number | null)[];
export interface Frame {
  priority: number;
  type: number;
  seqnum: number|null;
  destination_id: number;
  source_id: number|null;
  dlc: number;
  data: DataType;
  // constructor() {
  //   this.priority = 1;
  //   this.type = 0;
  //   this.seqnum = 0;
  //   this.destination_id = 0;
  //   this.source_id = 0;
  //   this.dlc = 0;
  //   this.data = 0;
  // }
}
