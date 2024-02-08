import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import { EcmdChartComponent } from '../ecmd-chart/ecmd-chart.component';
import { FCTSDashBoard } from 'src/environments/environment';
import { DialogDirection } from '../../administration.model';
import { MatDialog } from '@angular/material';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { EditNodeDialogComponent } from '../edit-node-dialog/edit-node-dialog.component';
import { EcmdService } from 'src/app/dashboard/administration/services/ecmd.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { EditCounterpartDialogComponent } from '../edit-counterpart-dialog/edit-counterpart-dialog.component';
import { EditDepartmentDialogComponent } from '../edit-department-dialog/edit-department-dialog.component';
import { EditContactDialogComponent } from '../edit-contact-dialog/edit-contact-dialog.component';
import {
  ECDMChartNode, ECDMChartCounterpart, ECDMChartDepartment, ECDMChartContact, ItemOrgStructure, CountriesModel, StatesModel
} from '../ecmd-classes.model';

export interface SidebarStructure {
  name: string;
  value: string;
}

@Component({
  selector: 'app-ecmd-records-management',
  templateUrl: './ecmd-records-management.component.html',
  styleUrls: ['./ecmd-records-management.component.scss'],
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
export class EcmdRecordsManagementComponent implements OnInit {
  headerHeight: number;
  detailState = 'out';
  basehref = FCTSDashBoard.BaseHref;
  sideInfoItem: any;
  sideInfoName: string;
  sideInfoType: string;
  sideItemStructure: SidebarStructure[];
  countriesList: CountriesModel[];
  statesList: StatesModel[];
  lang: string = this.translatorService.lang.toUpperCase();

  @ViewChild(EcmdChartComponent) _ecmdChartComponent: EcmdChartComponent;
  @ViewChild('searchString') searchString: ElementRef;

  sideNodeStructure: SidebarStructure[] = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'short_name', 'value': 'ShortName_EN' },
    { 'name': 'short_name_ar', 'value': 'ShortName_AR' },
    { 'name': 'parent', 'value': 'parentName_' + this.lang }
  ];

  sideCtrpStructure: SidebarStructure[] = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'short_name', 'value': 'ShortName_EN' },
    { 'name': 'short_name_ar', 'value': 'ShortName_AR' },
    { 'name': 'parent', 'value': 'parentName_EN' },
    { 'name': 'vat_code', 'value': 'VatCode' },
    { 'name': 'adress', 'value': 'Address' },
    { 'name': 'adress_ar', 'value': 'Address_AR' },
    { 'name': 'city', 'value': 'City' },
    { 'name': 'city_ar', 'value': 'City_AR' },
    { 'name': 'postal', 'value': 'PostalCode' },
    { 'name': 'country', 'value': 'Country_' + this.lang },
    { 'name': 'state_province', 'value': 'State_' + this.lang },
    { 'name': 'phone', 'value': 'Phone' },
    { 'name': 'fax', 'value': 'Fax' },
    { 'name': 'email', 'value': 'Email' }
  ];

  sideDepStructure: SidebarStructure[] = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'short_name', 'value': 'ShortName_EN' },
    { 'name': 'short_name_ar', 'value': 'ShortName_AR' },
    { 'name': 'parent', 'value': 'parentName_' + this.lang }
  ];

  sideContactStructure: SidebarStructure[] = [
    { 'name': 'name', 'value': 'FirstName_EN' },
    { 'name': 'name_ar', 'value': 'FirstName_AR' },
    { 'name': 'last_name', 'value': 'LastName_EN' },
    { 'name': 'last_name_ar', 'value': 'LastName_AR' },
    { 'name': 'phone', 'value': 'Phone1' },
    { 'name': 'phone2', 'value': 'Phone2' },
    { 'name': 'fax', 'value': 'Fax' },
    { 'name': 'email', 'value': 'Email' },
    { 'name': 'parent', 'value': 'parentName_' + this.lang }
  ];

  constructor(
    public dialog: MatDialog,
    private translator: multiLanguageTranslatorPipe,
    private translatorService: multiLanguageTranslator,
    private _ecmdService: EcmdService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private notificationmessage: NotificationService) { }

  ngOnInit() {
    this.getCoutries();
    this.getStates();
  }

  onResized(event: ResizedEvent) {
    this.headerHeight = event.element.nativeElement.offsetHeight;
  }

  getCoutries() {
    this._ecmdService.getChartCoutries().subscribe(
      response => {
        this.countriesList = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      });
  }

  getStates() {
    this._ecmdService.getChartStates().subscribe(
      response => {
        this.statesList = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      });
  }

  applyMainFilter() {
    this._ecmdChartComponent.searchCounterParts(this.searchString.nativeElement.value);
  }

  showNodeDetails(node): void {
    this.sideInfoItem = node;
    this.sideInfoItem.parentName_EN = this._ecmdChartComponent.ECMDMap[node.getParentID].Name_EN;
    this.sideInfoItem.parentName_AR = this._ecmdChartComponent.ECMDMap[node.getParentID].Name_AR;
    switch (node.Type) {
      case 'node':
        this.sideItemStructure = this.sideNodeStructure;
        this.sideInfoType = 'node';
        this.sideInfoName = this.translator
          .transform(this.sideInfoItem.Name_EN, this.sideInfoItem.Name_AR);
        break;
      case 'ctrp':
        this.sideItemStructure = this.sideCtrpStructure;
        this.sideInfoType = 'counterpart';
        const location = this.getCountryStateData(node);
        this.sideInfoItem.Country_EN = location.Country_EN;
        this.sideInfoItem.Country_AR = location.Country_AR;
        this.sideInfoItem.State_EN = location.State_EN;
        this.sideInfoItem.State_AR = location.State_AR;
        this.sideInfoName = this.translator
          .transform(this.sideInfoItem.Name_EN, this.sideInfoItem.Name_AR);
        break;
      case 'dep':
        this.sideItemStructure = this.sideDepStructure;
        this.sideInfoType = 'department';
        this.sideInfoName = this.translator
          .transform(this.sideInfoItem.Name_EN, this.sideInfoItem.Name_AR);
        break;
      case 'contact':
        this.sideItemStructure = this.sideContactStructure;
        this.sideInfoType = 'contact';
        this.sideInfoName = this.translator
          .transform(this.sideInfoItem.FirstName_EN, this.sideInfoItem.FirstName_AR);
        break;
      default:
        console.log('No matches found');
    }
    this.detailState = 'in';
  }

  editNode(node) {
    switch (node.Type) {
      case 'node':
        this.editNodeDialog('updateLvl1', node);
        break;
      case 'ctrp':
        this.editCounterpartDialog('updateLvl2', node);
        break;
      case 'dep':
        this.editDepartmentDialog('updateLvl3', node, this.getOrgStructureForDep(node));
        break;
      case 'contact':
        this.editContactDialog('updateLvl4', node, this.getOrgStructureForDep(node));
        break;
      default:
    }
  }

  addNode(event) {
    switch (event.level) {
      case 'insertLvl1':
        this.editNodeDialog(event.level, event.node);
        break;
      case 'insertLvl2':
        this.editCounterpartDialog(event.level, event.node);
        break;
      case 'insertLvl3':
        this.editDepartmentDialog(event.level, event.node);
        break;
      case 'insertLvl4':
        this.editContactDialog(event.level, event.node, [event.node]);
        break;
      default:

    }
  }

  activityChange(node) {
    switch (node.Type) {
      case 'ctrp':
        this.actionNode(node, 'activateStatusLvl2', 'saveCounterpart');
        break;
      case 'dep':
        this.actionNode(node, 'activateStatusLvl3', 'saveDepartment');
        break;
      case 'contact':
        this.actionNode(node, 'activateStatusLvl4', 'saveContact');
        break;
      default:
    }
  }

  // auxiliary functions

  getCountryStateData(node: ECDMChartCounterpart) {
    const country = this.countriesList.find(element => {
      return element.CountryID === node.CountryID;
    });
    const states = this.statesList.find(element => {
      return element.SPID === node.SPID;
    });
    return {
      Country_EN: country ? country.Name_EN : '',
      Country_AR: country ? country.Name_AR : '',
      State_EN: states ? states.Name_EN : '',
      State_AR: states ? states.Name_AR : '',
    };
  }

  getOrgStructureForDep(node) {
    const parentCtrp = this.getParentCounterpart(node);
    return [{ ID: parentCtrp.getID, Type: parentCtrp.Type, Name_EN: parentCtrp.Name_EN, Name_AR: parentCtrp.Name_AR }]
      .concat(this.buildArrayFromTree(parentCtrp.children, node));
  }

  getParentCounterpart(node) {
    if (this._ecmdChartComponent.ECMDMap[node.getParentID].Type === 'ctrp') {
      return this._ecmdChartComponent.ECMDMap[node.getParentID];
    } else if (node.getID !== 1) {
      return this.getParentCounterpart(this._ecmdChartComponent.ECMDMap[node.getParentID]);
    } else {
      return {};
    }
  }

  buildArrayFromTree(mapData, node) {
    return mapData.reduce((list, entry) => {
      if (entry.getCode !== node.getCode && entry.Type === 'dep') {
        let x = [];
        if (entry.hasOwnProperty('children') && entry.children.length > 0) {
          x = this.buildArrayFromTree(entry.children, node);
        }
        list.push({ ID: entry.getID, Type: entry.Type, Name_EN: entry.Name_EN, Name_AR: entry.Name_AR });
        x.forEach(element => {
          list.push(element);
        });
      }
      return list;
    }, []);
  }

  // dialog boxes

  editNodeDialog(action: string, node: ECDMChartNode): void {
    const dialogRef = this.dialog.open(EditNodeDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        node: node
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.actionNode(result, action, 'saveNode');
      }
    });
  }

  editCounterpartDialog(action: string, node: ECDMChartCounterpart): void {
    const dialogRef = this.dialog.open(EditCounterpartDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        node: node,
        countriesList: this.countriesList,
        statesList: this.statesList
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.actionNode(result, action, 'saveCounterpart');
      }
    });
  }

  editDepartmentDialog(action: string, node: ECDMChartDepartment, orgStr?: ItemOrgStructure[]): void {
    const dialogRef = this.dialog.open(EditDepartmentDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        node: node,
        orgStr: orgStr
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.actionNode(result, action, 'saveDepartment');
      }
    });
  }

  editContactDialog(action: string, node: ECDMChartContact, orgStr?: ItemOrgStructure[]): void {
    const dialogRef = this.dialog.open(EditContactDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        node: node,
        orgStr: orgStr
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.actionNode(result, action, 'saveContact');
      }
    });
  }

  deleteNode(node): void {
    let obj;
    switch (node.Type) {
      case 'node':
        obj = {
          templateName: 'ecmdNodeDelete',
          objectID: node.NODEID,
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          csvIDS: '',
        };
        this.deleteCheck(obj, node, 'saveNode', 'deleteLvl1');
        break;
      case 'ctrp':
        this.deleteConfimation(node, 'saveCounterpart', 'deleteLvl2');
        break;
      case 'dep':
        obj = {
          templateName: 'DEPID',
          objectID: node.DEPID,
          field1: '',
          field2: '',
          field3: '',
          field4: '',
          csvIDS: '',
        };
        this.deleteCheck(obj, node, 'saveDepartment', 'deleteLvl3');
        break;
      case 'contact':
        this.deleteConfimation(node, 'saveContact', 'deleteLvl4');
        break;
      default:

    }
  }

  deleteCheck(obj, node, method: string, action: string) {
    this._ecmdService.canChange(obj)
      .subscribe(
        response => {
          if (!response[0].Counter) {
            this.deleteConfimation(node, method, action);
          } else {
            this.notificationmessage.error(
              'Children exists', this.translator.transform('gbl_err_delete_parent_item'),
              2500);
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  deleteConfimation(node: any, method: string, action: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        message: 'delete_confirmation'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.actionNode(node, action, method);
      }
    });
  }

  actionNode(node, action: string, serviceMethod: string) {
    this._ecmdService[serviceMethod](action, node).subscribe(
      response => {
        this._ecmdChartComponent.getRoot();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

}
