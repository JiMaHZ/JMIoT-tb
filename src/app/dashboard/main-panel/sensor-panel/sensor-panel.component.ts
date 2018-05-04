import {Component, Input, OnInit} from "@angular/core";
import {Sensor} from "../../model/sensor";
import {WebsocketService} from "../../websocket.service";

@Component({
  selector: 'app-sensor-panel',
  templateUrl: './sensor-panel.component.html',
  styleUrls: ['./sensor-panel.component.css']
})
export class SensorPanelComponent implements OnInit {

  @Input() sensorList: Sensor[];

  constructor(
    private _websocketService: WebsocketService
  ) {
  }

  ngOnInit() {
    console.info(this.sensorList);
  }

  foo(): boolean {
    return this.sensorList.length > 0;
  }

  onSensorClk(sensor: Sensor) {
    console.log(sensor);

    this._websocketService.historicalSubject.next(sensor);
    this._websocketService.getHistoryDataByDeviceId(sensor.parentInfo.entityId,sensor.key);
  }
}
