import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SidebarInfoService } from '../sidebar-info.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { FCTSDashBoard } from '../../../../environments/environment';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
 
@Component({
  selector: 'app-report-preferences',
  templateUrl: './report-preference.component.html',
  styleUrls: ['./report-preference.component.scss']
})
export class ReportPreferencesComponent implements OnInit {
  displayedColumns: string[] = ['PreferenceId', 'Name', 'Description', 'Active', 'StartOn'];
  dataSource: MatTableDataSource<any>;
  basehref: string = FCTSDashBoard.BaseHref;
  proxyFilter = new FormControl();
  userFilter = new FormControl();
  reportPreferences: any[] = [];
  selectedItems: any[] = [];
  selectedReportIDs: number[] = [];
  userReportPreferences: any;//new@
  cval : number;
 
  @ViewChild(MatSort) sort: MatSort;
  private _globalConstants = this.appLoadConstService.getConstants();
 
 
  constructor(
    private translator: multiLanguageTranslatorPipe,
    private sidebarInfoService: SidebarInfoService,
    private appLoadConstService: AppLoadConstService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private dialog: MatDialog,
    private notificationmessage: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
 
  ngOnInit(): void {
 
   
   
    this.getUserReportpreferences();
 
    if (this.reportPreferences.length === 0) {
      this.getReportpreferences();
    }
 
  }
 
 
  isReportSelected(reportID: number): boolean {
   /* console.log('isReportSelected userReportPreferences',this.userReportPreferences);
    this.cval= this.userReportPreferences.indexOf(reportID);
    console.log('isReportSelected cval',this.cval);
    console.log('isReportSelected report id ',reportID);
 
    */
    if (!this.userReportPreferences || !this.userReportPreferences.LandingPageReports) {
      return false; // Handle undefined or null case
    }
 
    const data =this.userReportPreferences;
   
    for (const reportIDl of data.LandingPageReports)
     {
      console.log("Report ID:", reportIDl);
      if (reportID==reportIDl)
       { return true;
       break;
      }
    }
    return false;
   
  }
 
 
  // isReportSelected(reportID: number): boolean {
  //   if (!this.userReportPreferences || !this.userReportPreferences.LandingPageReports) {
  //     return false;
  //   }
 
  //   const landingPageReports = this.userReportPreferences.LandingPageReports;
  //   for (const reportIDl of landingPageReports) {
  //     if (reportID === reportIDl) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
 
 
  getReportpreferences(): void {
    console.log('Calling getReportpreferences() function...');
    this.sidebarInfoService.getReportpreferences().subscribe(
       response => { this.reportPreferences = response;
        console.log('Response from API:', response);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
           console.log('Error fetching report preferences:', responseError);
      }
    );
  }
 
  saveUserReportPreferences() {
    if (this.selectedReportIDs.length > this._globalConstants.general.maxreportselection) {
      console.error('Maximum selection exceeded. Please select up to ' + this._globalConstants.general.maxreportselection + ' items.');
      return;
    }
    const preferenceJSONString = `{"LandingPageReports":[${this.selectedReportIDs.join(',')}]}`;
    console.log('User Report Preferences:', preferenceJSONString);
    this.sidebarInfoService.UserReportpreferences(preferenceJSONString).subscribe(
      response => {
        this.showNotification('success', 'report_preferences_save');
      },
      error => {
        console.error('Error saving user report preferences:', error);
        this.showNotification('error', 'report_preferences_error');
      }
    );
  }
  updateSelectedReportIDs(reportID: number, isChecked: boolean) {
    if (isChecked) {
      console.log('Inside uptadeteSelected:');
      if (this.selectedReportIDs.length >= this._globalConstants.general.maxreportselection) {
        this.showNotification('error', 'report_preferences_error');
        return;
      }
      this.selectedReportIDs.push(reportID);
    } else {
      const index = this.selectedReportIDs.indexOf(reportID);
      if (index !== -1) {
        this.selectedReportIDs.splice(index, 1);
      }
    }
  }
 
  showNotification(type: string, msg: string): void {
    this.notificationmessage[type](
      this.translator.transform('report_preferences_Messages'),
      this.translator.transform(msg),
      2500
    );
  }
 
  getUserReportpreferences(): void {
    console.log('Calling getUserReportpreferences() function...');
    this.sidebarInfoService.getUserReportpreferences().subscribe(
       response => {
        // this.getUserReportpreferences = response;
         this.userReportPreferences= response;
        console.log('userReportPreferences :', this.userReportPreferences);
        console.log('Response from UserReportPreferences API :', response);
        //console.log('selected report id before :', this.selectedReportIDs);
 
       // this.selectedReportIDs=this.userReportPreferences;
       // this.selectedReportIDs = [1, 2, 3]; // Example assignment
 
       // console.log('selected report id after :', this.selectedReportIDs);
       
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
           console.log('Error fetching getUserReportpreferences:', responseError);
      }
    );
}
 
 
 
}