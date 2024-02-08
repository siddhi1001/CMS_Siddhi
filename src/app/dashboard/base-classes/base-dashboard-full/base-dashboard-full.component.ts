import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatTableDataSource, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import inboxMail from 'src/assets/Data/mailsData.json';

import { Correspondence } from 'src/app/dashboard/services/correspondence.model';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { FCTSDashBoard } from 'src/environments/environment';
import { BaseDashboardComponent } from 'src/app/dashboard/base-classes/base-dashboard/base-dashboard.component';

import { CorrespondenceShareService } from '../../services/correspondence-share.service';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { multiLanguageTranslator } from 'src/assets/translator/index';

@Component({
  selector: 'app-base-dashboard-full',
  templateUrl: './base-dashboard-full.component.html'
})

export class BaseDashboardFullComponent extends BaseDashboardComponent implements OnInit {
  constructor(
    public router: Router,
    public dialogU: MatDialog,
    public correspondenceService: CorrespondenceService,
    public correspondenceShareService: CorrespondenceShareService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public appLoadConstService: AppLoadConstService,
    public translator: multiLanguageTranslator
  ) {
    super(router, dialogU, correspondenceService, correspondenceShareService, errorHandlerFctsService, appLoadConstService, translator);
  }


  internalInboundRequestsWidth: number;
  internalOutboundRequestsWidth: number;
  externalInboundRequestsWidth: number;
  externalOutboundRequestsWidth: number;
  assignedAction: boolean;
  selectedMail: boolean;
  userData: string[];
  priorityCount: string[];
  userDetails: string[];
  mailData: string[];
  id: number;
  // heroes = overviewitem;
  loading = true;
  animal: string;
  name: string;
  openedSubCorrespond: Correspondence;
  // charts-search toggle variables
  public chartsOpen = 'in';
  public searchopen = 'out';


  // selectedHero: PeriodicElement;
  // displayedColumns: string[] = [
  //   "select",
  //   "CorrespondenceCode",
  //   "Subject",
  //   "SubWorkTask_Title",
  //   "FromDept",
  //   "ToDept",
  //   "Assigned",
  //   "Received",
  //   "Priority",
  //   "Purpose",
  //   "DueDate",
  //   "options"
  // ];
  dataSource = new MatTableDataSource<PeriodicElement>(overviewitem);
  // selection = new SelectionModel<PeriodicElement>(true, []);
  @ViewChild(MatPaginator) overviewitem: MatPaginator;
  // Types of requests
  // Internal Inbound
  public totalInternalInboundRequests;
  public internalInboundRequests=2;
  // Internal Outbound
  public totalInternalOutboundRequests;
  public internalOutboundRequests;
  // External Inbound
  public totalExternalInboundRequests;
  public externalInboundRequests;
  // External Outbound
  public totalExternalOutboundRequests;
  public externalOutboundRequests;
  // Doughnut
  public doughnutChartLabels: string[] = [
    'Urgent',
    'Top Urgent',
    'Normal'
  ];
  public doughnutChartData: number[];
  public doughnutChartType = 'doughnut';
  public doughnutChartOptions: any = {
    responsive: true,
  };

  public doughnutChartColor: Array<any> = [{ backgroundColor: ['#36c2cf', '#1d8acf', '#5df542'] }];

  ngOnInit() {
    super.ngOnInit();
    debugger;
    this.internalInboundRequestsWidth = Math.floor(this.internalInboundRequests / this.totalInternalInboundRequests * 100);
    this.internalOutboundRequestsWidth = 10/100*100;
    this.externalInboundRequestsWidth = Math.floor(this.externalInboundRequests / this.totalExternalInboundRequests * 100);
    this.externalOutboundRequestsWidth = Math.floor(this.externalOutboundRequests / this.totalExternalOutboundRequests * 100);
    // this.dataSource.paginator = this.overviewitem;

    /*     this.correspondenceService
          .getUserData()
          .subscribe(response => (this.userData = response)); */
    this.searchExtOrgFieldShow = true;
    this.searchRecipientDeptFieldShow = false;
    this.searchSenderDeptFieldShow = true;
    /*     this.chartsOpen = 'in';
        this.searchopen = 'out'; */
  }

