import {Injectable} from "@angular/core";
import {Http,Headers,RequestOptions} from "@angular/http";
import {environment} from "../../../environments/environment";

import "rxjs/add/operator/toPromise";
import {Token} from "../../user/login/model/token";
import {Subject} from "rxjs/Subject";
import {Message} from "../../dashboard/model/message";
import {UserService} from "../../user/login/service/user.service";
import {Alarm} from "../alarm-panel/model/alarm";

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
//import { catchError } from 'rxjs/operators';

@Injectable()
export class AlarmService {
 // private AlarmUrl =  "http://" + environment.serverUrl + "/api/plugins/telemetry/DEVICE";
 private AlarmUrl =   environment.serverUrl + "/alarm/DEVICE";
  private httpOption: RequestOptions;
  
  constructor(
    private _http: Http,
    private _userService: UserService
  ) { 
    let token = localStorage.getItem("token");
    let headers = new Headers({
      'Content-Type': 'application/json',
      'X-Authorization': 'Bearer ' + token
    });
    this.httpOption = new RequestOptions({
      headers: headers
    });
  }

  getAlarmInfo(): Subject<Alarm> {
    const subject = new Subject<Alarm>();
    
    this._userService.getUserInfo()
      .filter(message => {
        return message.name === 'deviceList';
      })
      .map(message => message.data)
      .subscribe(deviceids => {
       // console.log(deviceids);
        let deviceIds = new Set(deviceids);
       // console.log(deviceIds);
        deviceIds.forEach(deviceid => {
          this._http
            .get(this.AlarmUrl + '/' + deviceid  + '?limit=50&ascOrder=false', this.httpOption)
            .subscribe(
              response => {
                const auth_alarm = response.json().data;
                 
                const alarm = new Alarm();
        
               auth_alarm.map(ele => {
                 
                  alarm.startTs = ele.startTs;
                  alarm.severity = ele.severity;
                  alarm.type = ele.type;
                  
                });
                subject.next(alarm);
              },
              error => {
                console.log(error);
              }
            );
        });
      });
   
    return subject;
  }



// getAlarmInfo2(): Observable<any> {
//   // 得到deviceID
//   const deviceIds = this._userService.deviceIds;
 
//   return Observable.create(observer => {
//     for (const id of deviceIds) {
//       console.log(id);
//       this.getSingleAlarm(id).subscribe(data => {
//         observer.next(data);
//       });
//     }
//   });
// }

// getSingleAlarm(deviceid: string): Observable<any> {

//  // console.log(deviceid);
//   return this._http
//     .get(
//       this.AlarmUrl + '/' + deviceid + '?limit=50&ascOrder=false',
//       this.httpOption
//     )
//     .map(response => {
//       let auth_alarm = response.json();
//       //console.log(auth_alarm);
//       let alarm = new Alarm();
//       alarm.startTs = auth_alarm.startTs;
//       alarm.severity = auth_alarm.severity;
//       alarm.type = auth_alarm.type;
//       //console.log(alarm);
//       return alarm;
//     });
// }


  
}