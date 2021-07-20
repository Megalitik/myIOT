import { DeviceType } from './deviceType';

export interface Device {
    DeviceID: number;
    Name: string;
    DeviceType: DeviceType;
    DeviceState: boolean;
}