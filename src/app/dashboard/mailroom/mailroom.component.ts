import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FCTSDashBoard } from 'src/environments/environment';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';

@Component({
  selector: 'app-mailroom',
  templateUrl: './mailroom.component.html'
})

export class MailroomsComponent implements OnInit, AfterViewInit {
  CSUrl = CSConfig.CSUrl;
  basehref: String = FCTSDashBoard.BaseHref;
  menuAction = true;
  scrollbarOptions = { axis: 'yx', theme: 'minimal-dark' };
  itemsCount: number;
  menuItems: any;

  constructor(
    private _correspondenceService: CorrespondenceService,
    private correspondenceShareService: CorrespondenceShareService
  ) { }

  ngOnInit() {
    this._correspondenceService.currentItemsCount.subscribe(itemsCount => {
      this.changeItem(itemsCount);
    });
    this._correspondenceService.getSideBarElementsHC('menuMR.json').subscribe(data => {
      this.menuItems = data as string[];
    });
    this.correspondenceShareService.currentSidebarAction.subscribe(menuAction => this.menuAction = menuAction);
  }

  ngAfterViewInit() {
    this._correspondenceService.getSideBarElements(FCTSDashBoard.getMenuCountMR).subscribe(data => {
      this.menuItems = data as string[];
      this.sendCountToDashboard();
    });
  }

  menuActionButton() {
    this.menuAction = !this.menuAction;
    // console.log(this.menuAction);
  }

  changeItem(itemsCount: number) {    
    if (Array.isArray(this.menuItems) && this.menuItems.length) {
      const locationName = window.location.pathname.split('/').pop();
      this.menuItems[0].inbounds.forEach((element) => {
        if (element.router === locationName) { element.Count =  itemsCount;  }
      });
      this.menuItems[0].outbounds.forEach((element) => {
        if (element.router === locationName) { element.Count =  itemsCount;  }
      });
    }
  }

  sendCountToDashboard() {
    this.correspondenceShareService.sendCountToDashboard(this.menuItems);
  }

}
