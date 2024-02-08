import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { BaseDashboardActiveComponent } from 'src/app/dashboard/base-classes/base-dashboard-active/base-dashboard-active.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { Correspondence } from '../../services/correspondence.model';
import { RecallTransferInfo } from 'src/app/dashboard/dialog-boxes/transfer-recall-dialog/transfer-recall-dialog.model';
import { TransferReturntoasDialogComponent } from '../../dialog-boxes/transfer-returntoas-dialog/transfer-returntoas-dialog.component';
import { TransferRequestFinal } from '../correspondence-detail/correspondence-transfer-dialog/correspondence-transfer-dialog.model';
import { multiLanguageTranslator } from 'src/assets/translator/index';

@Component({
  selector: 'app-in-progress',
  templateUrl: './in-progress.component.html',
  styleUrls: ['./in-progress.component.scss']
})

export class InProgressComponent extends BaseDashboardActiveComponent implements OnInit {
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
    this.reportType = 'ExtInbAck';
    this.routerFormStep = '/dashboard/external/correspondence-form-step-inc';
  }

  ngOnInit() {
    super.ngOnInit();
    this.searchExtOrgFieldShow = false;
    this.searchRecipientDeptFieldShow = true;
    this.searchSenderDeptFieldShow = true;
  }

  returnToASDialog(correspondData: Correspondence, recallType: string): void {
    const recallTransferInfo = new RecallTransferInfo();
    recallTransferInfo.correspondData = correspondData;
    recallTransferInfo.recallType = recallType;
    recallTransferInfo.selectedIDs = '';

    this.dialogU.open(TransferReturntoasDialogComponent, {
      width: '100%',
      panelClass: 'transfer-reply-dialog', /*  */
      maxWidth: '58vw',
      data: recallTransferInfo
    }).afterClosed().subscribe(result => {
      if (result.ok === true) {
        this.progbar = true;
        this.runRecallTransfer(recallTransferInfo, result.comment);
      } else {
        // console.log('canceled');
      }
    });
  }

  runRecallTransfer(recallTransferInfo: RecallTransferInfo, comment) {
    this.correspondenceService.runRecallTransfer(recallTransferInfo).subscribe(
      response => {
        this.runReturnToAS(recallTransferInfo, comment);
      },
      responseError => {
        this.progbar = false;
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  runReturnToAS(recallTransferInfo: RecallTransferInfo, comment: string) {
    const finalRequest: TransferRequestFinal[] = [];
    const TList: TransferRequestFinal = new TransferRequestFinal;
    TList.Department = this.globalConstants.FCTS_Dashboard.FCTS_AS_SR;
    TList.Purpose = 0;
    TList.Priority = '1';
    TList.Comments = comment;
    TList.DueDate = '0';
    finalRequest.push(TList);

    this.correspondenceShareService.createTransferRequestDash(
      finalRequest,
      recallTransferInfo.correspondData,
      recallTransferInfo.recallType)
      .subscribe(
        (response) => {
          this.setStatusReturnToAS(recallTransferInfo, '2');
          this.runReturnToAS_CCRecall(recallTransferInfo);
          this.getPage(this.pagenumber);
        },
        responseError => {
          this.progbar = false;
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  setStatusReturnToAS(recallTransferInfo: RecallTransferInfo, status: string) {
    const setStatusRequest = this.correspondenceShareService
      .buildObject(
        recallTransferInfo.correspondData,
        status,
        recallTransferInfo.recallType,
        ''
      );
    this.correspondenceShareService.setTransferToStatus(setStatusRequest).subscribe(
      response => {
      },
      responseError => {
        this.progbar = false;
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  runReturnToAS_CCRecall(recallTransferInfo: RecallTransferInfo) {
    this.correspondenceService.returnToAS_CCRecall(recallTransferInfo).subscribe(
      response => {
        // console.log(response);
      },
      responseError => {
        this.progbar = false;
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

}
