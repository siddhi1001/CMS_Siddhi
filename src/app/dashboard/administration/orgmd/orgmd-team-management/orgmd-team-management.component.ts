import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import { MatDialog } from '@angular/material';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { Router } from '@angular/router';
import { FCTSDashBoard } from 'src/environments/environment';
import { OrgmdTeamsChartComponent } from '../orgmd-team-management/orgmd-teams-chart/orgmd-teams-chart.component';
import { UserRolesModel, DialogDirection, OrgChartEmployeeModel } from '../../administration.model';
import { ORGMDTeamProjects } from 'src/app/dashboard/administration/models/orgmd.model';
import { OrgmdAddTeamDialogComponent } from './orgmd-add-team-dialog/orgmd-add-team-dialog.component';
import { OrgmdService } from 'src/app/dashboard/administration/services/orgmd.service';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-orgmd-team-management',
  templateUrl: './orgmd-team-management.component.html',
  styleUrls: ['./orgmd-team-management.component.scss'],
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
export class OrgmdTeamManagementComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  headerHeight: number;
  detailState = 'out';
  sideInfoItem: any;
  sideNavItemStructure: any;
  userRoles: UserRolesModel[];
  sideInfoName: string;
  sideInfoHeader: string;
  projectsList: ORGMDTeamProjects[];

  @ViewChild('searchString') searchString: ElementRef;
  @ViewChild('header') header: ElementRef;
  @ViewChild(OrgmdTeamsChartComponent) _orgmdTeamsChartComponent: OrgmdTeamsChartComponent;

  sideNavUnitStructure = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'parent', 'value': 'ParentName_EN' },
    { 'name': 'short_name', 'value': 'ShortName_EN' },
    { 'name': 'short_name_ar', 'value': 'ShortName_AR' },
    { 'name': 'code', 'value': 'Code' },
    { 'name': 'description', 'value': 'Description_EN' },
    { 'name': 'description_ar', 'value': 'Description_AR' }
  ];

  sideNavTeamStructure = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'parent', 'value': 'ParentName_EN' },
    { 'name': 'short_name', 'value': 'ShortName_EN' },
    { 'name': 'short_name_ar', 'value': 'ShortName_AR' },
    { 'name': 'project', 'value': 'ProjectName' },
    { 'name': 'email', 'value': 'Email' },
    { 'name': 'team_description', 'value': 'Description_EN' },
    { 'name': 'team_description_ar', 'value': 'Description_AR' },
    { 'name': 'team_purpose_short', 'value': 'TeamPurposeShort_EN' },
    { 'name': 'team_purpose_short_ar', 'value': 'TeamPurposeShort_AR' },
    { 'name': 'team_purpose', 'value': 'TeamPurpose_EN' },
    { 'name': 'team_purpose_ar', 'value': 'TeamPurpose_AR' }
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

  constructor(
    private _administration: AdministrationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private _orgmdService: OrgmdService,
    private translator: multiLanguageTranslatorPipe,
    private translatorService: multiLanguageTranslator,
    private notificationmessage: NotificationService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.headerHeight = this.header.nativeElement.offsetHeight;
    this.getProgects();
  }

  getProgects(): void {
    this._orgmdService.getTeamProgects().subscribe(
      response => {
        this.projectsList = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  applyMainFilter() {
    this._orgmdTeamsChartComponent.searchTreeValue(this.searchString.nativeElement.value);
  }

  onResized(event: ResizedEvent) {
    this.headerHeight = event.element.nativeElement.offsetHeight;
  }

  openUnitDetails(node) {
    this.sideInfoItem = node;
    this.sideInfoName = this.translator.transform(this.sideInfoItem.Name_EN, this.sideInfoItem.Name_AR);
    switch (node.Type) {
      case 'node':
        this.sideNavItemStructure = this.sideNavUnitStructure;
        this.detailState = 'in';
        this.sideInfoHeader = 'org_unit';
        break;
      case 'team':
        const project = this.projectsList.find(element => {
          return element.ID = node.ProjectID;
        });
        this.sideInfoItem.ProjectName = project ? project.Name : '';
        this.sideNavItemStructure = this.sideNavTeamStructure;
        this.detailState = 'in';
        this.sideInfoHeader = 'team';
        break;
      default:
        console.log('No match in switch condition.');
    }
  }

  openUserDetails(node: OrgChartEmployeeModel) {
    this.sideInfoItem = null;
    this._orgmdService.getUserRoles(node.EID).subscribe(
      response => {
        this.userRoles = response;
        this.sideInfoItem = node;
        this.sideNavItemStructure = this.sideNavUserStructure;
        this.sideInfoName = this.translator.transform(node.FirstName_EN, node.FirstName_EN) + ' ' +
          this.translator.transform(node.LastName_EN, node.LastName_EN);
        this.sideInfoHeader = 'employee';
        this.detailState = 'in';
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  teamAction(event) {
    const dialogRef = this.dialog.open(OrgmdAddTeamDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '600px',
      maxHeight: '90vh',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        node: event.node,
        action: event.action,
        projectsList: this.projectsList
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.detailState = 'out';
        this.saveTeamDetails(result.teamData, event.action, result.groupKuafID);
      }
    });
  }

  saveTeamDetails(teamDetail, action: string, kuafID: number = null) {
    this._orgmdService.saveTeamDetails(teamDetail, action, kuafID).subscribe(
      response => {
        this._orgmdTeamsChartComponent.orgmdTeamMap = new Map<string, any[]>();
        this._orgmdTeamsChartComponent.getTeamsChartData();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  deleteTeam(node): void {
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
        this.deleteGroup(node, 'deleteLvl1');
      }
    });
  }

  deleteGroup(node, action): void {
    this._orgmdService.orgmdDeleteGroup(node.TID)
      .subscribe(
        response => {
          this.saveTeamDetails(node, action);
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  employeesActions(node): void {
    this.router.navigate([this.router.url + '/users'],
      {
        queryParams:
        {
          ID: node.KuafID,
          ItemName: node.Name_EN
        }
      });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
}
