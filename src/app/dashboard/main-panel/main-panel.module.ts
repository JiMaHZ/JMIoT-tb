import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControllerPanelComponent } from './controller-panel/controller-panel.component';
import {MainPanelComponent} from "./main-panel.component";
import {SensorPanelComponent} from "./sensor-panel/sensor-panel.component";
import { SensorComponent } from './sensor-panel/sensor/sensor.component';
import { TwoStateComponent } from './controller-panel/two-state/two-state.component';
import { ThreeStateComponent } from './controller-panel/three-state/three-state.component';
import {TransformPipe} from "./sensor-panel/sensor/transform-pipe";
import { TimePipePipe } from './time-pipe.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    MainPanelComponent
  ],
  declarations: [
    ControllerPanelComponent,
    SensorPanelComponent,
    MainPanelComponent,
    SensorComponent,
    TwoStateComponent,
    ThreeStateComponent,
    TransformPipe,
    TimePipePipe
  ]
})
export class MainPanelModule { }
