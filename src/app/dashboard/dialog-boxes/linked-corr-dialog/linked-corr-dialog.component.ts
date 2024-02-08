import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { FCTSDashBoard } from '../../../../environments/environment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { FilesSelectComponent } from 'src/app/dashboard/shared-components/files-select/files-select.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { multiLanguageTranslator,multiLanguageTranslatorPipe } from 'src/assets/translator/index';


export interface ConnectedCorrespondencesData {
  CorrespondenceIcon: IconType[];
  SeeContents: boolean;
  ID: string;
  DataID: string;
  CreationDate: string;
  name: string;
  VolumeID: string;
  CorrespondenceCode: string;
  CorrespondenceDate: string;
  ArabicSubject: string;
  EnglishSubject: string;
  CorrFlowType: string;
  Confidential: string;
  CoverID: string;
  RecipientDepartment: string;
  RecipientDepartmentNameEN: string;
  RecipientDepartmentNameAR: string;
  SenderDepartment: string;
  SenderDepartmentNameEN: string;
  SenderDepartmentNameAR: string;
  ExternalOrganization: string;
  ExternalOrganizationNameEN: string;
  ExternalOrganizationNameAR: string;
  DispatchDate: string;
  BaseType_EN: string;
  BaseType_AR: string;
  CorrespondenceType_EN: string;
  CorrespondenceType_AR: string;
  DocumentNumber: string;
  ProjectCode: string;
  BudgetNumber: string;
  TenderNumber: string;
  ContractNumber: string;
  StaffNumber: string;
  CoverIDLink: string;
}

export interface ConnectedDocumentsData {
  ID: string;
  ConnectedObj: string;
  CreationDate: string;
  CreatorID: string;
  CreatorName_EN: string;
  CreatorName_AR: string;
  Name: string;
  DocType: string;
  Link: string;
}

export interface ThreadedViewData {
  CorrespondenceIcon: IconType[];
  SeeContents: boolean;
  LinkedIcon: string;
  DataID: string;
  ParentID: string;
  ConnectionType: string;
  name: string;
  VolumeID: string;
  CorrespondenceCode: string;
  CorrespondenceDate: string;
  ArabicSubject: string;
  EnglishSubject: string;
  CorrFlowType: string;
  RecipientDepartment: string;
  RecipientDepartment_EN: string;
  RecipientDepartment_AR: string;
  SenderDepartment: string;
  SenderDepartment_EN: string;
  SenderDepartment_AR: string;
  ExternalOrganization: string;
  ExternalOrganizationNameEN: string;
  ExternalOrganizationNameAR: string;
  BaseType: string;
  Level?: number;
  SortNumber?: number;
  Type: string;
  CoverID: string;
  DispatchDate: string;
  BaseType_EN: string;
  BaseType_AR: string;
  CorrespondenceType_EN: string;
  CorrespondenceType_AR: string;
  Confidential: string;
  DocumentNumber: string;
  ProjectCode: string;
  BudgetNumber: string;
  TenderNumber: string;
  ContractNumber: string;
  StaffNumber: string;
  CoverIDLink: string;
}

export interface SearchData {
  CorrespondenceIcon: IconType[];
  SeeContents: string;
  VolumeID: string;
  DataID: string;
  CorrFlowType: string;
  CoverID: string;
  Name: string;
  CorrespondenceCode: string;
  Subject_EN: string;
  Subject_AR: string;
  ExternalOrganization: string;
  ExternalOrganization_EN: string;
  ExternalOrganization_AR: string;
  SenderDepartment: string;
  SenderDepartment_EN: string;
  SenderDepartment_AR: string;
  RecipientDepartment: string;
  RecipientDepartment_EN: string;
  RecipientDepartment_AR: string;
  CorrespondenceDate: string;
  DispatchDate: string;
  BaseType_EN: string;
  BaseType_AR: string;
  CorrespondenceType_EN: string;
  CorrespondenceType_AR: string;
  Confidential: string;
  DocumentNumber: string;
  ProjectCode: string;
  BudgetNumber: string;
  TenderNumber: string;
  ContractNumber: string;
  StaffNumber: string;
  CoverIDLink: string;
}

export interface IconType {
  title: string;
  icon: string;
}

