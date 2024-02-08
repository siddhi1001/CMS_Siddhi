import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { FCTSDashBoard } from 'src/environments/environment';
import { Correspondence } from 'src/app/dashboard/services/correspondence.model';

import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';

import { BaseDashboardComponent } from 'src/app/dashboard/base-classes/base-dashboard/base-dashboard.component';
import { CorrResponse } from '../../services/correspondence-response.model';
import { TransferReplyDialogComponent } from '../../dialog-boxes/transfer-reply-dialog/transfer-reply-dialog.component';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { multiLanguageTranslator } from 'src/assets/translator/index';

@Component({
  selector: 'app-base-dashboard-archive',
  templateUrl: './base-dashboard-archive.component.html'
})
export class BaseDashboardArchiveComponent extends BaseDashboardComponent implements OnInit {

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

  ngOnInit() {
    super.ngOnInit();
    this.stepPerformer = this.globalConstants.general.ProxyUserID;
  }

  getPage(page: number): void {
    if (this.globalConstants.general.ProxyUserID !== this.globalConstants.general.UserID) {
      this.isProxy = true;
    } else {
      this.isProxy = false;
    }
    const perPage = FCTSDashBoard.DefaultPageSize;
    const start = ((page - 1) * perPage) + 1;
    const end = (start + perPage) - 1;
    this.getCorrespondence(this.reportType, start, end, page, this.SearchFilterData);
    if (this.selection.selected.length > 0) { this.selection.clear(); }
  }

}
