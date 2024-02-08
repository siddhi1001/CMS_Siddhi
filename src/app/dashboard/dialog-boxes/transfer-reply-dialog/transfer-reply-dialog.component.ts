import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TransferRequestFinal } from 'src/app/dashboard/external/correspondence-detail/correspondence-transfer-dialog/correspondence-transfer-dialog.model';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { StatusRequest } from 'src/app/dashboard/models/Shared.model';

@Component({
  selector: 'app-transfer-reply-dialog',
  templateUrl: './transfer-reply-dialog.component.html',
  styleUrls: ['./transfer-reply-dialog.component.scss']
})
export class TransferReplyDialogComponent implements OnInit {
  comment = '';
  disButton = false;
  constructor(
    public dialogRef: MatDialogRef<TransferReplyDialogComponent>,
    private _correspondenceShareService: CorrespondenceShareService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  sendReply(): void {
    this.disButton = true;
    const finalRequest: TransferRequestFinal[] = [];
    const TList: TransferRequestFinal = new TransferRequestFinal;

    for (let i = 0; i < this.data.transferUser.length; i++) {
      TList.Department = this.data.transferUser[i].myRows[0].DepartmentName_EN;
      TList.To =  this.data.transferUser[i].myRows[0].trUserID;
      TList.Purpose = 0;
      TList.Priority = '1';
      TList.Comments = this.comment;
      TList.DueDate = '0';
      finalRequest.push(TList);
    }
    let commonData: StatusRequest = new StatusRequest;
    commonData = this._correspondenceShareService.buildObject(this.data.corrData, '1', this.data.callPlace, '');
      this._correspondenceShareService.createTransferReply(finalRequest, commonData)
      .subscribe(
      response => {
        this.dialogRef.close('Reload');
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
     );
  }

  ngOnInit() {
  }

}
