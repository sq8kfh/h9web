import {Component, OnInit} from '@angular/core';
import {Node, DeviceInfo, DevRegister} from "../node";
import {NodesService} from "../nodes.service";

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.css']
})
export class NodesComponent implements OnInit {
  devices: Node[] = [];
  selected_device: DeviceInfo|undefined;
  constructor(private devicesService: NodesService) {}

  ngOnInit(): void {
    this.get_devices();
  }

  format_time(ust_iso: string): string {
    const date = new Date(ust_iso);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  get_devices(): void {
    this.devicesService.get_devices().subscribe(devices => this.devices = devices);
  }

  select_device(dev: Node): void {
    this.devicesService.get_device_info(dev).subscribe(device_info => this.selected_device = device_info);
  }

  get_register(dev: Node, reg: DevRegister): void {
    this.devicesService.get_register(dev, reg).subscribe(v => reg.value = v);
  }

  set_register(dev: Node, reg: DevRegister): void {
    this.devicesService.set_register(dev, reg).subscribe(v => reg.value = v);
  }

  is_bit_set(val: number | number[] | string | undefined, bit: number): boolean {
    // @ts-ignore
    return (val & (1 << bit)) != 0;
  }

  toggle_bit(val: number | number[] | string | undefined, bit: number): number {
    // @ts-ignore

    val = val ^ (1 << bit);
    console.log(val);
    return val;
  }
}