  getPage(page: number): void {
    if (this.globalConstants.general.UserID !== this.globalConstants.general.ProxyUserID) {
      this.router.navigate([this.routerProxyRedirect]);
    } else {
      const perPage = FCTSDashBoard.DefaultPageSize;
      const start = ((page - 1) * perPage) + 1;
      const end = (start + perPage) - 1;
      this.getCorrespondence(this.reportType, start, end, page, this.SearchFilterData);
    }
  }

  getCorrespondence(pageType: string, start: number, end: number, page: number, SearchFilterData: any): void {
    this.progbar = true;
    this.correspondenceService
      .getDashboardMain(pageType, start, end, SearchFilterData, this.isProxy)
      .subscribe(correspondenceData => {
        const myMap = new Map();
        for (const obj of correspondenceData) {

          if (myMap.has(obj.RowNum)) {
            // myMap.get(obj.RowNum).children.push(obj);
            myMap.get(obj.RowNum).subCorrespondenceDetail.push(obj);
            myMap.get(obj.RowNum).subCorrespondenceNumber = obj.counttasks - 1;
            myMap.get(obj.RowNum).subCorrespondence = true;
          } else {
            myMap.set(obj.RowNum, obj);
          }
        }

        const resultArray: Correspondence[] = [];
        // Iterate over map values
        for (const value of myMap.values()) {
          resultArray.push(value);                // 37 35 40
        }
        this.correspondenceData = resultArray;
        this.progbar = false;
        if (this.correspondenceData.length === 0) {
          this.totalCount = 0;
        } else if (start === 1) {
          this.totalCount = correspondenceData[0].totalRowCount;
          this.appLoadConstService.setUserGroupArray(correspondenceData[0].PerformerGroups);
        }
        this.pagenumber = page;
      });

  }

  openSubCorrespond(correspondData: Correspondence): void {
    this.openedSubCorrespond = correspondData;
  }

  assignedActionButton() {
    this.assignedAction = !this.assignedAction;
  }

  fullDetails() {
    this.selectedMail = !this.selectedMail;
  }

  setItemCount() {
    // overiding parent function to avoid error
  }

  selectWFStepRoute(correspondData: Correspondence) {
    switch (correspondData.CorrespondenceFlowType) {
      case '1':
        this.routerFormStep = '/dashboard/external/correspondence-form-step-inc'; // '/dashboard/external/correspondence-form-step-inc';
        break;
      case '5':
        this.routerFormStep = '/dashboard/external/correspondence-form-step-out'; // '/dashboard/external/correspondence-form-step-out';
        break;
      case '7':
        this.routerFormStep = '/dashboard/internal/correspondence-form-step-intout'; // '/dashboard/internal/correspondence-form-step-int';
        break;
    }
  }

  fullSearchParametersSet(event) {
    this.chartsOpen = 'out';
    this.SearchFilterData = event;
    this.pagenumber = 1;
    this.getPage(this.pagenumber);
  }

  toggleSearchCharts(condition): void {
    this.chartsOpen = !condition ? 'in' : 'out';
    this.searchopen = !condition ? 'out' : 'in';
  }

}

export interface PeriodicElement {
  ID: string;
  Subject: string;
  Requester: string;
  Type: string;
  Assigned: any;
  Received: string;
  Status: string;
  Due_Customer: string;
  inbox_icons: any;
}

const overviewitem: PeriodicElement[] = inboxMail.mails;

/// \full data showing
@Component({
  selector: 'app-mail-detail-view',
  templateUrl: 'mail-detail-view.html',
})

export class MailDetailView {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PeriodicElement) { }
}
