import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatAccordion } from '@angular/material';
import { FCTSDashBoard } from 'src/environments/environment';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DepFilterData, UsersData } from '../../administration.model';
import { MatDialog } from '@angular/material';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';

@Component({
  selector: 'app-base-current-users',
  templateUrl: './base-current-users.component.html',
  styleUrls: ['./base-current-users.component.scss']
})
export class BaseCurrentUsersComponent implements OnInit {
  // main data
  basehref = FCTSDashBoard.BaseHref;
  itemName: string;
  itemID: string;
  action = '';
  possibleAction = 'assign';
  usersList: UsersData[];
  isLoading = false;
  // filter data
  filtersForm: FormGroup;
  filterState = false;
  filteredDepartments: Observable<DepFilterData[]>;
  // pagination data
  pagenumber = 1;
  itemsPerPage: number = FCTSDashBoard.DefaultPageSize;
  totalCount: number;
  // table structure
  lang: string = this.translatorService.lang.toUpperCase();
  selection: any;
  displayedColumns: string[] = ['checkBox', 'photo', 'FirstName_' + this.lang, 'LastName_' + this.lang, 'Login', 'DepartmentName_' + this.lang, 'actionButtons'];
  tableStructure = [
    { 'columnDef': 'checkBox', 'columnName': '', 'className': 'check-box' },
    { 'columnDef': 'photo', 'columnName': '', 'className': 'photo-wrapper' },
    { 'columnDef': 'FirstName_' + this.lang, 'columnName': 'name', 'className': '' },
    { 'columnDef': 'LastName_' + this.lang, 'columnName': 'surname', 'className': '' },
    { 'columnDef': 'Login', 'columnName': 'login', 'className': '' },
    { 'columnDef': 'DepartmentName_' + this.lang, 'columnName': 'department', 'className': '' },
    { 'columnDef': 'actionButtons', 'columnName': '', 'className': 'action-button-cell' }
  ];

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('searchString') searchString: ElementRef;

  constructor(
    public _administration: AdministrationService
    /*     , public formBuilder: FormBuilder */
    /* , public _errorHandlerFctsService: ErrorHandlerFctsService */
    /* , public _route: ActivatedRoute */
    /* , public dialogU: MatDialog */
    , public translator: multiLanguageTranslatorPipe
    , public translatorService: multiLanguageTranslator) { }

  ngOnInit() { }

  // get breadcrumbs and push the item
  breadcrumbsSubscription() {
    let destroyer = new Subject();
    let breadcrumbsEvent: Subscription = this._administration.currentBreadcrumbList
      .pipe(takeUntil(destroyer))
      .subscribe(breadcrumbList => {
        let breadcrumbs = breadcrumbList;
        if (breadcrumbs.length > 0) {
          breadcrumbs.push({ name: this.itemName ? this.itemName : 'Edit Users', path: '', section: '' });
          destroyer.next();
          this._administration.changebreadcrumbList(breadcrumbs);
        }
      });
  }

  getInitials(firstName: string, lastName: string) {
    return firstName.slice(0, 1).toUpperCase() + lastName.slice(0, 1).toUpperCase();
  }

  openFilter() {
    this.filterState = !this.filterState;
    this.searchString.nativeElement.value = '';
  }

  onFocus() {
    this.filterState = false;
    this.filtersForm.reset();
  }
  // Check-box functions
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.usersList.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.usersList.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  // autocomplete display func
  displayFieldValue(fieldValue: DepFilterData) {
    if (fieldValue) { return this.translator.transform(fieldValue.Name_EN, fieldValue.Name_AR); }
  }

}
