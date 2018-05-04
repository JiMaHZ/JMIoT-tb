import {AfterViewChecked, Component, EventEmitter, OnInit, Output} from "@angular/core";
import {RegionService} from "./service/region.service";
import {Region} from "../model/region";
import {Subregion} from "../model/subregion";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-region-panel',
  templateUrl: './region-panel.component.html',
  styleUrls: ['./region-panel.component.css'],
  providers: [RegionService]
})
export class RegionPanelComponent implements OnInit,AfterViewChecked {

  @Output()
  public regionEvent = new EventEmitter<Subregion>();

  public regionList: Region[];

  constructor(
    private _regionService: RegionService
  ) {  }

  ngOnInit() {
    this._regionService.getRegionDataFromWs()
      .subscribe(data => {
        console.log(data);
        this.regionList = data;
      })
  }

  ngAfterViewChecked() {

    // try {
    //   this.regionClick(this.regionList[0].subRegions[0]);
    // }catch (err) {
    // }
  }
  regionClick(obj: Subregion) {
    this.regionEvent.emit(obj);
  }

}
