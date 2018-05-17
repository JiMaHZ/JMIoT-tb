import {Component, Input, OnInit} from '@angular/core';
import {Sensor} from "../../../model/sensor";
import {WebsocketService} from "../../../websocket.service";
//import {StockChart} from 'angular-highcharts';
import {EChartOption} from 'echarts-ng2';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {

 // stock:StockChart;
 chartOption :EChartOption;
 private _data: Array<Array<any>>;
  isVisible = false;

  showModal = () => {
    this.isVisible = true;
  }

  handleOk = (e) => {
    console.log('点击了确定');
    this.isVisible = false;
  }

  handleCancel = (e) => {
    console.log(e);
    this.isVisible = false;
  }

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


      this._websocketService.historicalSubject
      .subscribe(sensor => {

        this._websocketService.valSubject
          .subscribe(msg => {

            if(msg.name == `!${sensor.key}@${sensor.parentInfo.entityId}`){
              // subscribe for historical data.
              this._data = msg.data;
              this.chartOption = this.getOpt(this._data, sensor.name);
            }else if(msg.name){
              // subscribe for latest data.
              let data = msg.data;
              console.log(data);
              let latest = [];
              latest.push(data.time);
              latest.push(data.data);
              if(this._data.length >= 50){
                this._data.shift();
            }
            this._data.push(latest);
            this.chartOption = this.getOpt(this._data, sensor.name);
            }
          })
      });

      
      
      // this.stock = new StockChart({
      //   rangeSelector: {
      //     selected: 0.5
      //   },
      //   // title: {
      //   //   text: 'AAPL Stock Price'
      //   // },
      //   series: [{
      //     // tooltip: {
      //     //   valueDecimals: 2
      //     // },
      //     name: 'AAPL',
      //     data: [
      //       /* Nov 2017 */
      //       [1509494400000, 166.89],
      //       [1509580800000, 168.11],
      //       [1509667200000, 172.50],
      //       [1509926400000, 174.25],
      //       [1510012800000, 174.81],
      //       [1510099200000, 176.24],
      //       [1510185600000, 175.88],
      //       [1510272000000, 174.67],
      //       [1510531200000, 173.97],
      //       [1510617600000, 171.34],
      //       [1510704000000, 169.08],
      //       [1510790400000, 171.10],
      //       [1510876800000, 170.15],
      //       [1511136000000, 169.98],
      //       [1511222400000, 173.14],
      //       [1511308800000, 174.96],
      //       [1511481600000, 174.97],
      //       [1511740800000, 174.09],
      //       [1511827200000, 173.07],
      //       [1511913600000, 169.48],
      //       [1512000000000, 171.85],
      //       /* Dec 2017 */
      //       [1512086400000, 171.05],
      //       [1512345600000, 169.80],
      //       [1512432000000, 169.64],
      //       [1512518400000, 169.01],
      //       [1512604800000, 169.32],
      //       [1512691200000, 169.37],
      //       [1512950400000, 172.67],
      //       [1513036800000, 171.70],
      //       [1513123200000, 172.27],
      //       [1513209600000, 172.22],
      //       [1513296000000, 173.97],
      //       [1513555200000, 176.42],
      //       [1513641600000, 174.54],
      //       [1513728000000, 174.35],
      //       [1513814400000, 175.01],
      //       [1513900800000, 175.01],
      //       [1514246400000, 170.57]
      //     ]
      //   }]
      // });
  }

  private getOpt(data: Array<Array<any>>, name: string): EChartOption {
    let opt = {
      title: {
        text: name
     },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      dataZoom: [{
       type: 'inside'
   }, {
       type: 'slider'
   }],
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: true
        }
      },
      series: [{
        name: name,
        type: 'line',
        itemStyle: {
          normal: {
            lineStyle: {
              color:'#1E90FF'
            }
          }
        },
        showSymbol: false,
        hoverAnimation: false,
       data: data
      }]
    };
    return opt;
   }

}

export class SensorType {
  "classStr": string;
  "imgUrl": string;
  // "unitStr": string;
}
