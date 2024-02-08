import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FCTSDashBoard } from 'src/environments/environment';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';

@Component({
  selector: 'app-internal',
  templateUrl: './internal.component.html'
})

export class InternalComponent implements OnInit, AfterViewInit, OnDestroy {
  CSUrl = CSConfig.CSUrl;
  basehref: String = FCTSDashBoard.BaseHref;
  menuAction = true;
  scrollbarOptions = { axis: 'yx', theme: 'minimal-dark' };
  itemsCount: number;
  menuItems: any;
  userChangeSubscription;

  constructor(
    private _correspondenceService: CorrespondenceService,
    private correspondenceShareService: CorrespondenceShareService
  ) { }

  ngOnInit() {
    this._correspondenceService.currentItemsCount.subscribe(itemsCount => {
      this.changeItem(itemsCount);
    });
    this._correspondenceService.getSideBarElementsHC('menuInt.json').subscribe(data => {
      this.menuItems = data as string[];
    });
    this.correspondenceShareService.currentSidebarAction.subscribe(menuAction => this.menuAction = menuAction);
  }

  ngAfterViewInit() {
    this.userChangeSubscription = this.correspondenceShareService.recoutForProxyChange.subscribe(response => {
      this.getSideBarElements();
     });
  }

  ngOnDestroy() {
    if (this.userChangeSubscription) {
      this.userChangeSubscription.unsubscribe();
    }
  }

  getSideBarElements() {
    this._correspondenceService.getSideBarElements(FCTSDashBoard.getMenuCountInt).subscribe(data => {
      this.menuItems = data as string[];
    });
  }

  menuActionButton() {
    this.menuAction = !this.menuAction;
    // console.log(this.menuAction);
  }

  changeItem(itemsCount: number) {
    if ( Array.isArray(this.menuItems) && this.menuItems.length) {
      const locationName = window.location.pathname.split('/').pop();
      this.menuItems[0].inbounds.forEach((element) => {
        if (element.router === locationName) { element.Count =  itemsCount ; }
      });
      this.menuItems[0].outbounds.forEach((element) => {
        if (element.router === locationName) { element.Count =  itemsCount ; }
      });
    }
  }

}