@Component({
  selector: 'app-linked-corr-dialog',
  templateUrl: './linked-corr-dialog.component.html',
  styleUrls: ['./linked-corr-dialog.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LinkedCorrDialogComponent implements OnInit {
  // variables for table data
  public connectedCorrData: ConnectedCorrespondencesData[];
  public connectedDocData: ConnectedDocumentsData[];
  public threadedViewObj;
  public connectedSearchDataObj: SearchData[];
  // spinner toggles
  public activeDataSpinner = false;
  public activeSearchSpinner = false;
  public firstLoadSpinner = false;
  // current corrrespondence data
  public currentReference: string;
  public currentName: string;
  // tab toggles
  public DocTabIndex = 0;
  public CorrTabIndex = 0;
  // search filter parameters
  public searchExtOrgFieldShow: boolean;
  public searchRecipientDeptFieldShow: boolean;
  public searchSenderDeptFieldShow: boolean;
  // correspondence search number
  public startPage = 1;
  public endPage = 20;
  // test
  filesAction = 'addFiles';
  testToggle = true;
  newwindow;

  // tables fields
  CorrDisplayedColumns: string[] = ['DocType', 'name', 'EnglishSubject', 'ExternalOrganization_EN', 'SenderDepartment_EN', 'RecipientDepartment_EN', 'CorrespondenceDate', 'Remove'];
  SearchTableDisplayedColumns: string[] = ['DocType', 'Name', 'Subject_EN', 'ExternalOrganization_EN', 'SenderDepartment_EN', 'RecipientDepartment_EN', 'CorrespondenceDate', 'Link'];
  ThreadedDisplayedColumns: string[] = ['EnglishSubject', 'Type', 'ExternalOrganization_EN', 'SenderDepartment_EN', 'RecipientDepartment_EN', 'name', 'CorrespondenceDate', 'Open'];
  DocDisplayedColumns: string[] = ['DocType', 'Name', 'CreatorName_EN', 'CreationDate', 'Remove'];
  // routing variables
  basehref: String = FCTSDashBoard.BaseHref;
  CSUrl: String = FCTSDashBoard.CSUrl;
  routerCorrDetail = '/dashboard/external/correspondence-detail';
  isProxy = false;
  // objects for tables loop
  CorrTableStructure = [
    { 'columnDef': 'DocType', 'columnName': '' },
    { 'columnDef': 'name', 'columnName': this.translator.transform('PWAReference') },
    { 'columnDef': 'EnglishSubject', 'columnName': this.translator.transform('subject')},
    { 'columnDef': 'ExternalOrganization_EN', 'columnName': this.translator.transform('ext_org') },
    { 'columnDef': 'SenderDepartment_EN', 'columnName':this.translator.transform('fromDep') },
    { 'columnDef': 'RecipientDepartment_EN', 'columnName':this.translator.transform('toDep') },
    { 'columnDef': 'CorrespondenceDate', 'columnName':this.translator.transform('receivedDate') },
    { 'columnDef': 'Remove', 'columnName': '' }
  ];
  DocsTableStructure = [
    { 'columnDef': 'DocType', 'columnName': '' },
    { 'columnDef': 'Name', 'columnName':this.translator.transform('connection') },
    { 'columnDef': 'CreatorName_EN', 'columnName':this.translator.transform('connected_by') },
    { 'columnDef': 'CreationDate', 'columnName':this.translator.transform('connection_date') },
    { 'columnDef': 'Remove', 'columnName': '' }
  ];
  ThreadedViewTableStructure = [
    { 'columnDef': 'EnglishSubject', 'columnName': this.translator.transform('subject') },
    { 'columnDef': 'Type', 'columnName':this.translator.transform('type') },
    { 'columnDef': 'ExternalOrganization_EN', 'columnName': this.translator.transform('ext_org') },
    { 'columnDef': 'SenderDepartment_EN', 'columnName': this.translator.transform('fromDep') },
    { 'columnDef': 'RecipientDepartment_EN', 'columnName':this.translator.transform('toDep') },
    { 'columnDef': 'name', 'columnName':this.translator.transform('correspondence_code') },
    { 'columnDef': 'CorrespondenceDate', 'columnName': this.translator.transform('date') },
    { 'columnDef': 'Open', 'columnName': '' }
  ];
  SearchTableStructure = [
    { 'columnDef': 'DocType', 'columnName': '' },
    { 'columnDef': 'Name', 'columnName': this.translator.transform('PWAReference') },
    { 'columnDef': 'Subject_EN', 'columnName':this.translator.transform('subject') },
    { 'columnDef': 'ExternalOrganization_EN', 'columnName': this.translator.transform('ext_org') },
    { 'columnDef': 'SenderDepartment_EN', 'columnName': this.translator.transform('fromDep') },
    { 'columnDef': 'RecipientDepartment_EN', 'columnName': this.translator.transform('toDep') },
    { 'columnDef': 'CorrespondenceDate', 'columnName': this.translator.transform('receivedDate') },
    { 'columnDef': 'Link', 'columnName': '' }
  ];

  CorrespondenceDetailsStructure = [
    { 'Definition': 'Created Date', 'ParameterName': 'CorrespondenceDate' },
    { 'Definition': 'Project', 'ParameterName': 'ProjectCode' },
    { 'Definition': 'Dispatch Date', 'ParameterName': 'DispatchDate' },
    { 'Definition': 'Contract', 'ParameterName': 'ContractNumber' },
    { 'Definition': 'Correspondence Type', 'ParameterName': 'CorrespondenceType_EN' },
    { 'Definition': 'Tender', 'ParameterName': 'TenderNumber' },
    { 'Definition': 'Base Type', 'ParameterName': 'BaseType_EN' },
    { 'Definition': 'Document Number', 'ParameterName': 'DocumentNumber' },
    { 'Definition': 'Confidential', 'ParameterName': 'Confidential' },
    { 'Definition': 'Budget', 'ParameterName': 'BudgetNumber' },
  ]
  // search filter object
  SearchFilterData = {
    ReferenceCode: '',
    DocumentNumber: '',
    MyAssignments: false,
    DispatchDateFrom: '',
    DispatchDateTo: '',
    Subject: '',
    CorrespondencType: { ID: '', EN: '', AR: '' },
    ExternalOrganization: { ID: '', EN: '', AR: '' },
    ExternalDepartment: '',
    RecipientDepartment: { ID: '', EN: '', AR: '' },
    SenderDepartment: { ID: '', EN: '', AR: '' },
    Priority: { ID: '', EN: '', AR: '' },
    BaseType: { ID: '', EN: '', AR: '' },
    IDNumber: '',
    Personalname: '',
    Transferpurpose: '',
    Contract: '',
    Tender: '',
    Mailroom: '',
    Budget: '',
    Project: '',
    Staffnumber: ''
  };
  // TODO constants for correspondence insert (make it global)
  InsertCorrConstants = {
    'ConnectedType': 'Correspondence',
    'ReferenceType': 'Correspondence',
    'ConnectionType': '1',
    'Deleted': '0'
  };
  InsertFileConstants = {
    'ConnectedType': 'Dtree',
    'ReferenceType': 'Correspondence',
    'ConnectionType': '1',
    'Deleted': '0'
  };

  @ViewChild(MatSort) sort: MatSort;
  //@ViewChild(FilesSelectComponent) filesSelect;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public correspondenceShareService: CorrespondenceShareService,
    public dialogRef: MatDialogRef<LinkedCorrDialogComponent>,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public correspondenceService: CorrespondenceService,
    public dialogU: MatDialog,
    public translatorService: multiLanguageTranslator,
    public translator: multiLanguageTranslatorPipe,
    public router: Router,
  ) { }

  ngOnInit() {
    this.PrepareData();
    this.searchExtOrgFieldShow = true;
    this.searchRecipientDeptFieldShow = true;
    this.searchSenderDeptFieldShow = true;
  }

  PrepareData() {
    this.currentName = this.data.correspondData.Name;
    this.currentReference = this.data.correspondData.DataID;
    this.getDataFunction(this.data.correspondData.DataID);
  }

  getDataFunction(DataID: string) {
    this.firstLoadSpinner = true;
    forkJoin(
      this.correspondenceShareService.getCorrConnected(DataID),
      this.correspondenceShareService.getDocumentsRelated(DataID),
      this.correspondenceShareService.getThreadedView(DataID)
    )
      .subscribe(
        ([res1, res2, res3]) => {
          this.connectedCorrData = res1;
          this.connectedDocData = res2;
          const sortObject: SortObjectClass = new SortObjectClass(res3);
          this.threadedViewObj = new MatTableDataSource(sortObject.sortObjFunction());
          this.threadedViewObj.sort = this.sort;
          this.firstLoadSpinner = false;
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
          this.firstLoadSpinner = false;
        });
  }

  getOnlyCorrConnected(DataID: string) {
    this.firstLoadSpinner = true;
    this.correspondenceShareService.getCorrConnected(DataID).subscribe(
      response => {
        this.connectedCorrData = response;
        this.firstLoadSpinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.firstLoadSpinner = false;
      }
    );
  }

  getOnlyDocumentsRelated(DataID: string) {
    this.activeDataSpinner = true;
    this.correspondenceShareService.getDocumentsRelated(DataID).subscribe(
      response => {
        this.connectedDocData = response;
        this.activeDataSpinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.activeDataSpinner = false;
      }
    );
  }

  changeCorrTab(tab) {
    this.CorrTabIndex = tab;
    this.testToggle = !this.testToggle;
  }

  changeDocumentTab(tab) {
    this.DocTabIndex = tab;
  }

  onSearchLinkedButtonClick(selecetedValues: any): void {
    this.SearchFilterData = selecetedValues;
    this.getCorrespondence(this.startPage, this.endPage, this.SearchFilterData);
  }

  getCorrespondence(startrow: number, endrow: number, SearchFilterData: any): void {
    this.activeSearchSpinner = true;
    this.correspondenceShareService
      .getLinkedSearchCorr(this.currentReference, startrow, endrow, SearchFilterData)
      .subscribe(
        response => {
          this.connectedSearchDataObj = response;
          this.activeSearchSpinner = false;
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
          this.activeSearchSpinner = false;
        }
      );
  }

  addCorrConnection(LinkingData) {
    this.correspondenceShareService.insertDocConnection(this.currentReference, LinkingData, this.InsertCorrConstants)
      .subscribe(response => {
        this.getOnlyCorrConnected(this.currentReference);
        this.changeCorrTab(0);
      },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  deleteConnectionConfirmDialog(ConnectionID: string, type: string): void {
    const dialogRef = this.dialogU.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'userConfirmation',
      maxWidth: '30vw',
      data: {
        message: 'deleteConnection'
      }
    }).afterClosed().subscribe(
      response => {
        if (response) {
          this.deleteConnectedCorr(ConnectionID, type);
        }
      });
  }

  deleteConnectedCorr(ConnectionID: string, type: string): void {
    this.correspondenceShareService.deleteConnectedCorr(ConnectionID).subscribe(
      response => {
        if (type === 'corr') {
          this.getOnlyCorrConnected(this.currentReference);
        } else if (type === 'doc') {
          this.getOnlyDocumentsRelated(this.currentReference);
        }
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  setPerformerPermission(correspondData: any): void {
    let permissionsParameters = {
      DataID: correspondData.DataID,
      CorrFlowType: correspondData.CorrFlowType,
      SubWorkTask_TaskID: '0'
    }
    this.correspondenceService.setPerformerPermission(permissionsParameters).subscribe(
      response => { },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  threadedMoving(Rowdata: ThreadedViewData): void {
    this.currentName = Rowdata.name;
    this.currentReference = Rowdata.DataID;
    this.getDataFunction(Rowdata.DataID);
    //this.filesSelect.threadedMoving(this.currentReference);
    this.connectedSearchDataObj = null;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // not used because of changed requirements
  correspondenceReroute(correspondence) {
    this.setPerformerPermission(correspondence);
    this.closeDialog();
    this.router.navigate([this.routerCorrDetail],
      {
        queryParams:
        {
          VolumeID: correspondence.VolumeID,
          CorrType: correspondence.CorrFlowType,
          CoverID: correspondence.CoverID,
          locationid: correspondence.DataID,
          TaskID: '0',
          TransID: '0',
          TransIsCC: '0'
        }
      }
    );
  }

  CoverLetterPreview(url) {
    let width = screen.width / 2 - screen.width / 10;
    let height = screen.height - screen.height / 4;
    var params = 'width=' + width + ', height=' + height + ',top=100,left=100,resizable';
    this.newwindow = window.open(this.CSUrl + url, 'name', params);
    if (window.focus) { this.newwindow.focus() }
  }

  addFileConnection(arr: number[]) {
    this.correspondenceShareService.insertDocConnection(this.currentReference, arr.join(), this.InsertFileConstants)
      .subscribe(response => {
        this.getOnlyDocumentsRelated(this.currentReference);
      },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }
}

export class SortObjectClass {
  obj: ThreadedViewData[];
  private sortNumber = 0;

  constructor(obj: ThreadedViewData[]) {
    this.obj = obj;
  }

  sortObjFunction(): any {
    const parentReferenceID = this.FindZeroLevel();
    this.ChildSortFunc(parentReferenceID, 1);
    return this.obj;
  }

  FindZeroLevel() {
    let referenceID: string;
    this.obj.forEach(element => {
      if (element.ParentID === '0') {
        element.Level = 0;
        element.SortNumber = this.sortNumber;
        this.sortNumber++;
        referenceID = element.DataID;
      }
    });
    return referenceID;
  }

  ChildSortFunc(parent, Level) {
    this.obj.forEach(element => {
      if (element.ParentID === parent) {
        element.Level = Level;
        element.SortNumber = this.sortNumber;
        this.sortNumber++;
        this.ChildSortFunc(element.DataID, Level + 1);
      }
    });
  }
}
