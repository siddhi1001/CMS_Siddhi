import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { BaseDashboardActiveComponent } from 'src/app/dashboard/base-classes/base-dashboard-active/base-dashboard-active.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { multiLanguageTranslator } from 'src/assets/translator/index';

@Component({
  selector: 'app-new-inbound',
  templateUrl: './new-inbound.component.html',
  styleUrls: ['./new-inbound.component.scss']
})

export class NewInboundComponent extends BaseDashboardActiveComponent implements OnInit {

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
    this.reportType = 'ExtInbNew';
    this.routerFormStep = '/dashboard/external/correspondence-form-step-inc';
  }

  ngOnInit() {
    super.ngOnInit();
    this.searchExtOrgFieldShow = true;
    this.searchRecipientDeptFieldShow = true;
    this.searchSenderDeptFieldShow = false;
  }

  selectionNewInboxAll() {
    const numSelectedNewInboxlCorrespondence = this.selection.selected.length;
    const numRowsNewInboxlCorrespondence = this.correspondenceData.filter(element => {
      return element.transIsCC == 1 && element.transID == 0;
    }).length;
    return (numSelectedNewInboxlCorrespondence === numRowsNewInboxlCorrespondence);
  }

  selectionNewInboxAllCorrespondence() {
    this.selectionNewInboxAll() ? this.selection.clear()
      : this.correspondenceData.filter(
        element => element.transIsCC == 1 && element.transID == 0
      ).forEach(
        element => { this.selection.select(element); }
      );
  }

}

