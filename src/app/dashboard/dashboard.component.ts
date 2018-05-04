import {Component, ViewChild} from "@angular/core";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  @ViewChild('tabCtrl') tabCtrl;

  constructor() {
  }

  onRegionSelect(subregion): void {
    console.info(subregion);

    if(this.tabCtrl.hasSubregion(subregion)){
      this.tabCtrl.activePanel(subregion);
    }else{
      this.tabCtrl.addPanel(subregion);
    }
  }

}
