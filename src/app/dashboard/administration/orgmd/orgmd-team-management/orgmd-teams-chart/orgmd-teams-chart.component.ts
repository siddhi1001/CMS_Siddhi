import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog, MatTreeNestedDataSource } from '@angular/material';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { FCTSDashBoard } from 'src/environments/environment';
import { OrgmdService } from 'src/app/dashboard/administration/services/orgmd.service';
import { OrgStructureModel } from 'src/app/dashboard/administration/models/orgmd.model';
import { OrgChartEmployeeModel } from 'src/app/dashboard/administration/administration.model';
import { ORGMDTeamChartNode, ORGMDTeamChartTeam } from 'src/app/dashboard/administration/models/orgmd-teams-classes.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-orgmd-teams-chart',
  templateUrl: './orgmd-teams-chart.component.html',
  styleUrls: ['./orgmd-teams-chart.component.scss']
})
export class OrgmdTeamsChartComponent implements OnInit {

  basehref = FCTSDashBoard.BaseHref;
  dataSource = new MatTreeNestedDataSource<any>();
  treeControl = new NestedTreeControl<any>(node => node.children);
  orgmdTeamMap = new Map<string, any[]>();
  employeeMap = new Map<string, OrgChartEmployeeModel[]>();
  orgStructure: OrgStructureModel[];
  orgStructureItems: OrgStructureModel[];
  any: any[];
  anyItems: any[];
  showEmployees = false;
  searchResult = false;
  runSpinner = false;

  @Output() openUnitDetailsOutput = new EventEmitter<any>();
  @Output() openUserDetailsOutput = new EventEmitter<any>();
  @Output() addGroupOutput = new EventEmitter<any>();
  @Output() editTeamOutput = new EventEmitter<any>();
  @Output() deleteTeamOutput = new EventEmitter<any>();
  @Output() employeesActionsOutput = new EventEmitter<any>();

  constructor(private _orgmdService: OrgmdService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog) { }

  ngOnInit() {
    this.getTeamsChartData();
  }

  openUnitDetails(node) {
    node.ParentName_EN = this.orgmdTeamMap[node.getParentID].Name_EN;
    node.ParentName_AR = this.orgmdTeamMap[node.getParentID].Name_AR;
    this.openUnitDetailsOutput.next(node);
  }

  teamAction(node, action) {
    node.ParentName_EN = this.orgmdTeamMap[node.getParentID].Name_EN;
    node.ParentName_AR = this.orgmdTeamMap[node.getParentID].Name_AR;
    this.editTeamOutput.next({ node: node, action: action });
  }

  openUserDetails(empl): void {
    const parent = this.orgmdTeamMap['team_' + empl.TID].getParentID;
    empl.ParentName_EN = this.orgmdTeamMap[parent].Name_EN;
    empl.ParentName_AR = this.orgmdTeamMap[parent].Name_AR;
    this.openUserDetailsOutput.next(empl);
  }

  deleteTeam(node): void {
    this.deleteTeamOutput.next(node);
  }

  employeesActions(node): void {
    this.employeesActionsOutput.next(node);
  }

  getTeamsChartData(): void {
    this.runSpinner = true;
    forkJoin([this._orgmdService.orgTeamsChartNodes(), this._orgmdService.orgTeamsChartTeams()])
      .subscribe(
        ([res1, res2]) => {
          for (const obj of res1) {
            const orgmdData = new ORGMDTeamChartNode(obj);
            this.buildMapStructure(orgmdData);
          }
          for (const obj of res2) {
            const orgmdData = new ORGMDTeamChartTeam(obj);
            this.buildMapStructure(orgmdData);
          }
          this.dataSource.data = this.orgmdTeamMap['-1'].children;
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

  getEmplDetail(node: ORGMDTeamChartTeam): Map<string, OrgChartEmployeeModel[]> {
    if (this.employeeMap.has(node.getCode)) {
      return this.employeeMap;
    } else {
      node.isLoading = true;
      this._orgmdService.orgTeamChartEmplDetail(node.getID).subscribe(
        emplist => {
          this.employeeMap.set(node.getCode, emplist);
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

  buildMapStructure(ECMDData): void {
    ECMDData.children = [];
    this.orgmdTeamMap[ECMDData.getCode] = ECMDData;
    const parent = ECMDData.getParentID;
    if (!this.orgmdTeamMap[parent]) {
      this.orgmdTeamMap[parent] = {
        children: []
      };
    }
    this.orgmdTeamMap[parent].children.push(ECMDData);
  }

  hasChild = (_number: number, node: OrgStructureModel) => !!node.children && node.children.length > 0;

  searchTreeValue(searchStr: string) {
    if (searchStr.length > 3) {
      const filteredData = this.filterData(this.orgmdTeamMap['-1'].children,
        function (item) {
          return (item.Name_EN.toLowerCase().indexOf(searchStr.toLowerCase()) > -1 ||
            item.Name_AR.toLowerCase().indexOf(searchStr.toLowerCase()) > -1);
        }
      );
      filteredData.length ? this.dataSource.data = filteredData : this.cancelSearch();
      this.expandOrgFolders(this.dataSource.data);
    } else if (searchStr.length === 0) {
      this.cancelSearch();
    }
  }

  filterData(data: OrgStructureModel[], predicate) {
    return !!!data ? null : data.reduce((list, entry) => {
      let clone = null;
      if (predicate(entry)) {
        clone = Object.assign({}, entry);
        if (entry.hasOwnProperty('children')) {
          let children = this.filterData(entry.children, predicate);
          if (children.length > 0) {
            clone = Object.assign({}, entry, { children: children });
            clone ? clone.expand = true : null;
          }
        }
        clone.wanted = true;
      } else if (entry.children) {
        let children = this.filterData(entry.children, predicate);
        if (children.length > 0) {
          clone = Object.assign({}, entry, { children: children });
        }
        if (clone) {
          clone.expand = true;
          clone.wanted = false;
        }
      }
      if (clone) {
        switch (clone.Type) {
          case 'node':
            list.push(new ORGMDTeamChartNode(clone));
            break;
          case 'team':
            list.push(new ORGMDTeamChartTeam(clone));
            break;
          default:
            console.log('no type match in seatch');
        }
      }
      return list;
    }, []);
  }

  expandOrgFolders(data): void {
    data.forEach(element => {

      if (element.expand) {
        this.treeControl.expand(element);
      }
      if (element.hasOwnProperty('children')) {
        this.expandOrgFolders(element.children);
      }
    });
  }

  cancelSearch() {
    this.dataSource.data = this.orgmdTeamMap['-1'].children;
  }

}
