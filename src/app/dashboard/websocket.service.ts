import {Injectable} from "@angular/core";
import {WebSocketSubject} from "rxjs/observable/dom/WebSocketSubject";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/dom/webSocket";
import {CmdWrapper} from "./model/websocketCmd/cmd-wrapper";
import {AttrCmd} from "./model/websocketCmd/attr-cmd";
import {isNullOrUndefined} from "util";
import {Subject} from "rxjs/Subject";
import {Message} from "./model/message";
import {TimeseriesCmd} from "./model/websocketCmd/timeseries-cmd";
import {environment} from "../../environments/environment";
import {Sensor} from "./model/sensor";

@Injectable()
export class WebsocketService {

  public webSocketSubject: WebSocketSubject<any>;

  public attrSubject: Subject<Message> = new Subject();
  public valSubject: Subject<Message> = new Subject();

  public historicalSubject: Subject<Sensor> = new Subject();


  private _cmdId: number = 0;

  // attribute register map. (cmdId: entityId)
  private _t_attr = new Map();

  // value register map. (cmdId: entityId)
  private _t_val = new Map();

  constructor() {
    let token = localStorage.getItem("token");
    // console.log("using token: " + token);
    //let websocketUrl = `ws://${environment.serverUrl}/api/ws/plugins/telemetry?token=` + token;
    let websocketUrl = `ws://140.143.23.199:8080/api/ws/plugins/telemetry?token=` + token;
    console.log("connecting to: " + websocketUrl);
    this.webSocketSubject = Observable.webSocket(websocketUrl);

    this.cmdRegister();
    this.handleAttrMsgSubscription();
    this.handleTimeSeriesMsgSubscription();

    //this.webSocketSubject.next(`{"attrSubCmds":[{"entityId":"7196de30-5712-11e7-bcd4-df254d8c8582","scope":"SERVER_SCOPE","cmdId":2},{"entityId":"f37c8940-5bdb-11e7-9680-df254d8c8582","scope":"SERVER_SCOPE","cmdId":3}]}`);
  }

  getLatestDeviceDataByDeviceIds(entityIds: string[]): void {
    let cmd = this.latestValCmdGenerator(entityIds);
    // console.log(cmd);
    this.webSocketSubject.next(cmd);
  }

  getRegionDataByDeviceIds(entityIds: string[]): void {
    let cmd = this.attrCmdGenerator(entityIds, "SERVER_SCOPE");
    this.webSocketSubject.next(cmd);
  }

  getHistoryDataByDeviceId(entityId: string, sensorKey:string): void{
    let cmd = new CmdWrapper();
    cmd.tsSubCmds = [];
    let timeSeriesCmd = new TimeseriesCmd();
    timeSeriesCmd.entityId = entityId;
    timeSeriesCmd.startTs = new Date().getTime() - 604800000;
    timeSeriesCmd.timeWindow = 604800000  ;
    // timeSeriesCmd.startTs = 1498118852000;
    // timeSeriesCmd.timeWindow = new Date().getTime() -  1498118852000 ;

    timeSeriesCmd.limit = 500;
    timeSeriesCmd.entityType="DEVICE";

    timeSeriesCmd.interval = 1000*5;
    // timeSeriesCmd.agg = "AVG";
    timeSeriesCmd.keys = sensorKey;
    timeSeriesCmd.cmdId = this._cmdId ++;
    cmd.tsSubCmds.push(timeSeriesCmd);

    console.log(cmd);
    console.log(JSON.stringify(cmd));
    this.webSocketSubject.next(JSON.stringify(cmd));
  }

