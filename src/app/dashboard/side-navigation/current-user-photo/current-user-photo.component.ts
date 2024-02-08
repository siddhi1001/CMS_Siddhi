import { Component, OnInit } from '@angular/core';
import { SidebarInfoService } from '../sidebar-info.service';
import { SidebarUsersInfo, UserInfo } from '../sidebar-info.model';
import { DomSanitizer } from '@angular/platform-browser';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { UserInfoComponent } from '../user-info/user-info.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-current-user-photo',
  templateUrl: './current-user-photo.component.html',
})
export class CurrentUserPhotoComponent extends UserInfoComponent implements OnInit {

  constructor(
    public sidebarInfoService: SidebarInfoService,
    public sanitizer: DomSanitizer,
    public appLoadConstService: AppLoadConstService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog
  ) {
    super( sidebarInfoService, sanitizer, appLoadConstService, errorHandlerFctsService, dialogU);
   }

  ngOnInit() {
    this.userPhoto = undefined;
    this.sidebarInfoService.getUserInfo(this.getProxyUser()).subscribe(
      response => {
        if (response.results.data.properties.photo_id) {
          this.getUserImg(this.getProxyUser());
        } else {
          if (response.results.data.properties.initials) {
            this.initials = response.results.data.properties.initials;
          } else {
            this.initials = response.results.data.properties.first_name.slice(0, 1).toUpperCase() + response.results.data.properties.last_name.slice(0, 1).toUpperCase();
          }
        }
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

}
