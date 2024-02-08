import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatAccordion, MatTableDataSource } from '@angular/material';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { DelegationService } from '../../services/delegation.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { FCTSDashBoard } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-current-delegations',
  templateUrl: './current-delegations.component.html',
  styleUrls: ['./current-delegations.component.scss'],
  providers: [DatePipe]
})
export class CurrentDelegationsComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  filtersForm: FormGroup;
  dataSource = new MatTableDataSource();
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('searchString') searchString: ElementRef;
  lang: string = this.translatorService.lang.toUpperCase();
  formDefaultState: any;
  isLoading = false;
  displayedColumns: string[] = ['UserName_' + this.lang, 'ProxyName_' + this.lang, 'StartDate', 'EndDate', 'active', 'actionButtons'];
  tableStructure = [
    { 'columnDef': 'UserName_' + this.lang, 'columnName': 'delegator_user', 'className': '' },
    { 'columnDef': 'ProxyName_' + this.lang, 'columnName': 'name', 'className': '' },
    { 'columnDef': 'StartDate', 'columnName': 'start_date', 'className': '' },
    { 'columnDef': 'EndDate', 'columnName': 'end_date', 'className': '' },
    { 'columnDef': 'active', 'columnName': 'active', 'className': '' },
    { 'columnDef': 'actionButtons', 'columnName': '', 'className': 'action-button-cell' }
  ];

  filterValues = {
    fullSearch: '',
    delegatorUser: '',
    proxyUser: '',
    startDate: '',
    endDate: '',
    active: '',
    filterState: false
  };
  fullSearch = new FormControl('');

  constructor(
    public dialogU: MatDialog,
    public formBuilder: FormBuilder,
    private _delegationService: DelegationService,
    public translator: multiLanguageTranslatorPipe,
    public translatorService: multiLanguageTranslator,
    public _errorHandlerFctsService: ErrorHandlerFctsService,
    private datePipe: DatePipe
  ) {
    this.dataSource.filterPredicate = this.createFilter(this.datePipe);
  }

  ngOnInit() {
    this.filtersForm = this.formBuilder.group({
      DelegatorUser: [],
      ProxyUser: [],
      StartDate: [],
      EndDate: [],
      Active: []
    });
    this.formDefaultState = this.filtersForm.value;
    this.getCurrentDelegations();

    this.fullSearch.valueChanges.subscribe(
      fullSearch => {
        this.filterValues.fullSearch = fullSearch;
      }
    );
    this.filtersForm.get('DelegatorUser').valueChanges.subscribe(
      delegatorUser => {
        this.filterValues.delegatorUser = delegatorUser ? delegatorUser : '';
      }
    );
    this.filtersForm.get('ProxyUser').valueChanges.subscribe(
      proxyUser => {
        this.filterValues.proxyUser = proxyUser ? proxyUser : '';
      }
    );
    this.filtersForm.get('StartDate').valueChanges.subscribe(
      startDate => {
        this.filterValues.startDate = startDate ? startDate : '';
      }
    );
    this.filtersForm.get('EndDate').valueChanges.subscribe(
      endDate => {
        this.filterValues.endDate = endDate ? endDate : '';
      }
    );
    this.filtersForm.get('Active').valueChanges.subscribe(
      active => {
        this.filterValues.active = active ? active : '';
      }
    );
  }

  createFilter(datePipe: DatePipe): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(filter);
      if (searchTerms.filterState) {
        return (data.UserName_EN.toLowerCase().indexOf(searchTerms.delegatorUser.toLowerCase()) !== -1 ||
          data.UserName_AR.toLowerCase().indexOf(searchTerms.delegatorUser.toLowerCase()) !== -1) &&
          (data.ProxyName_EN.toString().toLowerCase().indexOf(searchTerms.proxyUser.toLowerCase()) !== -1 ||
            data.ProxyName_AR.toString().toLowerCase().indexOf(searchTerms.proxyUser.toLowerCase()) !== -1) &&
          (searchTerms.startDate === '' || (new Date(data.StartDate) >= new Date(searchTerms.startDate))) &&
          (searchTerms.endDate === '' || (new Date(data.EndDate) <= new Date(searchTerms.endDate))) &&
          (searchTerms.active === '' || searchTerms.active === data.ISActive);
      } else {
        return data.UserName_EN.toLowerCase().indexOf(searchTerms.fullSearch.toLowerCase()) !== -1 ||
          data.UserName_AR.toLowerCase().indexOf(searchTerms.fullSearch.toLowerCase()) !== -1 ||
          data.ProxyName_EN.toString().toLowerCase().indexOf(searchTerms.fullSearch.toLowerCase()) !== -1 ||
          data.ProxyName_AR.toString().toLowerCase().indexOf(searchTerms.fullSearch.toLowerCase()) !== -1 ||
          datePipe.transform(data.StartDate, 'dd/MM/yyyy HH:mm').toString().toLowerCase().indexOf(searchTerms.fullSearch.toLowerCase()) !== -1 ||
          datePipe.transform(data.EndDate, 'dd/MM/yyyy HH:mm').toString().toLowerCase().indexOf(searchTerms.fullSearch.toLowerCase()) !== -1;
      }
    };
    return filterFunction;
  }

  applyMainFilter() {
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  openFilter() {
    this.filterValues.filterState = !this.filterValues.filterState;
    this.fullSearch.setValue('');
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  onFocus() {
    if (this.filterValues.filterState) {
      this.filterValues.filterState = false;
      this.filtersForm.reset(this.formDefaultState);
      this.dataSource.filter = JSON.stringify(this.filterValues);
    }
  }

  getCurrentDelegations(): void {
    this.isLoading = true;
    this._delegationService.getCurrentDelegations().subscribe(
      response => {
        this.dataSource.data = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  deleteRecordConfirmation(id: number): void {
    const dialogRef = this.dialogU.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '30vw',
      data: {
        message: 'delete_confirmation'
      }
    }).afterClosed().subscribe(
      response => {
        if (response) {
          this.deleteDelegation(id);
        }
      });
  }

  deleteDelegation(id: number) {
    this.isLoading = true;
    this._delegationService.deleteDelegation(id)
      .subscribe(
        response => {
          this.getCurrentDelegations();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          this.isLoading = false;
        }
      );
  }
}
