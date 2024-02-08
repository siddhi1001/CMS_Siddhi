import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { PaginationParameters, UserRolesModel, DialogDirection } from 'src/app/dashboard/administration/administration.model';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FCTSDashBoard } from 'src/environments/environment';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { EditOrgChartRolesDialogComponent } from '../edit-org-chart-roles-dialog/edit-org-chart-roles-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/dashboard/administration/admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from 'src/app/dashboard/services/notification.service';


@Component({
  selector: 'app-edit-org-chart-roles',
  templateUrl: './edit-org-chart-roles.component.html',
  styleUrls: ['./edit-org-chart-roles.component.scss']
})
export class EditOrgChartRolesComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  itemID: string;
  possibleAction = 'Add New';
  rolesList: UserRolesModel[];
  action: string;
  // filter data
  filtersForm: FormGroup;
  filterState = false;
  // pagination data
  pagenumber = 1;
  itemsPerPage: number = FCTSDashBoard.DefaultPageSize;
  totalCount: number;
  // table structure
  lang: string = this.translatorService.lang.toUpperCase();
  runSpinner = true;

  @ViewChild('searchString') searchString: ElementRef;

  displayedColumns: string[] = ['Name_' + this.lang, 'Description_' + this.lang, 'actionButtons'];
  tableStructure = [
    { 'columnDef': 'Name_' + this.lang, 'columnName': 'name', 'className': '' },
    { 'columnDef': 'Description_' + this.lang, 'columnName': 'description', 'className': '' },
    { 'columnDef': 'actionButtons', 'columnName': '', 'className': 'och_roles_action-buttons' }
  ];

  constructor(
    private _administration: AdministrationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private notificationmessage: NotificationService,
    public _route: ActivatedRoute,
    public translator: multiLanguageTranslatorPipe,
    public translatorService: multiLanguageTranslator,
    public formBuilder: FormBuilder,
    public dialogU: MatDialog,
  ) { }

  ngOnInit() {
    this.itemID = this._route.snapshot.queryParamMap.get('ID');
    this.breadcrumbsSubscription();
    this.getPage(this.pagenumber);

    this.filtersForm = this.formBuilder.group({
      Name: [],
      Description: []
    });
  }

  breadcrumbsSubscription() {
    let destroyer = new Subject();
    let breadcrumbsEvent: Subscription = this._administration.currentBreadcrumbList
      .pipe(takeUntil(destroyer))
      .subscribe(breadcrumbList => {
        let breadcrumbs = breadcrumbList;
        if (breadcrumbs.length > 0) {
          breadcrumbs.push({ name: 'Unit Roles', path: '', section: '' });
          destroyer.next();
          this._administration.changebreadcrumbList(breadcrumbs);
        }
      });
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
    this.getOrgChartRoles(paginationParameters);
  }

  openFilter() {
    this.filterState = !this.filterState;
    this.searchString.nativeElement.value = '';
  }

  applyMainFilter() {
    this.action = this.searchString.nativeElement.value.length > 0 ? 'fullsearch' : '';
    this.getPage(1);
  }

  filterSearch() {
    this.action = 'filtersearch';
    this.getPage(1);
  }

  searchFocus() {
    this.filterState = false;
    this.filtersForm.reset();
  }

  getOrgChartRoles(paginationParameters: PaginationParameters) {
    this.runSpinner = true;
    this._administration.getOrgChartRoles(this.getSearchParameters(), this.itemID, paginationParameters).subscribe(
      response => {
        this.rolesList = response;
        if (this.rolesList.length === 0) {
          this.totalCount = 0;
        } else if (paginationParameters.startRow === 1) {
          this.totalCount = this.rolesList[0].totalRowCount;
        }
        this.pagenumber = paginationParameters.page;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  getSearchParameters(): any {
    const srchParams = {
      action: this.action,
      fullSerch: this.searchString.nativeElement.value,
      name: this.action ? this.filtersForm.get('Name').value : '',
      description: this.action ? this.filtersForm.get('Description').value : ''
    };
    return srchParams;
  }

  openRoleActionsDialog(action: string, role?: UserRolesModel): void {
    const dialogRef = this.dialogU.open(EditOrgChartRolesDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        role: role
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.runSpinner = true;
        this.orgChartRoleAction(action, result);
      }
    });
  }

  orgChartRoleAction(action: string, result?: UserRolesModel) {
    this._administration.orgChartRoleAction(action, this.itemID, result).subscribe(
      response => {
        this.getPage(1);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  removeRecord(element: UserRolesModel): void {
    this._administration.canChange('RID', element.RID, '', '', '', '', '').subscribe(
      response => {
        if (!response[0].Counter) {
          this.deleteConfimation(element);
        } else {
          this.notificationmessage.error('Item name coincidence', this.translator.transform('gbl_err_RID_Delete'), 2500);
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  deleteConfimation(element: UserRolesModel) {
    const dialogRef = this.dialogU.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        message: 'delete_confirmation'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.runSpinner = true;
        this.orgChartRoleAction('deleteRole', element);
      }
    });
  }
}
