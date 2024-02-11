import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { BaseDashboardFullComponent } from '../../base-classes/base-dashboard-full/base-dashboard-full.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { animate, style, transition, trigger, state } from '@angular/animations';
import { multiLanguageTranslator } from 'src/assets/translator/index';
 
@Component({
  selector: 'app-external-dashboard',
  templateUrl: './external-dashboard.component.html',
  styleUrls: ['./external-dashboard.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ overflow: 'hidden', height: '*' })),
      state('out', style({ opacity: '0', overflow: 'hidden', height: '0px', minHeight: '0', margin: 0, padding: 0 })),
      transition('in <=> out', animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
 
export class ExternalDashboardComponent extends BaseDashboardFullComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  showNoOfContract: boolean = false;
 
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
    this.reportType = 'ExtFullSearch';
    this.routerProxyRedirect = '/dashboard/external/new-outbounds';
  }
 
  ngOnInit(): void {
    super.ngOnInit();
    if (this.globalConstants.general.ProxyUserID === this.globalConstants.general.UserID) {
      this.correspondenceService
      .getUserData()
      .subscribe(
        response => {
          this.userData = response;
        },
        error => {
          console.error('Error fetching user data:', error);
        }
      );
   
      this.correspondenceService
      .getPriorityCounts()
      .subscribe(
        response => {
          // Assuming response[0] contains an object with keys representing chart data values
          this.doughnutChartData = Object.values(response[0]).map(value => +value);
          console.log('Error fetching doughnut chart data: Line no 59');
        },
        error => {
          console.error('Error fetching doughnut chart data:', error);
        }
      );
   
      this.correspondenceService
      .getCorrespondanceFlowType()
      .subscribe(
        response => {
          this.totalInternalInboundRequests = response["TIIB"];
          this.totalInternalOutboundRequests = response["TIOB"];
          this.totalExternalInboundRequests = response["TEIB"];
          this.totalExternalOutboundRequests = response["TEOB"];
          this.internalOutboundRequests = response["IOB"];
          this.externalInboundRequests = response["EIB"];
          this.externalOutboundRequests = response["EOB"];
        },
        error => {
          console.error('Error fetching flow type:', error);
        }
      );
    }
  }
 


 // covert json data into an array here and use def tag to set ? as value
  // showDiv() {
  //   this.showNoOfContract = true;
  // }
 
  // hideDiv() {
  //   this.showNoOfContract = false;
  // }
 
  toggleDiv() {
    this.showNoOfContract = !this.showNoOfContract;
  }
 
  isDivVisible() {
    return this.showNoOfContract;
  }
}