  private handleTimeSeriesMsgSubscription(): void{
    this.webSocketSubject.filter(msg => !isNullOrUndefined(this._t_val[msg.subscriptionId]))
      .subscribe(msg => {
        console.log(msg);
        if(msg.errorCode == 0){
          let data = msg.data;
          for(let tmp in data){
            if(data[tmp].length > 1){
              // history data.
              console.log(new Message(`!${tmp}@${this._t_val[msg.subscriptionId]}`,data[tmp]));
              this.valSubject.next(new Message(`!${tmp}@${this._t_val[msg.subscriptionId]}`,data[tmp]));
            }else{
              // latest data.
              let valList = data[tmp][0];
              let val = {
                time: valList[0],
                data: valList[1]
              };
              console.log(new Message(`${tmp}@${this._t_val[msg.subscriptionId]}`,val));
              this.valSubject.next(new Message(`${tmp}@${this._t_val[msg.subscriptionId]}`,val));
            }
          }
        }
      });
  }

  private handleAttrMsgSubscription(): void{
    //this.webSocketSubject.filter(msg => !isNullOrUndefined(msg.subscriptionId))
    this.webSocketSubject.filter(msg => !isNullOrUndefined(this._t_attr[msg.subscriptionId]))
      .subscribe(msg => {
          // console.log("raw ws msg:");
          console.log(msg);
          if (msg.errorCode == 0) {
            let data = msg.data;
            for (let tmp in data) {
              let attrList = data[tmp];
              for (let i = 0; i < attrList.length; i++) {
                if (msg.latestValues[tmp] == attrList[i][0]) {
                  // let regionStr = JSON.parse(attrList[i][1]).region;
                  // this.msgSubject.next(new Message("region",
                  //   `${this._t_attr[msg.subscriptionId]}@${regionStr}`));
                  let config = JSON.parse(attrList[i][1]);
                  config["entityId"] = this._t_attr[msg.subscriptionId];
                  config["key"] = tmp;
                  console.log(config);
                  // if(config.category == "amperemeter"){
                  //   //console.log("nope");
                  //   this.attrSubject.next(new Message("ampereCfg",config));
                  // }else{
                  //   this.attrSubject.next(new Message("sensorCfg",config));
                  // }
                  this.attrSubject.next(new Message("sensorCfg",config));
                }
              }
            }
          }
        },
        (err) => {console.log(err)}
        );
  }

  /**
   * save the cmdId and entityId relationship.
   */
  private cmdRegister(): void{
    this.webSocketSubject
      .filter(msg => isNullOrUndefined(msg.subscriptionId))
      .subscribe(
        (msg) => {
          // console.log(msg);
          if (!isNullOrUndefined(msg.attrSubCmds)) {
            msg.attrSubCmds.map(ele => {
              this._t_attr[ele.cmdId] = ele.entityId;
            });
          }
          if (!isNullOrUndefined(msg.tsSubCmds)) {
            msg.tsSubCmds.map(ele => {
              this._t_val[ele.cmdId] = ele.entityId;
            })
          }
        },
        (err) => console.log(err)
      )
  }

  /**
   * generate websocket subscribe cmd for device real-time values.
   * @param entityIdList
   * @returns {string}
   */
  private latestValCmdGenerator(entityIdList: string[]): string{
    let cmd = new CmdWrapper();
    cmd.tsSubCmds = [];
    entityIdList.map(devicdid => {
      let timeSeriesCmd = new TimeseriesCmd();
      timeSeriesCmd.entityId = devicdid;
      timeSeriesCmd.scope = "LATEST_TELEMETRY";
      timeSeriesCmd.cmdId = this._cmdId++;
      timeSeriesCmd.entityType = "DEVICE";
      cmd.tsSubCmds.push(timeSeriesCmd);
    });

    return JSON.stringify(cmd);
  }

  /**
   * generate websocket subscribe cmd for device attributes.
   * @param entityIdList
   * @param scope
   * @returns {string}
   */
  private attrCmdGenerator(entityIdList: string[], scope: string): string {
    let cmd = new CmdWrapper();
    cmd.attrSubCmds = [];
    entityIdList.map(entityId => {
      let attrCmd = new AttrCmd();
      attrCmd.entityId = entityId;
      attrCmd.entityType="DEVICE";
      attrCmd.scope = scope;
      attrCmd.cmdId = this._cmdId++;
      cmd.attrSubCmds.push(attrCmd);
    });
    return JSON.stringify(cmd);
  }
}
