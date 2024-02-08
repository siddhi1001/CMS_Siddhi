import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SidebarInfoService } from '../sidebar-info.service';
import { SidebarUsersInfo, UserInfo } from '../sidebar-info.model';
import { DomSanitizer } from '@angular/platform-browser';
import { UserInfoComponent } from '../user-info/user-info.component';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-proxy-info',
  templateUrl: './proxy-info.component.html',
})
export class ProxyInfoComponent extends UserInfoComponent implements OnInit {

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
    if (this.userData.PhotoID) {
      this.getUserImg(this.userData.ID);
    } else {
      this.setUserInitials();
    }
  }
}
