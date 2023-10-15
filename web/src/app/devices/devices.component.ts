import {Component, OnInit} from '@angular/core';
import {Device, DeviceInfo, DevRegister} from "../device";
import {DevicesService} from "../devices.service";

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {
  devices: Device[] = [];
  selected_device: DeviceInfo|undefined;
  constructor(private devicesService: DevicesService) {}

  ngOnInit(): void {
    this.get_devices();
  }

  get_devices(): void {
    this.devicesService.get_devices().subscribe(devices => this.devices = devices);
  }

  select_device(dev: Device): void {
    this.devicesService.get_device_info(dev).subscribe(device_info => this.selected_device = device_info);
  }

  get_register(dev: Device, reg: DevRegister): void {
    this.devicesService.get_register(dev, reg).subscribe(v => reg.value = v);
  }

  set_register(dev: Device, reg: DevRegister): void {
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
