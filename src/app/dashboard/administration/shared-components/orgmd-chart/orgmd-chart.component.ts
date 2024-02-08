import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatTreeNestedDataSource } from '@angular/material';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { OrgStructure, OrgChartEmployeeModel } from '../../administration.model';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-orgmd-chart',
  templateUrl: './orgmd-chart.component.html',
  styleUrls: ['./orgmd-chart.component.scss']
})
export class OrgmdChartComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  dataSource = new MatTreeNestedDataSource<OrgStructure>();
  treeControl = new NestedTreeControl<OrgStructure>(node => node.children);
  employeeMap = new Map<number, OrgChartEmployeeModel[]>();
  orgStructure: OrgStructure[];
  orgStructureItems: OrgStructure[];
  showEmployees = false;
  searchResult = false;
  runSpinner = false;

  @Input() maxUnitLevel: number;
  @Output() openUnitDetailsOutput = new EventEmitter<OrgStructure>();
  @Output() editOrgUnitOutput = new EventEmitter<OrgStructure>();
  @Output() addOrgUnitOutput = new EventEmitter<OrgStructure>();
  @Output() deleteOrgUnitOutput = new EventEmitter<OrgStructure>();
  @Output() employeesOutput = new EventEmitter<OrgStructure>();
  @Output() openUserDetailsOutput = new EventEmitter<OrgChartEmployeeModel>();
  @Output() rolesOutput = new EventEmitter<OrgStructure>();


  constructor(
    private _administration: AdministrationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog,
  ) { }

  ngOnInit() {
    this.getOrgChartData();
  }

  openUnitDetails(node: OrgStructure) {
    if (node.Parent !== -1) {
      const parentObj = this.orgStructureItems.filter(element => {
        return element.OUID === node.Parent;
      })[0];
      node.ParentName_EN = parentObj.Name_EN;
      node.ParentName_AR = parentObj.Name_AR;
    }
    this.openUnitDetailsOutput.next(node);
  }

  openUserDetails(empList: OrgChartEmployeeModel): void {
    this.openUserDetailsOutput.next(empList);
  }

  editOrgUnit(node: OrgStructure): void {
    const parentObj = this.orgStructureItems.filter(element => {
      return element.OUID === node.Parent;
    })[0];
    node.ParentName_EN = parentObj.Name_EN;
    node.ParentName_AR = parentObj.Name_AR;
    this.editOrgUnitOutput.next(node);
  }

  addOrgUnit(node: OrgStructure): void {
    this.addOrgUnitOutput.next(node);
  }

  deleteOrgUnit(node: OrgStructure): void {
    this.deleteOrgUnitOutput.next(node);
  }

  employeesActions(node: OrgStructure): void {
    this.employeesOutput.next(node);
  }

  unitRoles(node: OrgStructure): void {
    this.rolesOutput.next(node);
  }

  hasChild = (_number: number, node: OrgStructure) => !!node.children && node.children.length > 0;

  getOrgChartData(): void {
    this.runSpinner = true;
    this._administration.orgChartData().subscribe(
      response => {
        this.orgStructureItems = response;
        let myMap = new Map();
        for (let obj of response) {
          let orgChartData: OrgStructure;
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

  getEmplDetail(node: OrgStructure): Map<number, OrgChartEmployeeModel[]> {
    if (this.employeeMap.has(node.OUID)) {
      return this.employeeMap;
    } else {
      node.isLoading = true;
      this._administration.orgChartEmplDetail(node.OUID).subscribe(
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
        this._administration.orgChartSearch(searchStr).subscribe(
          employees => {

            this.employeeMap = new Map<number, OrgChartEmployeeModel[]>();
            let OUIDArrOpen = [];
            let OUIDArr = [];
            if (employees.length) {
              employees.forEach(element => {
                OUIDArrOpen.push(element.OUID);
                if (element.EID !== 0) {
                  OUIDArr.push(element.OUID);
                }
                if (!this.employeeMap.has(element.OUID)) {
                  this.employeeMap.set(element.OUID, employees.filter(empl => {
                    return empl.OUID === element.OUID && empl.EID !== 0;
                  }));
                }
              });
              let filteredData = this.filterData(this.orgStructure,
                function (item) {
                  return (item.Name_EN.toLowerCase().indexOf(searchStr.toLowerCase()) > -1
                    || item.Name_AR.toLowerCase().indexOf(searchStr.toLowerCase()) > -1);
                },
                function (item) {
                  return OUIDArr.indexOf(item.OUID) > -1;
                }
              );
              this.dataSource.data = filteredData;
              this.expandOrgFolders(this.dataSource.data, OUIDArrOpen);
              this.searchResult = true;
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

  filterData(data: OrgStructure[], predicate, predicateFullSearch) {
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

  expandOrgFolders(data: OrgStructure[], Arr): void {
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
    this.searchResult = false;
  }

}

