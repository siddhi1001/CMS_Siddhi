import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { TransferRecallDialogData, RecallTransferInfo } from './transfer-recall-dialog.model';
import { MessageDialogComponent } from 'src/app/dashboard/dialog-boxes/message-dialog/message-dialog.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { TransferRecallService } from 'src/app/dashboard/services/transfer-recall.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';

@Component({
  selector: 'app-transfer-recall-dialog',
  templateUrl: './transfer-recall-dialog.component.html',
  styleUrls: ['./transfer-recall-dialog.component.scss']
})

export class TransferRecallDialogComponent implements OnInit {
  private _globalConstants = this._appLoadConstService.getConstants();
  private _inputData: RecallTransferInfo;
  public allTransferedRows: TransferRecallDialogData[];
  selection = new SelectionModel<TransferRecallDialogData >(true, []);

  constructor(
    public _dialogRef: MatDialogRef<TransferRecallDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _dialogU: MatDialog,
    private _correspondenceService: CorrespondenceService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private _transferRecallService: TransferRecallService,
    private _appLoadConstService: AppLoadConstService
  ) { }

  ngOnInit() {
    this._inputData = this._data;    
    this.getTransferRecall(this._inputData);
  }

  recallDialogBoxClose(action: string): void {
    this._dialogRef.close(action);
  }

  sendRecallRequest() {
// this.showMessage('selected IDs ' + this._getSelectedIDs().toString());
    if ( this.selection.selected.length ) {
    this._inputData.selectedIDs = this._getSelectedIDs().toString();
    this._correspondenceService.runRecallTransfer(this._inputData).subscribe(
      response => {        
        this.recallDialogBoxClose('recall');
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
        this.recallDialogBoxClose('error');
      }
    );
    } else {
      //console.log('please select at least one row');
    }
  }

  private _getSelectedIDs(): any[] {
    const selectedRows = this.selection.selected;
    const selectedRowsLength = selectedRows.length;
    const IDsList = [];
    if ( selectedRowsLength > 0 ) {
      for ( let index = 0; index < selectedRowsLength; index++ ) {
        IDsList.push(selectedRows[index].ID);
      }
    }
    return IDsList;
  }

  recallTransfer(recallTransferInfo: RecallTransferInfo) {
    if ( recallTransferInfo.recallType !== 'ReturnToAS'  ) {
      this.getTransferRecall(recallTransferInfo);
    } else {
      // show message: Please enter the reason for returning to Archive Section
      this.runTransferRecall(recallTransferInfo);
      this.returnToAS_CCRecall(recallTransferInfo);
    }
  }

  getTransferRecall(recallTransferInfo: RecallTransferInfo ) {
    this._transferRecallService.getTransRecallData(recallTransferInfo).subscribe(
      response => {
        this.allTransferedRows = response;
        //console.log(this.allTransferedRows);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
        this.recallDialogBoxClose(responseError);
      }
    );
  }

  runTransferRecall(recallTransferInfo: RecallTransferInfo) {
    throw new Error('Method not implemented.');
  }

  returnToAS_CCRecall(recallTransferInfo: RecallTransferInfo) {
    throw new Error('Method not implemented.');
  }

  showMessage(message: string) {
    this._dialogU.open( MessageDialogComponent, {
      width: '100%',
      // margin: 'auto',
      panelClass: 'complete-dialog',
      maxWidth: '30vw',
      data: {
        message
      }

    })
      .afterClosed().subscribe();
  }

}
