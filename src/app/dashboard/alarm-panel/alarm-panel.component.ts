import { Component, OnInit } from '@angular/core';
import {AlarmService} from "./alarm.service";

@Component({
  selector: 'app-alarm-panel',
  templateUrl: './alarm-panel.component.html',
  styleUrls: [
    './alarm-panel.component.css'
    ]
})

export class AlarmPanelComponent implements OnInit {
  dataSet = [];
  public alarms = new Array<any>();

   constructor(
     private _alarmService: AlarmService
   ) { }

  ngOnInit(): void {

    // this._alarmService.getAlarmInfo()
    //    .subscribe(alarm => {
    //      console.log(alarm);   
    //      this.alarms.push(alarm);     
    //      console.log(this.alarms);
    //    });
    
   
            this._alarmService.getAlarmInfo()
               .subscribe(alarm => {
                 console.log(alarm.severity);
               
               
                this.dataSet.push(
                   {
                     time    :alarm.startTs,
                    severity:alarm.severity,
                    type    :alarm.type,
                  });       
                 console.log(this.dataSet);   
               
                           
               });
           
             
             
          //   for (let i = 0; i <50; i++) {
          //    this.dataSet.push({
          //      time   : `Edward King ${i}`,
          //      severity    : 32,
          //      type: `London, Park Lane no. ${i}`
          //   });
          //   console.log(this.dataSet);
          //  }
  }
}