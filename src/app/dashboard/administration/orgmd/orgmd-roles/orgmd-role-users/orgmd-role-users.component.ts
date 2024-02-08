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
import { OrgmdService } from 'src/app/dashboard/administration/services/orgmd.service';

@Component({
  selector: 'app-orgmd-role-users',
  templateUrl: './orgmd-role-users.component.html',
  styleUrls: ['./orgmd-role-users.component.scss']
})
export class OrgmdRoleUsersComponent extends BaseCurrentUsersComponent implements OnInit {
  grid: string;

  constructor(
    public _administration: AdministrationService
    , public formBuilder: FormBuilder
    , public _errorHandlerFctsService: ErrorHandlerFctsService
    , public _route: ActivatedRoute
    , public dialogU: MatDialog
    , public translator: multiLanguageTranslatorPipe
    , public translatorService: multiLanguageTranslator
    , private _orgmdService: OrgmdService) {
    super(_administration, translator, translatorService);
  }

  ngOnInit() {
    this.itemID = this._route.snapshot.queryParamMap.get('ID');
    this.grid = this._route.snapshot.queryParamMap.get('GRID');
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
    this.currentUsers(paginationParameters);
  }

  currentUsers(paginationParameters: PaginationParameters): void {
    this.isLoading = true;
    this._orgmdService.orgmdRoleUsers(this.grid, this.collectActionData(), paginationParameters)
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
    this._orgmdService.orgmdRoleUsersActions(this.itemID, this.grid, action, usersList)
      .subscribe(
        response => {
          this.getPage(1);
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  collectActionData(): any {
    let actionParams = {
      action: this.action,
      fullSearchStr: this.searchString.nativeElement.value,
      name: this.filtersForm.get('Name').value,
      surname: this.filtersForm.get('Surname').value,
      login: this.filtersForm.get('Login').value,
      department: this.filtersForm.get('Department').value ? this.filtersForm.get('Department').value.OUID : ''
    };
    if (!actionParams.fullSearchStr && !actionParams.name && !actionParams.surname && !actionParams.login && !actionParams.department) {
      actionParams.action = '';
      this.action = '';
    }
    return actionParams;
  }

  addUsersDialogBox(): void {
    const dialogRef = this.dialogU.open(AddUsersDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '650px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        itemName: this.itemName,
        itemID: this.grid,
        allUsersActions: 'orgmdRoleAllUsers'
      }
    }).afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.usersActions('addusers', result);
      }
    });
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
    this.action = 'removeusers';
    this.usersActions('removeusers', usersList);
  }

  removeRecords(): void {
    this.action = 'removeusers';
    let usersList = new Array();
    this.selection.selected.forEach(element => {
      usersList.push(element.ID);
    });
    this.usersActions('removeusers', usersList);
  }
}
