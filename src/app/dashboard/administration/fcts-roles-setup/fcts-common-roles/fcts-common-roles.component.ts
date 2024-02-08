import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatTableDataSource, MatAccordion } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonRoleModel } from '../../administration.model';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-fcts-common-roles',
  templateUrl: './fcts-common-roles.component.html',
  styleUrls: ['./fcts-common-roles.component.scss']
})
export class FctsCommonRolesComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  rolesList: CommonRoleModel[];
  filtersForm: FormGroup;
  filterState = false;
  // table structure
  dataSource: any;
  displayedColumns: string[] = ['name', 'description'];

  @ViewChild('searchString') searchString: ElementRef;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    private _administration: AdministrationService
    , private formBuilder: FormBuilder
    , private _errorHandlerFctsService: ErrorHandlerFctsService
    , private router: Router
  ) { }

  ngOnInit() {
    this.filtersForm = this.formBuilder.group({
      Role: [],
      Description: []
    });

    this.getCommonRoles();
  }

  getCommonRoles(): void {
    this._administration.getCommonRoles().subscribe(
      response => {
        this.rolesList = response;
        this.dataSource = new MatTableDataSource(this.rolesList);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  // actions with search and filter
  applyMainFilter() {
    this.dataSource.filter = this.searchString.nativeElement.value.trim().toLowerCase();
  }

  openFilter() {
    this.filterState = !this.filterState;
    this.searchString.nativeElement.value = '';
    this.dataSource.filter = '';
  }

  onFocus() {
    this.filterState = false;
    this.filtersForm.reset();
    this.dataSource = new MatTableDataSource(this.rolesList);
  }

  filterObject(): void {
    const searchValue = this.filtersForm.value;
    const filteredRolesList = this.rolesList.filter(element => {
      let contain = false;
      const role = searchValue.Role ? searchValue.Role.toLowerCase() : '';
      const desc = searchValue.Description ? searchValue.Description.toLowerCase() : '';
      if ((element.Name_EN.toLowerCase().indexOf(role) > -1 || element.Name_AR.toLowerCase().indexOf(role) > -1) &&
        (element.Description_EN.toLowerCase().indexOf(desc) > -1 || element.Description_AR.toLowerCase().indexOf(desc) > -1)) {
        contain = true;
      }
      return contain;
    });
    this.dataSource = new MatTableDataSource(filteredRolesList);
  }

  // move to edit-users component
  employeesActions(role: CommonRoleModel) {
    this.router.navigate([this.router.url + '/users'],
      {
        queryParams:
        {
          CSGroup: role.GRID,
          ItemName: role.Name_EN
        }
      });
  }

}
