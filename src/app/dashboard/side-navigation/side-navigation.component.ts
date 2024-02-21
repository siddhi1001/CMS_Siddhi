import { Component, OnInit, ViewChild } from '@angular/core';
import { FCTSDashBoard } from '../../../environments/environment';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { Router } from '@angular/router';
import { SidebarInfoService } from './sidebar-info.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { SidebarUsersInfo,UserInfo,UserGroups } from './sidebar-info.model';
import { CurrentUserPhotoComponent } from './current-user-photo/current-user-photo.component';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { NewDelegationComponent } from '../side-navigation/new-delegation/new-delegation.component';
import { MatDialog } from '@angular/material';
import { MatMenuTrigger } from '@angular/material/menu';
import { CurrentDelegationsComponent } from '../side-navigation/current-delegations/current-delegations.component';
import { DelegationReportComponent } from '../side-navigation/delegation-report/delegation-report.component';
import { ReportPreferencesComponent } from '../side-navigation/report-preference/report-preferences.component';
@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html'
})
export class SideNavigationComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  basehref: String = FCTSDashBoard.BaseHref;
  showMR = false;
  userData: UserInfo;
  userGroups: UserGroups[];
  userPhoto: any;
  routerRoot = '/dashboard/external';
  panelOpenState = false;
  hideToggle = false;
  CSUrl: String = FCTSDashBoard.CSUrl;
  isExternalIncoming = false;
  isExternalOutbound = false;
  isInternalOutbound = false;
  isAdminUser = false;
  isAdminUserFound = false;
  //Vinesh Bhatt: TBD : Change to constants
  adminGroups = ['136665', '136776', '136448', '137216'];

  constructor(
    private appLoadConstService: AppLoadConstService,
    private sidebarInfoService: SidebarInfoService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public router: Router, public translator: multiLanguageTranslator,
    public correspondenceShareService: CorrespondenceShareService,
    public dialogU: MatDialog

  ) { }
  @ViewChild('currentUserPhoto') private currentUserPhoto: CurrentUserPhotoComponent;
  @ViewChild('clickMenuTrigger') clickMenuTrigger: MatMenuTrigger;

  ngOnInit() {
    this.showMR = this.globalConstants.general.showMR;
    this.sidebarInfoService.getUsersInfo().subscribe(
      response => {
        // console.log(response);
        this.userData = response;
        /*  this.getUserImg(); */
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
    
    this.getUserGroups(this.globalConstants.general.UserID, this.globalConstants.FCTS_Dashboard.FCTS_GROUP_TYPE);
  
  }

  getUserGroups(ID: number, SpecGroupType: string) {
    this.sidebarInfoService.getUserGroups(ID, SpecGroupType).subscribe(
      response => {
        this.userGroups = response;

        for (const userGroup of this.userGroups) {
          console.log(userGroup.GroupID);
          console.log(this.isAdminUser);
    
          if (this.adminGroups.includes(userGroup.GroupID)) {
            this.isAdminUser = true;
            this.isAdminUserFound =true;
          } 
          if (!this.isAdminUserFound && userGroup.GroupID == '136554') {
            this.isExternalIncoming = true;
          } 
          if (!this.isAdminUserFound && userGroup.GroupID == '137215'){
            this.isExternalOutbound = true;
          }
          if (!this.isAdminUserFound && userGroup.GroupID == '136557'){
            this.isInternalOutbound = true;
          }
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      });
  }

  changePhoto() {
    this.currentUserPhoto.ngOnInit();
    this.onProxyChange();
  }


  onProxyChange() {
    this.router.navigate([this.globalConstants.general.routerRoot]);
    this.correspondenceShareService.onProxyChange();
  }

  openDialogNewDelegation(): void {
    this.clickMenuTrigger.closeMenu();
    const dialogRef = this.dialogU.open(NewDelegationComponent, {
      width: '800px',
      panelClass: 'delegationDialogBoxClass',
      maxWidth: '85vw',
      data: {
        section: 'userSection'
      }
    });
  }

  openDialogCurrentDelegations(): void {
    this.clickMenuTrigger.closeMenu();
    const dialogRef = this.dialogU.open(CurrentDelegationsComponent, {
      width: '1024px',
      panelClass: 'currentDelegationDialogBoxClass',
      maxWidth: '85vw',
      data: {
        section: 'userSection'
      }
    });
  }

  openDialogDelegationReport(): void {
    this.clickMenuTrigger.closeMenu();
    const dialogRef = this.dialogU.open(DelegationReportComponent, {
      width: '90vw',
      panelClass: 'delegationReportDialogBoxClass',
      maxWidth: '90vw',
      data: { section: 'userSection' }
    });
  }

  openDialogReportPreference(): void {
    this.clickMenuTrigger.closeMenu();
    const dialogRef = this.dialogU.open(ReportPreferencesComponent, {
      width: '90vw', 
      panelClass: 'reportpreferencesDialogBoxClass',
      data: {section: 'userSection'} 
    });
  }
}
