import { Component, OnInit, Inject } from '@angular/core';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from 'src/app/dashboard/dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { SenderDetailsData } from 'src/app/dashboard/services/correspondence-response.model';

@Component({
  selector: 'app-select-team-dialog',
  templateUrl: './select-team-dialog.component.html',
  styleUrls: ['./select-team-dialog.component.scss']
})
export class SelectTeamDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SelectTeamDialogComponent>,
    public correspondenceDetailsService: CorrespondenceDetailsService,
    public _errorHandlerFctsService: ErrorHandlerFctsService,
    public dialog: MatDialog
  ) { }
  teamsList: SenderDetailsData[] = this.data.teamsList;
  userTeam: SenderDetailsData;
  teamID: number = this.data.teamID ? this.data.teamID : 0;

  ngOnInit() {
    this.userTeam = this.teamsList.filter(element => {
      return element.TeamID === this.teamID;
    })[0];
  }

  showConfirmDialog(type: string): void {
    if (this.userTeam.TeamID === this.teamID) {
      this.dialogRef.close('Cancel');
    } else {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '100%',
        panelClass: 'userConfirmation',
        maxWidth: '30vw',
        data: {
          message: 'changeTeam'
        }
      }).afterClosed().subscribe(
        response => {
          if (response) {
            this.dialogRef.close(this.userTeam);
          }
        });
    }
  }

  closeDialog(): void {
    this.dialogRef.close('Cancel');
  }

}
