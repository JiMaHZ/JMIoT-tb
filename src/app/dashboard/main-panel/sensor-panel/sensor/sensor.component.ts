import {Component, Input, OnInit} from '@angular/core';
import {Sensor} from "../../../model/sensor";
import {WebsocketService} from "../../../websocket.service";

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {

  public sensorType: SensorType = new SensorType();

  @Input() sensorAttr: Sensor;

  public value: number;
  public time : string;

  constructor(
    private _websocketService: WebsocketService
  ) {
  }

  ngOnInit() {
    console.log("in sensor component:");
    console.log(this.sensorAttr);

    switch (this.sensorAttr.config.type){
      case "温度": {
        this.sensorType.classStr = "data-type-temperature";
        this.sensorType.imgUrl = "assets/img/datatypetemperature.png";
        // this.sensorType.unitStr = "℃";
        break;
      }
      case "光照": {
        this.sensorType.classStr = "data-type-sun";
        this.sensorType.imgUrl = "assets/img/datatypesun.png";
        // this.sensorType.unitStr = "KLux";
        break;
      }
      case "湿度": {
        this.sensorType.classStr = "data-type-shidu";
        this.sensorType.imgUrl = "assets/img/shidu.png";
        // this.sensorType.unitStr = "%";
        break;
      }
      case "二氧化碳": {
        this.sensorType.classStr = "data-type-co2";
        this.sensorType.imgUrl = "assets/img/co2.png";
        // this.sensorType.unitStr = "ppm";
        break;
      }
      default: {
        break;
      }
    }

    this._websocketService.valSubject
      .filter(msg => msg.name == `${this.sensorAttr.key}@${this.sensorAttr.parentInfo.entityId}`)
      .map(msg => msg.data)
      .subscribe(data => {
        // console.log(data);
        this.time = data.time;
        // this.time = this._datePipe.transform(data.time,'yyyy-MM-dd HH:mm:ss');

        this.value = data.data;
      });
  }

}

export class SensorType {
  "classStr": string;
  "imgUrl": string;
  // "unitStr": string;
}
