import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrganizationalChartService } from 'src/app/dashboard/services/organizationalChart.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatCheckboxChange } from '@angular/material';
import { MatDialog } from '@angular/material';
import { DistributionDialogComponent } from 'src/app/dashboard/dialog-boxes/distribution-dialog/distribution-dialog.component';
import { CorrespondenenceDetailsModel } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { DistributionChatrData, DistributionChartEmployeeModel } from 'src/app/dashboard/models/distribution.model';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-distribution-chart',
  templateUrl: './distribution-chart.component.html',
  styleUrls: ['./distribution-chart.component.scss']
})
export class DistributionChartComponent implements OnInit {
  @Input() correspondenceData: CorrespondenenceDetailsModel;
  @Output() distributionOutputAction = new EventEmitter<any>();
  distributionChartData: DistributionChatrData[];
  treeControl = new NestedTreeControl<DistributionChatrData>(node => node.children);
  dataSource = new MatTreeNestedDataSource<DistributionChatrData>();
  basehref: String = FCTSDashBoard.BaseHref;

  employeeMap = new Map<string, DistributionChartEmployeeModel[]>();
  showempDetails = false;
  showEmployees = false;
  multiSelect = true;
  codeType = '2';
  currentlyChecked: DistributionChatrData;

  constructor(
    private organizationalChartService: OrganizationalChartService,
    private errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog,
  ) { }

  ngOnInit() {
    this.getDistributionChart();
  }

  distOutputAction() {
    this.distributionOutputAction.next();
  }


  getDistributionChart(): void {
    this.organizationalChartService.getDistChart()
      .subscribe(
        response => {
          let myMap = new Map();
          for (let obj of response) {
            let distChartData: DistributionChatrData;
            distChartData = obj;
            distChartData.children = [];
            myMap[distChartData.OUID] = distChartData;
            let parent = distChartData.Parent || '-';
            if (!myMap[parent]) {
              myMap[parent] = {
                children: []
              };
            }
            myMap[parent].children.push(distChartData);
          }
          this.distributionChartData = myMap['-1'].children;
          this.dataSource.data = this.distributionChartData;
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  hasChild = (_number: string, node: DistributionChatrData) => !!node.children && node.children.length > 0;

  getEmplDetail(distributionChartData: DistributionChatrData): Map<string, DistributionChartEmployeeModel[]> {
    if (distributionChartData.OUTID === this.codeType) {
      this.showempDetails = false;
      if (this.employeeMap.has(distributionChartData.OUID)) {
        this.showempDetails = true;
        return this.employeeMap;
      }
      else {
        this.organizationalChartService.getDistributionEmployeeList(distributionChartData.OUID).subscribe(
          response => {
            this.employeeMap.set(distributionChartData.OUID, response);
            this.showempDetails = true;
          },
          responseError => {
            this.errorHandlerFctsService.handleError(responseError).subscribe();
          });
      }
    }
  }

  searchTreeValue(chartSearch: string): void {
    if (chartSearch !== '') {
      if (!this.showEmployees) {
        let filteredData = this.filterData(this.distributionChartData, function (item) {
          return (item.Name.toLowerCase().indexOf(chartSearch.toLowerCase()) > -1 || item.Name_AR.toLowerCase().indexOf(chartSearch.toLowerCase()) > -1);
        });
        filteredData.length ? this.dataSource.data = filteredData : this.cancelSearch();
        this.expandOrgFolders(this.dataSource.data, []);
      } else {
        this.organizationalChartService.fullSearchDistribution(chartSearch).subscribe(
          employees => {
            this.employeeMap = new Map<string, DistributionChartEmployeeModel[]>();
            let OUIDArr = [];

            employees.forEach(element => {
              element.wanted = true;
              if (OUIDArr.indexOf(element.OUID) === -1) {
                OUIDArr.push(element.OUID);
              }
            });

            let filteredData = this.filterData(this.distributionChartData, function (item) {
              return (item.Name.toLowerCase().indexOf(chartSearch.toLowerCase()) > -1
                || item.Name_AR.toLowerCase().indexOf(chartSearch.toLowerCase()) > -1
                || OUIDArr.indexOf(item.OUID) > -1);
            });
            filteredData.length ? this.dataSource.data = filteredData : this.cancelSearch();
            OUIDArr.forEach(OUID => {
              this.employeeMap.set(OUID, employees.filter(empl => {
                return empl.OUID === OUID;
              })
              );
            });
            this.expandOrgFolders(this.dataSource.data, OUIDArr);
          },
          responseError => {
            this.errorHandlerFctsService.handleError(responseError).subscribe();
          },
          () => {
            this.showempDetails = true;
          }
        );
      }
    } else {
      this.cancelSearch();
    }
  }

  filterData(data: DistributionChatrData[], predicate) {
    return !!!data ? null : data.reduce((list, entry) => {
      let clone = null;
      if (predicate(entry)) {
        clone = Object.assign({}, entry);
        clone.wanted = true;
      } else if (entry.children != null) {
        let children = this.filterData(entry.children, predicate);
        if (children.length > 0) {
          clone = Object.assign({}, entry, { children: children });
        }
      }
      clone ? clone.expand = true : null
      clone && list.push(clone);
      return list;
    }, []);
  }

  expandOrgFolders(data: DistributionChatrData[], Arr): void {
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
    this.dataSource.data = this.distributionChartData;
  }

  selectSinglCheckbox(selectedData: DistributionChatrData, e: MatCheckboxChange) {
    this.currentlyChecked = selectedData;
  }

  openDistributionDialog(): void {
    const dialogRef = this.dialogU.open(DistributionDialogComponent, {
      width: '100%',
      panelClass: 'distribution-dialog',
      maxWidth: '85vw',
      data: {
        DCID: this.currentlyChecked.OUID,
        correspondenceData: this.correspondenceData
      }
    }).afterClosed().subscribe(result => {
      if (result === 'distributed') {
        this.distOutputAction();
      }
    });
  }

}
