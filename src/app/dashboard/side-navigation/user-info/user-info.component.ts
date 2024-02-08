import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SidebarInfoService } from '../sidebar-info.service';
import { UserInfo } from '../sidebar-info.model';
import { DomSanitizer } from '@angular/platform-browser';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { ProfileComponent } from '../../side-navigation/profile/profile.component';
import { MatDialog } from '@angular/material';
@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent implements OnInit {

  constructor(
    public sidebarInfoService: SidebarInfoService,
    public sanitizer: DomSanitizer,
    public appLoadConstService: AppLoadConstService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog
  ) { }
  @Output() userChanged = new EventEmitter<string>();
  @Input() userData: UserInfo;
  userPhoto: any;
  initials: string;
  basehref: string;

  ngOnInit() {
    if (this.userData.PhotoID) {
      this.getUserImg(this.userData.ID);
    } else {
      this.setUserInitials();
    }
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

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  changeProxy(id: number) {
    this.appLoadConstService.setProxy(id.toString());
    this.userChanged.next();
    this.setUserNameProxy(this.userData.Name_En);
  }

  setUserNameProxy(name: string) {
    this.appLoadConstService.setUserNameProxy(name);
  }

  getProxyUser() {
    const globalconstants = this.appLoadConstService.getConstants();
    return globalconstants.general.ProxyUserID;
  }

  setUserInitials() {
    this.initials = this.userData.FirstName_En.slice(0, 1).toUpperCase() + this.userData.LastName_En.slice(0, 1).toUpperCase();
  }
  openProfile(userdata: any): void {
    const dialogRef = this.dialogU.open(ProfileComponent, {
      width: '100%',
      panelClass: 'profileDialogBox',
      maxWidth: '85vw',
      data: {
        UserData: userdata
      }
    });
  }

}

