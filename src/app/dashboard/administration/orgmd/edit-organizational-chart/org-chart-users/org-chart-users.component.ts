import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PaginationParameters, DialogDirection } from '../../../administration.model';
import { MatDialog } from '@angular/material';
import { AddUsersDialogComponent } from '../../../admin-dialog-boxes/add-users-dialog/add-users-dialog.component';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { BaseCurrentUsersComponent } from '../../../base-classes/base-current-users/base-current-users.component';


@Component({
  selector: 'app-org-chart-users',
  templateUrl: './org-chart-users.component.html',
  styleUrls: ['./org-chart-users.component.scss']
})
export class OrgChartUsersComponent extends BaseCurrentUsersComponent implements OnInit {

  constructor(
    public _administration: AdministrationService
    , public formBuilder: FormBuilder
    , public _errorHandlerFctsService: ErrorHandlerFctsService
    , public _route: ActivatedRoute
    , public dialogU: MatDialog
    , public translator: multiLanguageTranslatorPipe
    , public translatorService: multiLanguageTranslator) {
    super(_administration, translator, translatorService);
  }

  ngOnInit() {
    this.itemID = this._route.snapshot.queryParamMap.get('ID');
    this.itemName = this._route.snapshot.queryParamMap.get('ItemName');

    this.breadcrumbsSubscription();

    this.filtersForm = this.formBuilder.group({
      Name: [],
      Surname: [],
      Login: [],
      Department: []
    });

    this.filteredDepartments = this.filtersForm.get('Department').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value =>
          this._administration.getDepartmentsList(value)
        )
      );

    this.getPage(this.pagenumber);
  }

  // get users func
  getPage(page: number): void {
    const perPage = this.itemsPerPage;
    const start = ((page - 1) * perPage) + 1;
    const end = (start + perPage) - 1;
    const paginationParameters: PaginationParameters = {
      'perPage': perPage,
      'startRow': start,
      'endRow': end,
      'page': page
    };
    this.getCurrentUsers(paginationParameters);
  }

  getCurrentUsers(paginationParameters: PaginationParameters): void {
    this.isLoading = true;
    this._administration.orgmdOrgUnitUsers(this.itemID, this.collectActionData(), paginationParameters)
      .subscribe(
        response => {
          this.usersList = response;
          if (this.usersList.length === 0) {
            this.totalCount = 0;
          } else if (paginationParameters.startRow === 1) {
            this.totalCount = this.usersList[0].totalRowCount;
          }
          this.selection = new SelectionModel<any>(true, []);
          this.pagenumber = paginationParameters.page;
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  usersActions(action: string, usersList: string[]): void {
    this._administration.orgmdOrgUnitUserActions(this.itemID, action, usersList)
      .subscribe(
        response => {
          this.getPage(1);
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  addUsersDialogBox(): void {
    const dialogRef = this.dialogU.open(AddUsersDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '650px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        itemName: this.itemName,
        itemID: this.itemID,
        allUsersActions: 'orgmdOrgUnitAllUsers'
      }
    }).afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.usersActions('addusers', result);
      }
    });
  }

  collectActionData(): any {
    const actionParams = {
      action: this.action,
      fullSearchStr: this.searchString.nativeElement.value,
      name: this.filtersForm.get('Name').value,
      surname: this.filtersForm.get('Surname').value,
      login: this.filtersForm.get('Login').value
    };
    if (!actionParams.fullSearchStr && !actionParams.name && !actionParams.surname && !actionParams.login) {
      actionParams.action = '';
      this.action = '';
    }
    return actionParams;
  }

  // search/filter functions
  applyMainFilter() {
    this.action = 'fullsearch';
    this.getPage(1);
  }

  filterObject() {
    this.action = 'filtersearch';
    this.getPage(1);
  }

  // delete user(s) func
  removeRecord(usersList: string[]): void {
    this.usersActions('removeusers', usersList);
  }

  removeRecords(): void {
    let usersList = new Array();
    this.selection.selected.forEach(element => {
      usersList.push(element.ID);
    });
    this.usersActions('removeusers', usersList);
  }
}
