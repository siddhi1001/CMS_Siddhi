import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { StatusRequest } from 'src/app/dashboard/models/Shared.model';

@Component({
  selector: 'app-complete-dialog',
  templateUrl: './complete-dialog.component.html'
})

export class CompleteDialogComponent implements OnInit {
  comment = '';
  err: string;

  constructor(
    public dialogRef: MatDialogRef<CompleteDialogComponent>,
    private _correspondenceShareService: CorrespondenceShareService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    @Inject(MAT_DIALOG_DATA) public corrData: any,

  ) { }

  onNoClick(): void {
    this.dialogRef.close('Cancel');
  }

  sendStatus(status: string): void {
    let CompleteRequestFinal: StatusRequest = new StatusRequest;
    if (this.comment.trim().length < 10 ) {
      this.err = 'Comment should be more than 10 characters';
    } else {
      CompleteRequestFinal = this._correspondenceShareService.buildObject(this.corrData.data, '1', this.corrData.callplace, this.comment);
      this.err = '';
      this._correspondenceShareService.setTransferToStatus(CompleteRequestFinal).subscribe(
        response => {
          this.dialogRef.close('Reload');
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
          this.dialogRef.close('error');
        }
      );
    }
  }

  ngOnInit() {
  }

}
