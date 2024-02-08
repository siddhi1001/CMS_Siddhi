import { Component, OnInit, Inject } from '@angular/core';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MAT_DATE_LOCALE } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { OrgNameAutoFillModelSimpleUser } from '../../models/CorrespondenenceDetails.model';
import { SidebarInfoService } from '../sidebar-info.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { DelegationReportRequest } from 'src/app/dashboard/side-navigation/sidebar-info.model';
import { AppDateAdapter, APP_DATE_FORMATS } from './format-datepicker';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';



@Component({
  selector: 'app-delegation-report',
  templateUrl: './delegation-report.component.html',
  styleUrls: ['./delegation-report.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class DelegationReportComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  delegationReportForm: FormGroup;
  filteredDelNames: Observable<OrgNameAutoFillModelSimpleUser[]>;
  displayedColumns = ['UserName', 'ProxyName' , 'StartDate', 'EndDate', 'UserStartDate', 'UserFinishDate' ];
  dataSource;
  proxyFilter = new FormControl();
  userFilter = new FormControl();
  startDateFilter = new FormControl();
  endDateFilter = new FormControl();
  userStartDateFilter = new FormControl();
  userFinishDateFilter = new FormControl();
  filteredValues = {  UserName_EN: '', ProxyName_EN: '', StartDate: '', EndDate: '' , UserStartDate: '' , UserFinishDate: '' };
  panelcontrol = true;
  delegationRepotrProgbar = false;
  spinnerProgbar = false;
  constructor(
    private formBuilder: FormBuilder,
    private sidebarInfoService: SidebarInfoService,
    private appLoadConstService: AppLoadConstService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {

    this.delegationReportForm = this.formBuilder.group({
      Delegatee: '',
      startDate: { disabled: true, value: '' },
      endDate: { disabled: true, value: '' }
    });

    this.filteredDelNames = this.delegationReportForm.get('Delegatee').valueChanges
    .pipe(
      debounceTime(300),
     switchMap(value => this.sidebarInfoService.searchFieldForAutoFill(value, 'IntNameSimple', ''))
    );
  }

  displayFieldValue(fieldValue: OrgNameAutoFillModelSimpleUser) {
    if (fieldValue) { return fieldValue.Val_En; }
  }

  getSearchObject() {
    const finalRequest: DelegationReportRequest = new DelegationReportRequest;
    finalRequest.recUserID = this.globalConstants.general.UserID;
    finalRequest.proxyUser = this.delegationReportForm.get('Delegatee').value.RecipientUserID ? this.delegationReportForm.get('Delegatee').value.RecipientUserID : 0;
    finalRequest.startDate = this.DateToString( this.delegationReportForm.get('startDate').value );
    finalRequest.endDate = this.DateToString( this.delegationReportForm.get('endDate').value) ;
    this.getDelegationReport(finalRequest);
  }

  DateToString(mDate): string {
    function pad(n) { return n < 10 ? '0' + n : n; }
    if (mDate instanceof Date) {
    return 'D'                    + '/'
      + mDate.getFullYear()       + '/'
      + pad(mDate.getMonth() + 1) + '/'
      + pad(mDate.getDate())      + ':'
      + pad(mDate.getHours())     + ':'
      + pad(mDate.getMinutes())   + ':'
      + pad(mDate.getSeconds());
    } else {
      return '';
    }
  }

  clearFilter() {
    this.clearFilters();
    this.delegationReportForm.reset({
      Delegatee: '',
      startDate: '',
      endDate: ''
    });
    this.dataSource = new MatTableDataSource();
    this.delegationRepotrProgbar = false;
  }

  getDelegationReport(finalRequest) {
    this.spinnerProgbar = true;
    this.clearFilters();
    this.sidebarInfoService.getDelegationReport(finalRequest, this.data.section).subscribe(
      response => {
        this.spinnerProgbar = false;
        this.delegationRepotrProgbar = true;
        this.panelcontrol = false;
        this.dataSource = new MatTableDataSource(response);
        this.setFilter();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  setFilter() {
    this.userFilter.valueChanges.subscribe(userFilterValue => {
      this.filteredValues['UserName_EN'] = userFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.proxyFilter.valueChanges.subscribe(proxyFilterValue => {
      this.filteredValues['ProxyName_EN'] = proxyFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.startDateFilter.valueChanges.subscribe(startDateFilterValue => {
      this.filteredValues['StartDate'] = startDateFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.endDateFilter.valueChanges.subscribe(endDateFilterValue => {
      this.filteredValues['EndDate'] = endDateFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.userStartDateFilter.valueChanges.subscribe(userStartDateFilterValue => {
      this.filteredValues['UserStartDate'] = userStartDateFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.userFinishDateFilter.valueChanges.subscribe(userFinishDateFilterValue => {
      this.filteredValues['UserFinishDate'] = userFinishDateFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.dataSource.filterPredicate = this.createFilter();
  }

  createFilter() {
    const filterFunction = function (data: any, filter: string): boolean {
      const searchTerms = JSON.parse(filter);
      const userSearch = () => {
        let found = false;
        searchTerms.UserName_EN.trim().toLowerCase().split(' ').forEach(word => {
          if (data.UserName_EN.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      const proxySearch = () => {
        let found = false;
        searchTerms.ProxyName_EN.trim().toLowerCase().split(' ').forEach(word => {
          if (data.ProxyName_EN.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      const startDateSearch = () => {
        let found = false;
        searchTerms.StartDate.trim().toLowerCase().split(' ').forEach(word => {
          if (data.StartDate.toLowerCase().indexOf(word) != -1) { 
            found = true; }
        });
        return found;
      };
      const endDateSearch = () => {
        let found = false;
        searchTerms.EndDate.trim().toLowerCase().split(' ').forEach(word => {
          if (data.EndDate.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      const userStartDateSearch = () => {
        let found = false;
        searchTerms.UserStartDate.trim().toLowerCase().split(' ').forEach(word => {
          if (data.UserStartDate.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      const userFinishDateSearch = () => {
        let found = false;
        searchTerms.UserFinishDate.trim().toLowerCase().split(' ').forEach(word => {
          if (data.UserFinishDate.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      return  userSearch() && proxySearch() && startDateSearch() && endDateSearch() &&
              userStartDateSearch() && userFinishDateSearch();
    };
    return filterFunction;
  }

  matHeaderToggle() {
    this.panelcontrol = !this.panelcontrol;
  }

  clearFilters() {
    this.proxyFilter.setValue('');
    this.userFilter.setValue('');
    this.startDateFilter.setValue('');
    this.endDateFilter.setValue('');
    this.userStartDateFilter.setValue('');
    this.userFinishDateFilter.setValue('');
  }

}
