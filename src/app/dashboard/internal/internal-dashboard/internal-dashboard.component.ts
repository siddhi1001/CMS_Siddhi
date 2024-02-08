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
  selector: 'app-internal-dashboard',
  templateUrl: './internal-dashboard.component.html',
  styleUrls: ['./internal-dashboard.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ overflow: 'hidden', height: '*' })),
      state('out', style({ opacity: '0', overflow: 'hidden', height: '0px', minHeight: '0', margin: 0, padding: 0 })),
      transition('in <=> out', animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})

export class InternalDashboardComponent extends BaseDashboardFullComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();

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
    this.reportType = 'IntFullSearch';
    this.routerFormStep = '/dashboard/internal/correspondence-form-step-intout';
    this.routerProxyRedirect = '/dashboard/internal/new-intoutbounds';
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.globalConstants.general.ProxyUserID === this.globalConstants.general.UserID) {
      this.correspondenceService
        .getUserData()
        .subscribe(response => (this.userData = response));
    }
  }

}
