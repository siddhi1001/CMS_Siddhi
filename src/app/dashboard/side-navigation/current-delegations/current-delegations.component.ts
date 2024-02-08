import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { SidebarInfoService } from '../sidebar-info.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { ConfirmationDialogComponent } from 'src/app/dashboard/dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { FCTSDashBoard } from '../../../../environments/environment';


@Component({
  selector: 'app-current-delegations',
  templateUrl: './current-delegations.component.html',
  styleUrls: ['./current-delegations.component.scss']
})

export class CurrentDelegationsComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  basehref: String = FCTSDashBoard.BaseHref;
  displayedColumns = ['UserName', 'ProxyName', 'StartDate', 'EndDate', 'ISActive', 'Delete'];
  dataSource;
  proxyFilter = new FormControl();
  userFilter = new FormControl();
  filteredValues = {  ProxyName_EN: '' };
  filterValues = { UserName_EN: '' };
  delegationProgbar = false;


  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public sidebarInfoService: SidebarInfoService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private appLoadConstService: AppLoadConstService,
    public dialogU: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.getDelegationInfo(this.globalConstants.general.UserID, this.data.section);
  }

  getDelegationInfo(ID: string, section: string ) {
    this.delegationProgbar = true;
    this.sidebarInfoService.getUserDelegationInfo(ID, section).subscribe(
      response => {
        this.delegationProgbar = false;
        this.dataSource = new MatTableDataSource(response);
        this.setFilter();
        this.dataSource.sort = this.sort;
        this.DateSortFix();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }


  DateSortFix() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'EndDate': return new Date(item.EndDate);
        case 'StartDate': return new Date(item.StartDate);
        default: return item[property];
      }
    };
  }

  setFilter() {
    this.userFilter.valueChanges.subscribe(userFilterValue => {
      this.filteredValues['UserName_EN'] = userFilterValue;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.proxyFilter.valueChanges.subscribe(proxyFilterValue => {
      this.filterValues['ProxyName_EN'] = proxyFilterValue;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.dataSource.filterPredicate = this.createFilter();
  }

  createFilter() {
    const filterFunction = function (data: any, filter: string): boolean {
      const searchTerms = JSON.parse(filter);
      const userSearch = () => {
        let found = false;
        searchTerms.UserName_EN.trim().toLowerCase().split(' ').forEach(word => {
          if (data.UserName_EN.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      const proxySearch = () => {
        let found = false;
        searchTerms.ProxyName_EN.trim().toLowerCase().split(' ').forEach(word => {
          if (data.ProxyName_EN.toLowerCase().indexOf(word) != -1) { found = true; }
        });
        return found;
      };
      return proxySearch() && userSearch();
    };
    return filterFunction;
  }

  deleteDelegation(ID: string) {
    this.sidebarInfoService.deleteDelegation(ID).subscribe(
      response => {
        this.ngOnInit();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  deleteConfirmation(mess: string, id: string): void {
    const dialogRef = this.dialogU.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'userConfirmation',
      maxWidth: '30vw',
      data: {
        message: mess
      }
    }).afterClosed().subscribe(
      response => {
        if (response) {
          this.deleteDelegation(id);
        }
      });
  }



}
