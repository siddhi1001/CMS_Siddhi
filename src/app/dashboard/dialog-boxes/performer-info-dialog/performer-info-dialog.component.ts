import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CorrespondenceShareService } from '../../services/correspondence-share.service';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SidebarInfoService } from '../../side-navigation/sidebar-info.service';

@Component({
  selector: 'app-performer-info-dialog',
  templateUrl: './performer-info-dialog.component.html',
  styleUrls: ['./performer-info-dialog.component.scss']

})
export class PerformerInfoDialogComponent implements OnInit {
  performerInfo;
  performerProgbar: Boolean =  false;
  userPhoto: any;
  initials: string;

  constructor(
    public dialogRef: MatDialogRef<PerformerInfoDialogComponent>,
    public correspondenceShareService: CorrespondenceShareService,
    public sanitizer: DomSanitizer,
    public sidebarInfoService: SidebarInfoService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.getPerformerUserInfo(this.data.kuafID);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getPerformerUserInfo(ID: number): void {
    this.performerProgbar = true;
    this.userPhoto = undefined;
    this.correspondenceShareService.getPerformerUserInfo(ID)
    .subscribe(
      response => {
        this.performerInfo = response;
        this.performerProgbar = false;
        if (this.performerInfo.Employee_Info) {
          if (this.performerInfo.PrfInfo_General.PhotoID !== '0') {
            this.getUserImg(this.performerInfo.PrfInfo_General.ID);
          } else {
            this.setInitials();
          }
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
        this.closeDialog();
      });
  }

  getUserImg(ID: number) {
    this.sidebarInfoService.getUserImg(ID).subscribe(
      response => {
        const objectURL = URL.createObjectURL(response);
        this.userPhoto = objectURL;
      },
      responseError => {
        if (responseError.status === 404) {
          this.setInitials();
        } else {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      }
    );
  }

  setInitials() {
    this.initials = this.performerInfo.PrfInfo_General.FirstName_EN.slice(0, 1).toUpperCase() + this.performerInfo.PrfInfo_General.LastName_EN.slice(0, 1).toUpperCase();    
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
