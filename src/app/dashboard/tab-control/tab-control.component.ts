import {
  AfterContentInit,
  Component,
  ComponentFactoryResolver,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Output,
  EventEmitter
} from "@angular/core";
import {MainPanelComponent} from "../main-panel/main-panel.component";
import {Subregion} from "../model/subregion";
import {Sensor} from "../model/sensor";

@Component({
  selector: 'app-tab-control',
  templateUrl: './tab-control.component.html',
  styleUrls: ['./tab-control.component.css']
})
export class TabControlComponent implements OnInit, AfterContentInit {

  @ViewChild('mainPanel', {read: ViewContainerRef}) mainPanel;

  @Output() sensorClkEvent = new EventEmitter<Sensor>();

  public relationList: Array<Relation> = [];

  private _currentActiveTitle = "";


  constructor(private _resolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.mainPanel.clear();
  }

  ngAfterContentInit(): void {
    console.info(this.mainPanel);
  }

  addPanel(subregion: Subregion): void {
    let bc = this.relationList.filter(relation => relation.title == subregion.subregionName).length>0;
    if(!bc){
      const mainPanelFactory = this._resolver.resolveComponentFactory(MainPanelComponent);
      const ref = this.mainPanel.createComponent(mainPanelFactory);

      ref.instance.subregion = subregion;
      this.relationList.push(new Relation(subregion.subregionName, subregion, ref));
    }

    this.activePanel(subregion);
  }

  closePanel(subregionName: string): void {
    let containerRef = this.relationList.filter(relation => relation.title == subregionName)[0].ref;
    containerRef.destroy();

    // TODO websocket subscribe needs to be released
    // containerRef.onDestroy();

    this.relationList = this.relationList.filter(relation => relation.title != subregionName);

    try {
      this._currentActiveTitle = this.relationList[this.relationList.length - 1].title;
      this.activePanel(this.relationList[this.relationList.length - 1].subregion);
    }catch (err) {
      this._currentActiveTitle = "";
    }

    console.log(this.relationList);
  }

  activePanel(subregion: Subregion): void {
    this._currentActiveTitle = subregion.subregionName;
    this.relationList.map(relation => {
      relation.ref.instance.isShow = false;
    });
    let ref = this.relationList.filter(relation => relation.title == subregion.subregionName)[0].ref;
    ref.instance.isShow = true;
  }

  isActive(name: string): string {
    if (name == this._currentActiveTitle)
      return "on";
    else
      return "";
  }

  hasSubregion(subregion: Subregion): boolean {
    for (let idx in this.relationList) {
      let relation = this.relationList[idx];
      if (JSON.stringify(relation.subregion) == JSON.stringify(subregion)) {
        return true;
      }
    }
    return false;
  }

}

class Relation {
  title: string;
  subregion: Subregion;
  ref: any;

  constructor(title: string, subregion: Subregion, ref: any) {
    this.title = title;
    this.subregion = subregion;
    this.ref = ref;
  }
}
