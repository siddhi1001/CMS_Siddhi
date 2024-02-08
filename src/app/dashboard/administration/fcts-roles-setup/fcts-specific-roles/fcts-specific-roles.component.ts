import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatDialog, MatTreeNestedDataSource } from '@angular/material';
import { NestedTreeControl } from '@angular/cdk/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogDirection } from '../../administration.model';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { Subscription } from 'rxjs';
import { SpecRolesOrgStructure, SpecRolesEmployees } from '../../administration.model';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-fcts-specific-roles',
  templateUrl: './fcts-specific-roles.component.html',
  styleUrls: ['./fcts-specific-roles.component.scss']
})
export class FctsSpecificRolesComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  roleCode: string;
  dataSource = new MatTreeNestedDataSource<SpecRolesOrgStructure>();
  orgStructure: SpecRolesOrgStructure[];
  orgStructureItems: SpecRolesOrgStructure[];
  treeControl = new NestedTreeControl<SpecRolesOrgStructure>(node => node.children);
  employeeMap = new Map<number, SpecRolesEmployees[]>();
  showEmployees = false;
  possibleAction = 'Show Employees';
  routeDataEvent: Subscription;
  runSpinner = false;

  @ViewChild('searchString') searchString: ElementRef;

  constructor(
    private _administration: AdministrationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private route: ActivatedRoute,
    private router: Router,
    private _translatorService: multiLanguageTranslator,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.routeDataEvent = this.route.data
      .subscribe(data => {
        this.roleCode = data.roleCode;
        this.getSpecificRoleUnits(this.roleCode);
      });
  }

  ngOnDestroy() {
    this.routeDataEvent.unsubscribe();
  }

  showHideEmpl(): void {
    this.showEmployees = !this.showEmployees;
    this.possibleAction = this.possibleAction === 'Show Employees' ? 'Hide Employees' : 'Show Employees';
  }

  hasChild = (_number: number, node: SpecRolesOrgStructure) => !!node.children && node.children.length > 0;

  getSpecificRoleUnits(roleCode: string): void {
    this.runSpinner = true;
    this._administration.getSpecificRoleUnits(roleCode).subscribe(
      response => {
        this.orgStructureItems = response;
        let myMap = new Map();
        for (let obj of response) {
          let orgChartData: SpecRolesOrgStructure;
          orgChartData = obj;
          orgChartData.children = [];
          myMap[orgChartData.OUID] = orgChartData;
          let parent = orgChartData.Parent || '-';
          if (!myMap[parent]) {
            myMap[parent] = {
              children: []
            };
          }
          myMap[parent].children.push(orgChartData);
        }
        this.orgStructure = myMap['-1'].children;
        this.dataSource.data = this.orgStructure;
        this.treeControl.expand(this.dataSource.data[0]);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  getEmplDetail(node: SpecRolesOrgStructure): Map<number, SpecRolesEmployees[]> {
    if (this.employeeMap.has(node.OUID)) {
      return this.employeeMap;
    } else {
      node.isLoading = true;
      this._administration.getSpecificRoleChartUsers(this.roleCode, node.OUID).subscribe(
        emplist => {
          this.employeeMap.set(node.OUID, emplist);
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          node.isLoading = false;
        }
      );
    }
  }

  applyMainFilter(): void {
    this.searchTreeValue(this.searchString.nativeElement.value);
  }

  searchTreeValue(searchStr: string) {
    if (searchStr.length > 3) {
      if (!this.showEmployees) {
        let filteredData = this.filterData(this.orgStructure,
          function (item) {
            return (item.Name_EN.toLowerCase().indexOf(searchStr.toLowerCase()) > -1 ||
              item.Name_AR.toLowerCase().indexOf(searchStr.toLowerCase()) > -1);
          },
          function (item) { return false; }
        );
        filteredData.length ? this.dataSource.data = filteredData : this.cancelSearch();
        this.expandOrgFolders(this.dataSource.data, []);
      } else {
        this.runSpinner = true;
        this._administration.searchSpecificRoleChartUsers(this.roleCode, searchStr).subscribe(
          employees => {
            this.employeeMap = new Map<number, SpecRolesEmployees[]>();
            let OUIDArrOpen = [];
            employees.forEach(element => {
              OUIDArrOpen.push(element.OUID);
              if (!this.employeeMap.has(element.OUID)) {
                this.employeeMap.set(element.OUID, employees.filter(empl => {
                  return empl.OUID === element.OUID;
                }));
              }
            });
            let filteredData = this.filterData(this.orgStructure,
              function (item) {
                return (item.Name_EN.toLowerCase().indexOf(searchStr.toLowerCase()) > -1
                  || item.Name_AR.toLowerCase().indexOf(searchStr.toLowerCase()) > -1);
              },
              function (item) {
                return OUIDArrOpen.indexOf(item.OUID) > -1;
              }
            );
            if (filteredData.length) {
              this.dataSource.data = filteredData;
              this.expandOrgFolders(this.dataSource.data, OUIDArrOpen);
            } else {
              this.cancelSearch();
            }
          },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          },
          () => {
            this.runSpinner = false;
          }
        );
      }
    } else {
      this.cancelSearch();
    }
  }

  filterData(data: SpecRolesOrgStructure[], predicate, predicateFullSearch) {
    return !!!data ? null : data.reduce((list, entry) => {
      let clone = null;
      if (predicate(entry) || predicateFullSearch(entry)) {
        clone = Object.assign({}, entry);
        let children = this.filterData(entry.children, predicate, predicateFullSearch);
        if (children.length > 0) {
          clone = Object.assign({}, entry, { children: children });
        }
        if (predicate(entry)) {
          clone.wanted = true;
        }
      } else if (entry.children != null) {
        let children = this.filterData(entry.children, predicate, predicateFullSearch);
        if (children.length > 0) {
          clone = Object.assign({}, entry, { children: children });
        }
      }
      clone ? clone.expand = true : null;
      clone && list.push(clone);
      return list;
    }, []);
  }

  expandOrgFolders(data: SpecRolesOrgStructure[], Arr): void {
    if (data.length > 0) {
      data.forEach(element => {
        let expandParent;
        element.children.forEach(child => {
          if (child.expand) {
            expandParent = true;
          }
        });
        if (expandParent || Arr.indexOf(element.OUID) > -1) {
          this.treeControl.expand(element);
        }
        this.expandOrgFolders(element.children, Arr);
      });
    }
  }

  cancelSearch() {
    this.dataSource.data = this.orgStructure;
  }

  employeesActions(node: SpecRolesOrgStructure): void {
    this.router.navigate([this.router.url + '/users'],
      {
        queryParams:
        {
          CSGroup: node.CSGroup,
          OUID: node.OUID,
          RoleCode: this.roleCode,
          ItemName: node.Name_EN
        }
      });
  }

  createGroup(nodeIDs: number[]): void {
    this._administration.specificRolesCreateGroups(nodeIDs, 'CreateSpecificRoleGroup', this.roleCode)
      .subscribe(
        response => {
          this.getSpecificRoleUnits(this.roleCode);
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  createGroupConfimation(node: SpecRolesOrgStructure): void {
    if ((this.roleCode === 'CR' || this.roleCode === 'SR' || this.roleCode === 'SRA') ||
      ((this.roleCode === 'DS' || this.roleCode === 'SGA') && node.OUTID === '3') ||
      ((this.roleCode === 'HS' || this.roleCode === 'HSS') && node.OUTID === '4')) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '100%',
        panelClass: 'dialog-box-wrapper',
        maxWidth: '520px',
        direction: DialogDirection[this._translatorService.translatorDir],
        data: {
          message: 'create_specific_role_group_confirmation'
        }
      }).afterClosed().subscribe(result => {
        if (result) {
          this.createGroup([node.OUID]);
        }
      });
    }

  }

  createAllGroups(): void {
    let groupIDs = new Array();
    this.orgStructureItems.forEach(element => {
      if (((this.roleCode === 'CR' || this.roleCode === 'SR' || this.roleCode === 'SRA') ||
        ((this.roleCode === 'DS' || this.roleCode === 'SGA') && element.OUTID === '3') ||
        ((this.roleCode === 'HS' || this.roleCode === 'HSS') && element.OUTID === '4')) &&
        (!element.CSGroup)) {
        groupIDs.push(element.OUID);
      }
    });
    if (groupIDs.length) {
      this.createGroup(groupIDs);
    }
  }

}
