import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatOptionSelectionChange } from '@angular/material';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';

interface ReturnReason {
  selectedID: string;
  selectedDescription: string;
  comment: string;
}

interface RejectList {
  ID: number;
  adParam: number;
  attrName_AR: string;
  attrName_EN: string;
}

@Component({
  selector: 'app-send-back-dialog',
  templateUrl: './send-back-dialog.component.html',
  styleUrls: ['./send-back-dialog.component.scss']
})


export class SendBackDialogComponent implements OnInit {
  rejectList: RejectList;
  returnReason: ReturnReason = {
    selectedID: '',
    selectedDescription: '',
    comment: ''
  };

  errmsg = false;
  disButton = false;
  comment: string;

  constructor(
    public dialogRef: MatDialogRef<SendBackDialogComponent>,
    private _correspondenceDetailsService: CorrespondenceDetailsService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.getSelectAttributes();
    this.returnReason.selectedID = '';
  }

  getSelectAttributes(): void {
    this._correspondenceDetailsService
      .getRejectReasons(this.data)
      .subscribe(
        response => {
          this.rejectList = response;
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  sendComment() {
    if (this.returnReason.selectedID !== '') {
      this.dialogRef.close(this.returnReason);
    } else {
      this.errmsg = true;
    }

  }

  selected(list: any, event: MatOptionSelectionChange) {
    if (event.source.selected) {
      this.returnReason.selectedDescription = list.attrName_EN;
      this.errmsg = false;
    }
  }

}
