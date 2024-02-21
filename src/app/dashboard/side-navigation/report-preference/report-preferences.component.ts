import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SidebarInfoService } from '../sidebar-info.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { ConfirmationDialogComponent } from 'src/app/dashboard/dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { FCTSDashBoard } from '../../../../environments/environment';


@Component({
  selector: 'app-report-preferences',
  templateUrl: './report-preference.component.html',
  styleUrls:['./report-preference.component.scss'],
  
})
export class ReportPreferencesComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  displayedColumns: string[] = ['PreferenceId', 'Name', 'Description', 'Active', 'StartOn'];
  dataSource;
  basehref: String = FCTSDashBoard.BaseHref;
  proxyFilter = new FormControl();
  userFilter = new FormControl();
  reportPreferences: any;
  selectedItems: any[] = [];
  selectedReportIDs: number[] = [];
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private sidebarInfoService: SidebarInfoService,
    private appLoadConstService: AppLoadConstService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private dialog: MatDialog,
   @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}
 
  ngOnInit(): void {
    this.getReportpreferences();
  }

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
    const preferenceJSON = {
      LandingPageReports: this.selectedReportIDs
    };
    const preferenceJSONString = JSON.stringify(preferenceJSON);
    console.log('User Report Preferences:', preferenceJSONString);
    this.sidebarInfoService.UserReportpreferences(preferenceJSONString)
    .subscribe(
      response => {
        // Handle the response if needed
      },
      error => {
        // Handle the error if needed
      })
  }

  // Function to update selectedReportIDs array when checkboxes are checked or unchecked
  updateSelectedReportIDs(reportID: number, isChecked: boolean) {
    if (isChecked) {
      // Add reportID to the array if checked
      this.selectedReportIDs.push(reportID);
    } else {
      // Remove reportID from the array if unchecked
      const index = this.selectedReportIDs.indexOf(reportID);
      if (index !== -1) {
        this.selectedReportIDs.splice(index, 1);
      }
    }
  }
}


