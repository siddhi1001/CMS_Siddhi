import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material';
import { forkJoin } from 'rxjs';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { FCTSDashBoard } from 'src/environments/environment';
import {
  ECDMChartNode, ECDMChartCounterpart, ECDMChartDepartment, ECDMChartContact, ECDMChartPagination
} from '../ecmd-classes.model';
import { EcmdService } from 'src/app/dashboard/administration/services/ecmd.service';

@Component({
  selector: 'app-ecmd-chart',
  templateUrl: './ecmd-chart.component.html',
  styleUrls: ['./ecmd-chart.component.scss']
})
export class EcmdChartComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  ECMDMap: Map<string, any> = new Map();
  dataSourceECMD = new MatTreeNestedDataSource<any>();
  treeControlECMD = new NestedTreeControl<any>(node => node.children);
  runSpinner: boolean;
  loadStep = FCTSDashBoard.ChartPagination;

  @ViewChild('treeSelector') tree: any;
  @Output() openNodeDetailsOutput = new EventEmitter<any>();
  @Output() editNodeOutput = new EventEmitter<any>();
  @Output() deleteNodeOutput = new EventEmitter<any>();
  @Output() addNodeOutput = new EventEmitter<any>();
  @Output() activityChangeOutput = new EventEmitter<any>();


  constructor(
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private _ecmdService: EcmdService
  ) { }

  ngOnInit() {
    this.getRoot();
  }

  openNodeDetails(node) {
    if (node.Type !== 'pagination') {
      this.openNodeDetailsOutput.next(node);
    }
  }

  editNode(node) {
    this.editNodeOutput.next(node);
  }

  deleteNode(node) {
    this.deleteNodeOutput.next(node);
  }

  addNode(node: any, level: string) {
    this.addNodeOutput.next({ node, level });
  }

  activityChange(node) {
    this.activityChangeOutput.next(node);
  }

  openTreeAction(node): void {
    switch (node.Type) {
      case 'node':
        node.CounterParts > this.loadStep ? this.getECMDChartBigNode(node) : this.getECMDChartNodes(node);
        break;
      case 'ctrp':
        this.getECMDChartDepartments(node);
        break;
      case 'pagination':
        this.getECMDChartCounterpars(node);
        this.clearPagination(node);
        break;
      default:
      // this.deleteChildren(node);
    }
  }

  getRoot(): void {
    this.runSpinner = true;
    this.ECMDMap = new Map();
    this._ecmdService.getECMDNode().subscribe(
      response => {
        for (const obj of response) {
          const ECMDData = new ECDMChartNode(obj);
          this.buildMapStructure(ECMDData);
        }
        this.updateTreeData();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  getECMDChartNodes(node: ECDMChartNode): void {
    node.isLoading = true;
    forkJoin([this._ecmdService.getECMDNode(node.getID), this._ecmdService.getECMDCounterpart(node.getID)])
      .subscribe(
        ([res1, res2]) => {
          if (res1.length > 0 || res2.length > 0) {
            for (const obj of res1) {
              const ECMDData = new ECDMChartNode(obj);
              this.buildMapStructure(ECMDData);
            }
            for (const obj of res2) {
              const ECMDData = new ECDMChartCounterpart(obj);
              this.buildMapStructure(ECMDData);
            }
          } else {
            this.deleteChildren(node.getCode);
          }
          this.updateTreeData();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          node.isLoading = false;
        }
      );
  }

  getECMDChartBigNode(node: ECDMChartNode): void {
    node.isLoading = true;
    this.buildPaginationFolders(node);
    this._ecmdService.getECMDNode(node.getID)
      .subscribe(
        response => {
          if (response.length > 0) {
            for (const obj of response) {
              const ECMDData = new ECDMChartNode(obj);
              this.buildMapStructure(ECMDData);
            }
          } else {
            this.deleteChildren(node.getCode);
          }
          this.updateTreeData();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          node.isLoading = false;
        }
      );
  }

  getECMDChartCounterpars(node: ECDMChartPagination) {
    node.isLoading = true;
    this._ecmdService.getECMDCounterpart(node.getID, node.startRow, node.endRow)
      .subscribe(
        response => {
          if (response.length > 0) {
            for (const obj of response) {
              const ECMDData = new ECDMChartCounterpart(obj);
              this.buildMapStructure(ECMDData, node.getCode);
            }
          } else {
            this.deleteChildren(node.getCode);
          }
          this.updateTreeData();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          node.isLoading = false;
        }
      );
  }

  getECMDChartDepartments(node: ECDMChartCounterpart): void {
    node.isLoading = true;
    forkJoin([this._ecmdService.getECMDChartDepartments(node.CPID), this._ecmdService.getECMDChartContacts(node.CPID)])
      .subscribe(
        ([res1, res2]) => {
          if (res1.length > 0 || res2.length > 0) {
            let array = [];
            for (const obj of res1) {
              const ECMDData = new ECDMChartDepartment(obj);
              array.push(ECMDData.getCode);
              this.buildMapStructure(ECMDData);
            }
            for (const obj of res2) {
              const ECMDData = new ECDMChartContact(obj);
              array.push(ECMDData.getCode);
              this.buildMapStructure(ECMDData);
            }
            array.forEach(element => {
              this.deleteChildren(element);
            });
          } else {
            this.deleteChildren(node.getCode);
          }
          this.updateTreeData();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          node.isLoading = false;
        }
      );
  }

  searchCounterParts(value: string) {
    if (value.length >= 3) {
      this.runSpinner = true;
      forkJoin(
        [this._ecmdService.ECMDSearchNodes('searchParentNODES', value),
        this._ecmdService.ECMDSearchCounterparts('searchCounterpart', value)]
      )
        .subscribe(
          ([res1, res2]) => {
            if (res1.length > 0 || res2.length > 0) {
              this.ECMDMap = new Map();
              for (const obj of res1) {
                const ECMDData = new ECDMChartNode(obj);
                this.buildMapStructure(ECMDData);
              }
              for (const obj of res2) {
                const ECMDData = new ECDMChartCounterpart(obj);
                this.buildMapStructure(ECMDData);
              }
            }
            this.updateTreeData();
            this.expandFolders(this.dataSourceECMD.data);
          },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          },
          () => {
            this.runSpinner = false;
          });
    } else if (value.length === 0) {
      this.getRoot();
    }
  }

  buildPaginationFolders(node: ECDMChartNode) {
    const folderNum = Math.ceil(node.CounterParts / this.loadStep);
    let startRow = 1;
    for (let i = 0; i < folderNum; i++) {
      const ECMData = new ECDMChartPagination(node, startRow, (i + 1) === folderNum ? node.CounterParts % this.loadStep : this.loadStep);
      this.buildMapStructure(ECMData);
      startRow = startRow + this.loadStep;
    }
  }

  clearPagination(node: ECDMChartPagination) {
    this.ECMDMap[node.getParentID].children.forEach(element => {
      if (node !== element) {
        this.treeControlECMD.collapse(element);
        element.children = [];
      }
    });
  }

  buildMapStructure(ECMDData, parentMapID: string = null): void {
    ECMDData.children = [];
    this.ECMDMap[ECMDData.getCode] = ECMDData;
    const parent = parentMapID ? parentMapID : ECMDData.getParentID;
    if (!this.ECMDMap[parent]) {
      this.ECMDMap[parent] = {
        children: []
      };
    }
    this.ECMDMap[parent].children.push(ECMDData);
  }

  deleteChildren(code: string): void {
    if (this.ECMDMap[code].hasOwnProperty('children') && this.ECMDMap[code].children.length === 0) {
      delete this.ECMDMap[code].children;
    }
  }

  updateTreeData() {
    this.dataSourceECMD.data = null;
    this.dataSourceECMD.data = this.ECMDMap['-1'].children;
  }

  ECMDhasChild = (_number: number, node: ECDMChartNode | ECDMChartCounterpart | ECDMChartDepartment | ECDMChartContact) => !!node.children && node.children.length > 0;

  expandFolders(data: any): void {
    if (data.length > 0) {
      data.forEach(element => {
        if (element.hasOwnProperty('children')) {
          this.expandFolders(element.children);
        }
        if (element.Type === 'node') {
          this.treeControlECMD.expand(element);
        }
      });
    }
  }
}


