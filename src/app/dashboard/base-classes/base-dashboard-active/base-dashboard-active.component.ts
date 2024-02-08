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
  selector: 'app-base-dashboard-active',
  templateUrl: './base-dashboard-active.component.html'
})

export class BaseDashboardActiveComponent extends BaseDashboardComponent implements OnInit {
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
  userName: string;

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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.correspondenceData.length;
    return numSelected === numRows;
  }

  selectionNewInboxAll() {
    const numSelectedNewInboxlCorrespondence = this.selection.selected.length;
    const numRowsNewInboxlCorrespondence = this.correspondenceData.length;
    return (
      numSelectedNewInboxlCorrespondence === numRowsNewInboxlCorrespondence
    );
  }

  selectionNewInboxAllCorrespondence() {
    this.selectionNewInboxAll()
      ? this.selection.clear()
      : this.correspondenceData.forEach(element => this.selection.select(element));
  }
  /* The label for the checkbox on the passed row */
  checkboxLabel(correspondData?: any): string {
    if (!correspondData) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(correspondData) ? 'deselect' : 'select'} row ${correspondData.position + 1}`;
  }
  /* *****************************  Transfer reply ******************************************* */
  transferReplyDialog(correspondData: Correspondence, transUser: CorrResponse): void {
    const dialogRef = this.dialogU.open(TransferReplyDialogComponent, {
      width: '100%',
      panelClass: 'transfer-reply-dialog',
      maxWidth: '60vw',
      data: {
        corrData: correspondData,
        transferUser: transUser,
        callPlace: 'SingleDashboard'
      }
    }).afterClosed().subscribe(result => {
      if (result === 'Reload') {
        this.getPage(this.pagenumber);
      }
    });
  }

  transferReply(correspondData: Correspondence): void {
    this.correspondenceShareService.getTransferUser(correspondData.transDelegatorID.toString()).subscribe(
      transferUser => {
        this.transferReplyDialog(correspondData, transferUser);
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  replyExternal(correspondData: Correspondence): void {
    this.router.navigate([this.routerInitateExternal],
      {
        queryParams:
        {
          VolumeID: correspondData.VolumeID,
          locationid: correspondData.DataID,
          action: 'reply'

        },
        skipLocationChange: false
      }
    );
  }
  /* ************************************************************************************** */

}
