import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { OrgmdChartComponent } from '../../shared-components/orgmd-chart/orgmd-chart.component';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import {
  OrgStructure, DialogDirection,
  OrgChartEmployeeModel, UserRolesModel
} from '../../administration.model';
import { UnitDefinitionModel, EntityRelationModel } from '../../models/orgmd.model';
import { EditOrgChartDialogComponent } from './edit-org-chart-dialog/edit-org-chart-dialog.component';
import { MatDialog } from '@angular/material';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { EditOrgChatUsersDialogComponent } from './edit-org-chat-users-dialog/edit-org-chat-users-dialog.component';
import { FCTSDashBoard } from 'src/environments/environment';


@Component({
  selector: 'app-edit-organizational-chart',
  templateUrl: './edit-organizational-chart.component.html',
  styleUrls: ['./edit-organizational-chart.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        overflow: 'auto',
        height: '*',
        width: '100%',
        flex: 1
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        width: '0px',
        flex: 0
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})

export class EditOrganizationalChartComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  possibleAction = 'Show Employees';
  sideInfoItem: OrgStructure;
  orgUnitsList: UnitDefinitionModel[];
  entityRelationsList: EntityRelationModel[];
  detailState = 'out';
  headerHeight: number;
  maxUnitLevel = 0;
  editUsersRoute = 'dashboard/administration/edit-org-chart/users';
  unitRolesRoute = 'dashboard/administration/edit-org-chart/unit-roles';
  sideInfoHeader: string;
  sideInfoName: string;
  userRoles: UserRolesModel[];
  sideInfoUser: OrgChartEmployeeModel;

  sideNavUnitStructure = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'short_name', 'value': 'ShortName_EN' },
    { 'name': 'short_name_ar', 'value': 'ShortName_AR' },
    { 'name': 'code', 'value': 'Code' },
    { 'name': 'parent', 'value': 'ParentName_EN' },
    { 'name': 'description', 'value': 'Description_EN' },
    { 'name': 'description_ar', 'value': 'Description_AR' },
    { 'name': 'type', 'value': 'Type_EN' },
    { 'name': 'link_type', 'value': 'LinkType_EN' }
  ];

  sideNavUserStructure = [
    { 'name': 'name', 'value': 'Login' },
    { 'name': 'code', 'value': 'Code' },
    { 'name': 'parent', 'value': 'ParentName_EN' },
    { 'name': 'first_name', 'value': 'FirstName_EN' },
    { 'name': 'first_name_ar', 'value': 'FirstName_AR' },
    { 'name': 'mid_name', 'value': 'MiddleName_EN' },
    { 'name': 'mid_name_ar', 'value': 'MiddleName_AR' },
    { 'name': 'last_name', 'value': 'LastName_EN' },
    { 'name': 'last_name_ar', 'value': 'LastName_AR' },
    { 'name': 'title', 'value': 'Title_EN' },
    { 'name': 'title_ar', 'value': 'Title_AR' },
    { 'name': 'main_role', 'value': 'RoleName_EN' },
    { 'name': 'email', 'value': 'MailAddress' },
    { 'name': 'personal_email', 'value': 'PersonalEmail' }
  ];

  @ViewChild('searchString') searchString: ElementRef;
  @ViewChild('header') header: ElementRef;
  @ViewChild(OrgmdChartComponent) _orgmdChartComponent: OrgmdChartComponent;

  constructor(
    private _administration: AdministrationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog,
    private translator: multiLanguageTranslatorPipe,
    private translatorService: multiLanguageTranslator,
    private notificationmessage: NotificationService,
    private router: Router) {

  }

  ngOnInit() {
    this.headerHeight = this.header.nativeElement.offsetHeight;
    this.getOrgUnitsList();
    this.getEntityRelation();
  }

  onResized(event: ResizedEvent) {
    this.headerHeight = event.element.nativeElement.offsetHeight;
  }

  getOrgUnitsList() {
    this._administration.orgUnitsActions().subscribe(
      response => {
        this.orgUnitsList = response;
        this.orgUnitsList.forEach(element => {
          this.maxUnitLevel = this.maxUnitLevel > element.OUTID ? this.maxUnitLevel : element.OUTID;
        });
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  getEntityRelation() {
    this._administration.entityRelationsActions().subscribe(
      response => {
        this.entityRelationsList = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  applyMainFilter() {
    this._orgmdChartComponent.searchTreeValue(this.searchString.nativeElement.value);
  }

  showHideEmployees() {
    this.possibleAction = this.possibleAction === 'Show Employees' ? 'Hide Employees' : 'Show Employees';
    this._orgmdChartComponent.showEmployees = !this._orgmdChartComponent.showEmployees;
  }

  showUnitDetails(event: OrgStructure) {
    this.sideInfoUser = null;
    this.sideInfoItem = event;
    this.sideInfoName = this.translator.transform(this.sideInfoItem.Name_EN, this.sideInfoItem.Name_AR);
    const type = this.orgUnitsList.filter(element => {
      return element.OUTID === this.sideInfoItem.OUTID;
    })[0];
    const linkType = this.entityRelationsList.filter(element => {
      return element.LTID === this.sideInfoItem.LTID;
    })[0];
    this.sideInfoItem.Type_EN = type.Name_EN;
    this.sideInfoItem.Type_AR = type.Name_AR;
    this.sideInfoItem.LinkType_EN = linkType.Name_EN;
    this.sideInfoItem.LinkType_AR = linkType.Name_AR;
    this.detailState = 'in';
  }

  showUserDetails(empl: OrgChartEmployeeModel): void {
    this.userRoles = null;
    this.sideInfoUser = null;
    this.sideInfoItem = null;
    this.sideInfoName = this.translator.transform(empl.FirstName_EN, empl.FirstName_EN) + ' ' +
      this.translator.transform(empl.LastName_EN, empl.LastName_EN);
    const parentData = this._orgmdChartComponent.orgStructureItems.filter(element => {
      return element.OUID === empl.OUID;
    })[0];
    this.detailState = 'in';
    this._administration.getUserRoles(empl.EID).subscribe(
      response => {
        this.userRoles = response;
        this.sideInfoUser = empl;
        this.sideInfoUser.ParentName_EN = parentData.Name_EN;
        this.sideInfoUser.ParentName_AR = parentData.Name_AR;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  editOrgUnit(node: OrgStructure) {
    this.editOrgUnitDialog('update', node);
  }

  addOrgUnit(node: OrgStructure) {
    this.editOrgUnitDialog('insert', node);
  }

  deleteOrgUnit(node: OrgStructure): void {
    const csvIDS = [node.OUID];
    this._administration.canChange('orgmdOrgChartDelete', '', '', '', '', '', csvIDS).subscribe(
      response => {
        if (!response[0].Counter) {
          this.deleteConfimation(node);
        } else {
          this.notificationmessage.error('Item name coincidence', this.translator.transform('gbl_err_orgmdOrgChartDelete'), 2500);
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  deleteConfimation(node: OrgStructure) {
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
        this.saveOrgUnit('delete', node);
      }
    });
  }

  employeesActions(node: OrgStructure): void {
    this.router.navigate([this.editUsersRoute],
      {
        queryParams:
        {
          ID: node.OUID,
          ItemName: node.Name_EN
        }
      });
  }

  saveOrgUnit(action: string, element: OrgStructure) {
    this._administration.saveOrgUnit(action, element).subscribe(
      response => {
        this._orgmdChartComponent.getOrgChartData();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  unitRoles(node: OrgStructure) {
    this.router.navigate([this.unitRolesRoute],
      {
        queryParams:
        {
          ID: node.OUID
        }
      });
  }

  getUserRoles(EID: number): void {
    this._administration.getUserRoles(EID).subscribe(
      response => {
        this.userRoles = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  getParentsList(empl: OrgChartEmployeeModel): number[] {
    let OUIDArr = new Array();
    let filteredData = this.filterData(this._orgmdChartComponent.orgStructure, function (item) {
      return item.OUID === empl.OUID;
    });
    do {
      OUIDArr.push(filteredData[0].OUID);
      filteredData = filteredData[0].children;
    } while (filteredData && filteredData.length);
    return OUIDArr;
  }

  filterData(data: any, predicate) {
    return !!!data ? null : data.reduce((list, entry) => {
      let clone = null;
      if (predicate(entry)) {
        entry.children = [];
        clone = Object.assign({}, entry);
      } else if (entry.children != null) {
        let children = this.filterData(entry.children, predicate);
        if (children.length > 0) {
          clone = Object.assign({}, entry, { children: children });
        }
      }
      clone && list.push(clone);
      return list;
    }, []);
  }

  editOrgUnitDialog(action: string, node: OrgStructure): void {
    const dialogRef = this.dialogU.open(EditOrgChartDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        orgUnitsList: this.orgUnitsList,
        entityRelationsList: this.entityRelationsList,
        node: node
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.saveOrgUnit(action, result);
      }
    });
  }

  editUserDialog(empl: OrgChartEmployeeModel): void {
    const dialogRef = this.dialogU.open(EditOrgChatUsersDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        employee: empl,
        employeeRoles: this.userRoles,
        parentsList: this.getParentsList(empl)
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.saveUserDetails(result);
      }
    });
  }

  saveUserDetails(userDetails): void {
    let rolesArr = new Array();
    userDetails.additionalRoles.forEach(element => {
      rolesArr.push(element.RoleDetails.RID);
    });
    if (!userDetails.Role.RID && rolesArr.length > 0) {
      userDetails.Role = { RID: rolesArr[0] };
      rolesArr = rolesArr.slice(1);
    }
    this._administration.saveUserDetails(userDetails, rolesArr).subscribe(
      response => {
        this._orgmdChartComponent.employeeMap = new Map<number, OrgChartEmployeeModel[]>();
        this._orgmdChartComponent.getOrgChartData();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
}
