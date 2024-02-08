import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-transfer-returntoas-dialog',
  templateUrl: './transfer-returntoas-dialog.component.html'
})

export class TransferReturntoasDialogComponent implements OnInit {
  public comment = '';
  public err: string;
  private _res = {'ok': false, 'comment': ''};

  constructor(
    private _dialogRef: MatDialogRef<TransferReturntoasDialogComponent>
  ) { }

  ngOnInit() {
    this._dialogRef.beforeClosed().subscribe(
      () => this._dialogRef.close(this._res)
    );
  }

  returnComment(): void {
    if (this.comment.trim().length < 10 ) {
      this.err = 'Comment should be more than 10 characters';
    } else {
      this._res.ok = true;
      this._res.comment = this.comment;
      this._dialogRef.close();
    }
  }

}
