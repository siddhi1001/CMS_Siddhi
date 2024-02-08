import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { SidebarInfoService } from '../sidebar-info.service';
import { UserInfo, UserGroups } from '../sidebar-info.model';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AppLoadConstService } from 'src/app/app-load-const.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  /* userData: string []; */
  initials: string;
  userPhoto: any;
  userData: UserInfo;
  userGroups: UserGroups[];


  constructor(public profileDialog: MatDialogRef< ProfileComponent>,
              public sidebarInfoService: SidebarInfoService,
              public translator: multiLanguageTranslator,
              public sanitizer: DomSanitizer,
              public errorHandlerFctsService: ErrorHandlerFctsService,
              public appLoadConstService: AppLoadConstService,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.userData = this.data.UserData;
    this.getUserGroups(this.userData.ID, this.globalConstants.FCTS_Dashboard.FCTS_GROUP_TYPE);
    if (this.userData.PhotoID) {
      this.getUserImg(this.userData.ID);
    } else {
      this.setUserInitials();
    }
  }
  profileClose(): void {
    this.profileDialog.close();
  }
  

  getUserImg(ID: number) {
    this.sidebarInfoService.getUserImg(ID).subscribe(
      response => {
        const objectURL = URL.createObjectURL(response);
        this.userPhoto = objectURL;
      },
      responseError => {
        if (responseError.status === 404) {
          this.setUserInitials();
        } else {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        }
      }
    );
  }

  setUserInitials() {
    this.initials = this.userData.FirstName_En.slice(0, 1).toUpperCase() + this.userData.LastName_En.slice(0, 1).toUpperCase();
  }

  getUserGroups(ID: number, SpecGroupType: string) {
    this.sidebarInfoService.getUserGroups(ID, SpecGroupType).subscribe(
      response => {
        this.userGroups = response;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      });
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
