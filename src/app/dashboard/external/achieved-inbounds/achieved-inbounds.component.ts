import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { CorrespondenceShareService } from '../../services/correspondence-share.service';
import { BaseDashboardArchiveComponent } from '../../base-classes/base-dashboard-archive/base-dashboard-archive.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { multiLanguageTranslator } from 'src/assets/translator/index';

@Component({
  selector: 'app-achieved-inbounds',
  templateUrl: './achieved-inbounds.component.html',
  styleUrls: ['../../base-classes/base-dashboard/base-dashboard.component.scss']
})
export class AchievedInboundsComponent extends BaseDashboardArchiveComponent implements OnInit {

  constructor(
    public router: Router,
    public dialogU: MatDialog,
    public correspondenceService: CorrespondenceService,
    public сorrespondenceShareService: CorrespondenceShareService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public appLoadConstService: AppLoadConstService,
    public translator: multiLanguageTranslator
  ) {
    super(router, dialogU, correspondenceService, сorrespondenceShareService, errorHandlerFctsService, appLoadConstService, translator);
    this.reportType = 'ExtInbArc';
    this.routerFormStep = '/dashboard/external/correspondence-form-step-inc';
  }

  ngOnInit() {
    super.ngOnInit();
    this.searchExtOrgFieldShow = true;
    this.searchRecipientDeptFieldShow = true;
    this.searchSenderDeptFieldShow = false;
  }
}
