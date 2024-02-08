import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OrgmdService } from 'src/app/dashboard/administration/services/orgmd.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatTableDataSource, MatAccordion } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RolesData } from '../../administration.model';
import { FCTSDashBoard } from 'src/environments/environment';


@Component({
  selector: 'app-orgmd-roles',
  templateUrl: './orgmd-roles.component.html',
  styleUrls: ['./orgmd-roles.component.scss']

})
export class OrgmdRolesComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  rolesList: RolesData[];
  filtersForm: FormGroup;
  filterState = false;
  // table structure
  dataSource: any;
  displayedColumns: string[] = ['name', 'description'];
  possibleAction = 'add_role';
  editUsersRoute = 'dashboard/administration/orgmd-roles/role-users';

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('searchString') searchString: ElementRef;

  constructor(
    private _orgmdService: OrgmdService
    , private formBuilder: FormBuilder
    , private _errorHandlerFctsService: ErrorHandlerFctsService
    , private router: Router) { }

  ngOnInit() {
    this.getOrgmdRoles();

    this.filtersForm = this.formBuilder.group({
      Role: [],
      Description: []
    });
  }

  getOrgmdRoles(): void {
    this._orgmdService.getOrgmdRoles().subscribe(
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
  applyMainFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    let filteredRolesList = this.rolesList.filter(element => {
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
  editRoleUsers(role: RolesData) {
    this.router.navigate([this.editUsersRoute],
      {
        queryParams:
        {
          ID: role.ID,
          GRID: role.Grid,
          ItemName: role.Name_EN.replace(/\s/g, '')
        }
      });
  }
}
