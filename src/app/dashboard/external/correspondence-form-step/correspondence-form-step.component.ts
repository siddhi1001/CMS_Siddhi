import { Component, OnInit, VERSION, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { MatOptionSelectionChange, MatCheckboxChange } from '@angular/material';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { MatDialog } from '@angular/material';

import { FCTSDashBoard } from 'src/environments/environment';
import { OrgNameAutoFillModel, CorrespondenceFolderModel, CCUserSetModel, CorrespondenenceDetailsModel, TableStructureParameters } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { CorrResponse, CorrespondenceFormData, SenderDetailsData, RecipientDetailsData, CommentsNode } from '../../services/correspondence-response.model';

import { SendBackDialogComponent } from '../../dialog-boxes/send-back-dialog/send-back-dialog.component';
import { organizationalChartModel, organizationalChartEmployeeModel, ECMDChartModel, ECMDChartDepartmentModel } from 'src/app/dashboard/models/organizational-Chart.model';
import { DocumentPreview } from 'src/app/dashboard/services/documentpreview.model';
import { CorrespondenceWFFormModel } from 'src/app/dashboard/models/CorrepondenceWFFormModel';
import { RecallStepsInfo } from '../../services/correspondence.model';

import { TransferDialogBox } from '../correspondence-detail/correspondence-transfer-dialog/correspondence-transfer-dialog.component';

import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { OrganizationalChartService } from 'src/app/dashboard/services/organizationalChart.service';
import { CSDocumentUploadService } from 'src/app/dashboard/services/CSDocumentUpload.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { CorrespondenceShareService } from '../../services/correspondence-share.service';

import { ShowSections, ShowCorrItems, ShowWFButtons } from 'src/app/dashboard/external/correspondence-detail/correspondence-show-sections';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { UploadSession } from 'src/app/dashboard/base-classes/base-correspondence-csactions/base-correspondence.component';
import { HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';


@Component({
  selector: 'app-correspondence-form-step',
  templateUrl: './correspondence-form-step.component.html',
  styleUrls: ['./correspondence-form-step.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class CorrespondenceFormStepComponent implements OnInit {
  constructor(
    private correspondenceDetailsService: CorrespondenceDetailsService
    , private _location: Location
    , private organizationalChartService: OrganizationalChartService
    , private formBuilder: FormBuilder
    , private correspondencservice: CorrespondenceService
    , private csdocumentupload: CSDocumentUploadService
    , private _correspondenceDetailsService: CorrespondenceDetailsService
    , private route: ActivatedRoute
    , public dialog: MatDialog
    ,public translatorService: multiLanguageTranslator
    ,public translator: multiLanguageTranslatorPipe
    , private _errorHandlerFctsService: ErrorHandlerFctsService
    , private appLoadConstService: AppLoadConstService
    , private correspondenceShareService: CorrespondenceShareService
    , private notificationmessage: NotificationService,
  ) { }

  get f() { return this.correspondenceDetailsForm.controls; }

  basehref: String = FCTSDashBoard.BaseHref;
  CSUrl: String = FCTSDashBoard.CSUrl;
  globalConstants = this.appLoadConstService.getConstants();
  expandedRightAction = true;
  expandedAction = true;
  userInfo: CorrResponse[];
  filteredExtOrgNames: Observable<OrgNameAutoFillModel[]>;
  filteredIntDepNames: Observable<OrgNameAutoFillModel[]>;
  filteredDepartmentNames: Observable<OrgNameAutoFillModel[]>;
  ExtSenderInfo: OrgNameAutoFillModel;
  IntRecipientInfo: OrgNameAutoFillModel;
  senderControl = new FormControl();
  recipientControl = new FormControl();
  myControl = new FormControl();
  correspondenceDetailsForm: FormGroup;
  senderDetailsForm: FormGroup;
  recipientDetailsForm: FormGroup;

  ccDetailsForm: FormGroup;
  CCDetails: FormArray;
  submitted = false;
  CorrespondenceType: string;
  MetadataFilters: any[];
  externalIncCoverLetterData: CorrResponse[];
  externalAttachmentFolderData: CorrResponse[];
  corrFolderData: CorrespondenceFolderModel;
  documentPreviewURL: DocumentPreview[];

  selectedCaption: string;
  multiSelect: boolean;
  currentlyChecked: any = false;
  currentlyCheckedStatus: boolean;
  showPreviewCoverLetter: boolean;
  showDistributionTreeArea: boolean;

  treeControl = new NestedTreeControl<organizationalChartModel>(node => node.children);
  dataSource = new MatTreeNestedDataSource<organizationalChartModel>();

  showEmployees = false;

  organizationalChartData: organizationalChartModel[];
  showEmplChartData: organizationalChartModel;
  showOrgChartData: organizationalChartModel;
  showPreviewTreeArea = false;
  orgSearch: string;
  // ECMD VAR
  dataSourceECMD = new MatTreeNestedDataSource<any>();
  treeControlECMD = new NestedTreeControl<any>(node => node.children);
  isSearchResult = false;
  isLoading = false;
  showPreviewECMDTreeArea = false;
  ECMDMap = new Map();
  //
  percentDone: number;
  uploadSuccess: boolean;
  version = VERSION;

  //
  initiateIncomingCorrespondenceDetails = new CorrespondenceWFFormModel;

  coverID: string;
  CCOUID: organizationalChartModel[] = [];
  CCEID: organizationalChartEmployeeModel[] = [];
  value = '';
  files: NgxFileDropEntry[] = [];
  correspondenceData: CorrespondenenceDetailsModel;

  VolumeID: string;
  CoverID: string;
  locationid: string;
  CorrespondencType: string;
  taskID: string;
  skipTaskID: string; // TaskID that will be skiped in case of SendOnAndSkip
  CorrespondenceFolderName: Observable<any>;
  barcodeNumberToPrint = '';
  barcodeDate = new Date().toLocaleDateString();

  correspondenceSenderDetailsData: SenderDetailsData;    // make model
  correspondenceRecipientDetailsData: RecipientDetailsData; // make model
  correspondenceCollaborationDetail: CorrResponse[]; // make model
  progbar = false;
  ccProgbar = false;
  commentsProgbar = true;
  correspondenceCCtData: CorrResponse[];
  correspondenceCommentsDetail: CorrResponse[];
  transferhistorytabData: CorrResponse[];
  transferProgbar = false;
  userCollaborationProgbar = false;
  taskTitle: string;
  body: CorrespondenceFormData = {
    action: 'formUpdate',
    values: {}
  };
  // UI elements show/hide
  stepUIData: any;
  sectionDisplay: ShowSections;
  // showCorrItems = new ShowCorrItems();
  showCorrItems: ShowCorrItems;
  showWFButtons: ShowWFButtons;

  employeeMap = new Map<number, organizationalChartEmployeeModel[]>();
  showempDetails = false;
  CCLoaded = false;
  returnReason: string;
  returnComment: string;
  CorrespondenceFlowType: string; /* 1,5,7 */
  stepsInfo = new RecallStepsInfo();  /* for Dispositin1 custom audit */
  corrPhase: string;
  attachLoaded = false;
  progress = 0;

  // sendeer tbl structure
  senderTableStructureFull: TableStructureParameters[] = [
    { 'columnDef': 'OrganizationName', 'columnName': 'Organization', 'priority': 1 },
    { 'columnDef': 'DepartmentName', 'columnName': 'Department', 'priority': 1 },
    { 'columnDef': 'Name', 'columnName': 'Name', 'priority': 2 },
  ];
  senderTableStructure: TableStructureParameters[];
  senderTableStructureDetails: TableStructureParameters[];
  senderColWidth: number;
  senderIconWidth: number;
  senderIconWidthConst = 4;
  @ViewChild('senderContainer') senderContainer: ElementRef;

  ngOnInit() {
    this.VolumeID = this.route.snapshot.queryParamMap.get('VolumeID');
    this.CorrespondencType = this.route.snapshot.queryParamMap.get('CorrType');
    this.locationid = this.route.snapshot.queryParamMap.get('locationid');
    this.taskID = this.route.snapshot.queryParamMap.get('TaskID');
    this.RefreshRecord();
    this.readCorrespondenceInfo();
    this.getCorrespondenceSenderDetails();
    this.getCorrespondenceRecipientDetails();
    

    // Get Logged in user Information
    this.getUserInfo();
    this.getOrganizationalChartDetail();
    this.getECMDRoot(0);
    this.getUIData(this.taskID, 'Init');
    this.senderDetailsForm = this.formBuilder.group({
      SenderName: [],
      SenderDepartment: [],
      ExternalOrganization: [],

    });

    this.recipientDetailsForm = this.formBuilder.group({
      RecipientID: [],
      RecipientUserID: [],
      RecipientVersion: [],
      RecipientType: [],
      RecipientDepartment: [],
      RecipientDepartmentName: [],
      RecipientSection: [],
      RecipientRole: [],
      RecipientName: []
    });

    this.ccDetailsForm = this.formBuilder.group({
      CCDetails: this.formBuilder.array([

      ])
    });
    // const validators = [ Validators.required ];
    this.correspondenceDetailsForm = this.formBuilder.group({
      regDate: new FormControl({ value: '', disabled: !this.showCorrItems.regDate.Modify }),
      docsDate: new FormControl({ value: '', disabled: !this.showCorrItems.docsDate.Modify }),
      confidential: new FormControl({ value: '', disabled: !this.showCorrItems.confidential.Modify }),
      priority: new FormControl({ value: '', disabled: !this.showCorrItems.priority.Modify }),
      // refNumber: ['', Validators.required],
      refNumber: new FormControl({ value: '', disabled: !this.showCorrItems.refNumber.Modify }),
      personalName: new FormControl({ value: '', disabled: !this.showCorrItems.personalName.Modify }),
      idNumber: new FormControl({ value: '', disabled: !this.showCorrItems.idNumber.Modify }),
      correspondenceType: new FormControl({ value: '', disabled: !this.showCorrItems.correspondenceType.Modify }),
      baseType: new FormControl({ value: '', disabled: !this.showCorrItems.baseType.Modify }),
      arabicSubject: new FormControl({ value: '', disabled: !this.showCorrItems.arabicSubject.Modify }),
      englishSubject: new FormControl({ value: '', disabled: !this.showCorrItems.englishSubject.Modify }),
      projectCode: new FormControl({ value: '', disabled: !this.showCorrItems.projectCode.Modify }),
      budgetNumber: new FormControl({ value: '', disabled: !this.showCorrItems.budgetNumber.Modify }),
      contractNumber: new FormControl({ value: '', disabled: !this.showCorrItems.contractNumber.Modify }),
      tenderNumber: new FormControl({ value: '', disabled: !this.showCorrItems.tenderNumber.Modify }),
      corrNumber: new FormControl({ value: '', disabled: !this.showCorrItems.corrNumber.Modify }),
      fillinPlanPath: new FormControl({ value: '', disabled: !this.showCorrItems.fillinPlanPath.Modify }),
      dispatchMethod: new FormControl({ value: '', disabled: !this.showCorrItems.dispatchMethod.Modify }),
      staffNumber: new FormControl({ value: '', disabled: !this.showCorrItems.staffNumber.Modify }),
    });
    this.setValidators();

    this.filteredExtOrgNames = this.senderDetailsForm.get('ExternalOrganization').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value =>
          this.correspondenceDetailsService.searchFieldForAutoFill(value, 'ExtOrganization', '')
        )
      );

    this.filteredIntDepNames = this.recipientDetailsForm.get('RecipientDepartment').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value =>
          this.correspondenceDetailsService.searchFieldForAutoFill(value, 'IntDepartment', '')
        )
      );
  }

  getUIData(taskID: string, source: string) {
    this.stepUIData = this.toShowWFButtons(taskID);
    if (source === 'Init') {
      this.showWFButtons = this.stepUIData.ShowButtons;
    }
    this.showCorrItems = this.stepUIData.ShowFields;
    this.sectionDisplay = this.stepUIData.ShowSections;
  }

  setValidators() {
    // mark fields as Required
    for (const obj in this.showCorrItems) {
      if (this.showCorrItems[obj].Reguired) {
        this.correspondenceDetailsForm.get(obj).setValidators(Validators.required);
        this.correspondenceDetailsForm.get(obj).updateValueAndValidity();
      }
    }
  }

  ReadRecord(locationid: string, transid: string) {
    this.correspondenceDetailsService
      .getCorrRecord(locationid, transid, CSConfig.globaluserid)
      .subscribe(correspondenceData => {
        this.correspondenceData = correspondenceData[0];
        this.getCoverSection();
      });
  }

  RefreshRecord() {
    this.ReadRecord(this.locationid, '0');
  }

  getCorrespondenceSenderDetails(): void {
    this._correspondenceDetailsService
      .getCorrespondenceSenderDetails(this.VolumeID, this.CorrespondencType, false, '', 0)
      .subscribe(
        correspondenceSenderDetailsData => {
          if ((typeof correspondenceSenderDetailsData[0].myRows !== 'undefined') && correspondenceSenderDetailsData[0].myRows.length > 0) {
            this.correspondenceSenderDetailsData = correspondenceSenderDetailsData[0].myRows[0];
            this.displayColumnsForm(this.senderContainer.nativeElement.clientWidth);
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  displayColumnsForm(width: number): void {
    const priority = this.correspondenceDetailsService.definePriorityToShow(width);
    this.senderTableStructure = [];
    this.senderTableStructureDetails = [];
    let senderTableLength = 0;
    this.senderTableStructureFull.forEach(element => {
      if (element.priority > priority) {
        this.senderTableStructureDetails.push(element);
      } else {
        this.senderTableStructure.push(element);
        senderTableLength += element.columnDef !== 'Icon' ? 1 : 0;
      }
    });
    this.senderIconWidth = this.senderTableStructureDetails.length > 0 ? (this.senderIconWidthConst * 2) : this.senderIconWidthConst;
    this.senderColWidth = Math.floor((100 - this.senderIconWidth) / senderTableLength);
  }

  onResized(event: ResizedEvent) {
    this.displayColumnsForm(event.newWidth);
  }

  getCorrespondenceRecipientDetails(): void {
    this._correspondenceDetailsService
      .getCorrespondenceRecipientDetails(this.VolumeID, this.CorrespondencType)
      .subscribe(
        correspondenceRecipientDetailsData => {
          if ((typeof correspondenceRecipientDetailsData[0].myRows !== 'undefined') && correspondenceRecipientDetailsData[0].myRows.length > 0) {
            this.correspondenceRecipientDetailsData = correspondenceRecipientDetailsData[0].myRows[0];
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  ccShowData() {
    this.getCorrespondenceCCDetail(this.VolumeID, this.CorrespondencType);
  }

  getCorrespondenceCCDetail(VolumeID: String, CorrFlowType: String): void {
    if (!this.CCLoaded) {
      this.ccProgbar = true;
      this._correspondenceDetailsService.getCorrespondenceCCDetail(VolumeID, CorrFlowType)
        .subscribe(correspondenceCCtData => {
          this.correspondenceCCtData = correspondenceCCtData;
          this.ccProgbar = false;
          this.CCLoaded = true;
          for (const obj of this.correspondenceCCtData[0].myRows) {
            if (obj.CCUserID > 0) {
              this.addCC(obj);
            }
          }
        },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          });
    }
  }

  addCC(depDetails: CCUserSetModel): void {
    this.CCDetails = this.ccDetailsForm.get('CCDetails') as FormArray;
    this.CCDetails.push(this.createNewCC(depDetails));
  }

  createNewCC(depDetails: CCUserSetModel): FormGroup {
    return this.formBuilder.group({
      DepID: depDetails.CCUserID,
      Depversion: depDetails.CCVersion,
      departmentName: depDetails.DepartmentName_EN,
      role: depDetails.Role_EN,
      name: depDetails.Name_EN
    });
  }

  removeCC(index: number) {
    this.CCDetails = this.ccDetailsForm.get('CCDetails') as FormArray;
    this.CCDetails.removeAt(index);
  }

  collaborationShowData() {
    this.getCorrespondenceCollaborationData();
  }

  getCorrespondenceCollaborationData(): void {
    this.userCollaborationProgbar = true;
    this._correspondenceDetailsService.getCorrespondenceCollaborationInfoRO(this.VolumeID, this.CorrespondencType)
      .subscribe(correspondenceCollaborationDetail => {
        this.correspondenceCollaborationDetail = correspondenceCollaborationDetail;
        this.userCollaborationProgbar = false;
      });
  }

  showCommentsData() {
    this.getCommentsData();
  }

  getCommentsData(): void {
    this.commentsProgbar = true;
    this._correspondenceDetailsService.getCommentsData(this.VolumeID)
      .subscribe(correspondenceCommentsDetail => {
        this.correspondenceCommentsDetail = correspondenceCommentsDetail;
        this.commentsProgbar = false;
      },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }
  /* */
  readCorrespondenceInfo(): void {
    this._correspondenceDetailsService.getFormStepInfo(this.VolumeID, this.VolumeID, this.taskID).subscribe(
      response => {
        if ((typeof response.forms !== 'undefined') && response.forms.length > 0) {
          this.body.values = response.forms[0].data;
          this.taskTitle = response.data.title;
          this.getMetadataFilters();
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  makeFormObjectToSubmit(action: string) {
    this.body.values.WorkflowForm_1x4x1x75 = action;
    this.body.values.WorkflowForm_1x4x1x22 = this.setPopupCheckedValue('Priority', this.correspondenceDetailsForm.get('priority').value.EN);
    this.body.values.WorkflowForm_1x4x1x2 = this.correspondenceDetailsForm.get('regDate').value;
    // this.body.values.WorkflowForm_1x4x1x124 = this.correspondenceDetailsForm.get('docsDate').value.toISOString();
    this.body.values.WorkflowForm_1x4x1x124 = this.correspondenceShareService.DateToISOStringAbs(this.correspondenceDetailsForm.get('docsDate').value);
    this.body.values.WorkflowForm_1x4x1x28 = this.correspondenceDetailsForm.get('refNumber').value;
    this.body.values.WorkflowForm_1x4x1x88 = this.correspondenceDetailsForm.get('personalName').value;
    this.body.values.WorkflowForm_1x4x1x27 = this.correspondenceDetailsForm.get('idNumber').value;
    this.body.values.WorkflowForm_1x4x1x30 = this.setPopupCheckedValue('CorrespondenceType', this.correspondenceDetailsForm.get('correspondenceType').value.EN);
    this.body.values.WorkflowForm_1x4x1x29 = this.setPopupCheckedValue('BaseType', this.correspondenceDetailsForm.get('baseType').value.EN);
    this.body.values.WorkflowForm_1x4x1x35 = this.correspondenceDetailsForm.get('arabicSubject').value;
    this.body.values.WorkflowForm_1x4x1x36 = this.correspondenceDetailsForm.get('englishSubject').value;
    this.body.values.WorkflowForm_1x4x1x37 = this.correspondenceDetailsForm.get('projectCode').value;
    this.body.values.WorkflowForm_1x4x1x38 = this.correspondenceDetailsForm.get('budgetNumber').value;
    this.body.values.WorkflowForm_1x4x1x40 = this.correspondenceDetailsForm.get('contractNumber').value;
    this.body.values.WorkflowForm_1x4x1x39 = this.correspondenceDetailsForm.get('tenderNumber').value;
    this.body.values.WorkflowForm_1x4x1x9 = this.correspondenceDetailsForm.get('corrNumber').value;
    this.body.values.WorkflowForm_1x4x1x41 = this.correspondenceDetailsForm.get('staffNumber').value;
    this.body.values.WorkflowForm_1x4x1x49 = this.setPopupCheckedValue('DispatchMethod', this.correspondenceDetailsForm.get('dispatchMethod').value.EN);
    this.getCCtoFormObject();
  }

  getCCtoFormObject() {
    this.body.values.WorkflowForm_1x4x1x17.splice(this.ccDetailsForm.get('CCDetails').value.length);
    for (let i = 0; i < this.ccDetailsForm.get('CCDetails').value.length; i++) {
      if (typeof this.body.values.WorkflowForm_1x4x1x17[i] === 'object') {
        this.body.values.WorkflowForm_1x4x1x17[i].WorkflowForm_1x4x1x17_x_18 = this.ccDetailsForm.get('CCDetails').value[i].DepID;
        this.body.values.WorkflowForm_1x4x1x17[i].WorkflowForm_1x4x1x17_x_19 = this.ccDetailsForm.get('CCDetails').value[i].Depversion;
      } else {
        this.body.values.WorkflowForm_1x4x1x17.push({
          WorkflowForm_1x4x1x17_x_18: this.ccDetailsForm.get('CCDetails').value[i].DepID,
          WorkflowForm_1x4x1x17_x_19: this.ccDetailsForm.get('CCDetails').value[i].Depversion,
          WorkflowForm_1x4x1x17_x_20: null, WorkflowForm_1x4x1x17_x_92: null
        });
      }
    }
  }

  setCorrespondenceDetails(): void {
    this.recipientDetailsForm.get('RecipientDepartment').setValue({ DepName_En: this.correspondenceRecipientDetailsData.DepartmentName_EN, SecName_En: this.correspondenceRecipientDetailsData.SectionName_EN });
    this.recipientDetailsForm.get('RecipientName').setValue(this.correspondenceRecipientDetailsData.Name_EN);
    this.senderDetailsForm.get('SenderName').setValue(this.correspondenceSenderDetailsData.Name_EN);
    this.senderDetailsForm.get('SenderDepartment').setValue(this.correspondenceSenderDetailsData.DepartmentName_EN);
    this.senderDetailsForm.get('ExternalOrganization').setValue({ OrgName_En: this.correspondenceSenderDetailsData.OrganizationName_EN });
    this.correspondenceDetailsForm.get('priority').setValue(this.getDefaultaValue('Priority', this.body.values.WorkflowForm_1x4x1x22));
    this.correspondenceDetailsForm.get('confidential').setValue(this.body.values.WorkflowForm_1x4x1x78);
    this.correspondenceDetailsForm.get('regDate').setValue(this.body.values.WorkflowForm_1x4x1x2);
    this.correspondenceDetailsForm.get('docsDate').setValue(this.body.values.WorkflowForm_1x4x1x124);
    this.correspondenceDetailsForm.get('refNumber').setValue(this.body.values.WorkflowForm_1x4x1x28);
    this.correspondenceDetailsForm.get('personalName').setValue(this.body.values.WorkflowForm_1x4x1x88);
    this.correspondenceDetailsForm.get('idNumber').setValue(this.body.values.WorkflowForm_1x4x1x27);
    this.correspondenceDetailsForm.get('correspondenceType').setValue(this.getDefaultaValue('CorrespondenceType', this.body.values.WorkflowForm_1x4x1x30));
    //    this.correspondenceDetailsForm.get('correspondenceType').setValue({EN: this.getDefaultaValue('CorrespondenceType', this.body.values.WorkflowForm_1x4x1x30)});
    //    this.correspondenceDetailsForm.get('baseType').setValue({EN: this.getDefaultaValue('BaseType', this.body.values.WorkflowForm_1x4x1x29)});
    this.correspondenceDetailsForm.get('baseType').setValue(this.getDefaultaValue('BaseType', this.body.values.WorkflowForm_1x4x1x29));
    this.correspondenceDetailsForm.get('arabicSubject').setValue(this.body.values.WorkflowForm_1x4x1x35);
    this.correspondenceDetailsForm.get('englishSubject').setValue(this.body.values.WorkflowForm_1x4x1x36);
    this.correspondenceDetailsForm.get('projectCode').setValue(this.body.values.WorkflowForm_1x4x1x37);
    this.correspondenceDetailsForm.get('budgetNumber').setValue(this.body.values.WorkflowForm_1x4x1x38);
    this.correspondenceDetailsForm.get('contractNumber').setValue(this.body.values.WorkflowForm_1x4x1x40);
    this.correspondenceDetailsForm.get('tenderNumber').setValue(this.body.values.WorkflowForm_1x4x1x39);
    this.correspondenceDetailsForm.get('corrNumber').setValue(this.body.values.WorkflowForm_1x4x1x9);
    this.correspondenceDetailsForm.get('fillinPlanPath').setValue(this.body.values.WorkflowForm_1x4x1x133);
    this.correspondenceDetailsForm.get('staffNumber').setValue(this.body.values.WorkflowForm_1x4x1x41);
    //    this.correspondenceDetailsForm.get('dispatchMethod').setValue({EN: this.getDefaultaValue('DispatchMethod', this.body.values.WorkflowForm_1x4x1x49)});
    this.correspondenceDetailsForm.get('dispatchMethod').setValue(this.getDefaultaValue('DispatchMethod', this.body.values.WorkflowForm_1x4x1x49));
    this.CorrespondenceFlowType = this.body.values.WorkflowForm_1x4x1x70;
    this.barcodeNumberToPrint = this.body.values.WorkflowForm_1x4x1x9;
    this.corrPhase = this.body.values.WorkflowForm_1x4x1x96;
  }

  getDefaultaValue(Attrname: string, ID: number): object | string {
    const result = {
      ID: -1,
      EN: '',
      AR: ''
    };
    if (ID === 0) {
      return '';
    } else {
      this.MetadataFilters.forEach(element => {
        if (element.AttrName === Attrname && element.ID === ID) {
          result.ID = ID;
          result.EN = element.Name_EN;
          result.AR = element.Name_AR;
        }
      });
      return result;
    }
  }

  setPopupCheckedValue(Attrname: string, Name_EN: string): number {
    let ID = 0;
    this.MetadataFilters.forEach(element => {
      if (element.AttrName === Attrname && element.Name_EN === Name_EN) {
        ID = element.ID;
        return ID;
      }
    });
    return ID;
  }

  submitCorrespondenceInfo(action: string) {

    this.progbar = true;
    if (this.taskID === '31') {
      this.body.values = {};
      this.body.values.WorkflowForm_1x4x1x75 = action;
    } else {
      this.makeFormObjectToSubmit(action);
    }

    if (action === 'SendOn') {
      this.SetDisposionsSendOn();
    } else if (action === 'SendBack') {
      this.SetDisposionsSendBack();
    }

    if (!this.checkFields()) {
      this.progbar = false;
      return;
    }

    this.correspondenceDetailsService.submitCorrespondenceInfo(this.VolumeID, this.taskID, this.body)
      .subscribe(
        response => {
          this.sendOnCorrespondence();
        },
        responseError => {
          this.progbar = false;
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  sendOnCorrespondence() {
    this.setDispAudit(); /* set custom Audit for Disposition1 */
    this.correspondenceDetailsService.sendOnCorrespondence(this.VolumeID, this.taskID)
      .subscribe(
        response => {
          // ?? needs to validate response if send on was correct
          this.backNavigation();
        },
        responseError => {
          this.progbar = false;
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  getTempFolderAttachments(CorrFlowType): void {
    this.correspondenceDetailsService.createTempAttachments(CorrFlowType).subscribe(
      tempAttachment => {
        this.corrFolderData = tempAttachment;
        this.getCoverSection();
        this.attachLoaded = false;
        this.getAttachmentSection();
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  getMetadataFilters(): void {
    this.correspondencservice
      .getDashboardFilters()
      .subscribe(
        MetadataFilters => {
          this.MetadataFilters = MetadataFilters;
          this.setCorrespondenceDetails();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  optionSelectionChangeExternal(orgInfo: OrgNameAutoFillModel, event: MatOptionSelectionChange) {
    this.ExtSenderInfo = orgInfo;
    if (event.source.selected) {
      this.updateSenderInfo();
    }
  }

  optionSelectionChangeInternal(DepInfo: OrgNameAutoFillModel, event: MatOptionSelectionChange) {
    this.IntRecipientInfo = DepInfo;
    if (event.source.selected) {
      this.updateRecipientInfo();
    }
  }

  updateSenderInfo() {
    this.senderDetailsForm.get('SenderName').setValue(this.ExtSenderInfo.Name_En);
    this.senderDetailsForm.get('SenderDepartment').setValue(this.ExtSenderInfo.DepName_En);
    this.body.values.WorkflowForm_1x4x1x93 = this.ExtSenderInfo.OrgID;
    this.body.values.WorkflowForm_1x4x1x80 = this.ExtSenderInfo.DepID;
    this.body.values.WorkflowForm_1x4x1x88 = this.ExtSenderInfo.Name_En;
    this.correspondenceDetailsForm.get('personalName').setValue(this.ExtSenderInfo.Name_En);
  }

  updateRecipientInfo() {
    this.recipientDetailsForm.get('RecipientName').setValue(this.IntRecipientInfo.Name_En);
    this.body.values.WorkflowForm_1x4x1x14 = this.IntRecipientInfo.SecID ? this.IntRecipientInfo.SecID : this.IntRecipientInfo.DepID;
    this.body.values.WorkflowForm_1x4x1x15 = this.IntRecipientInfo.RecipientUserID;
    this.body.values.WorkflowForm_1x4x1x16 = this.IntRecipientInfo.RecipientVersion;
    this.body.values.WorkflowForm_1x4x1x79 = this.IntRecipientInfo.Type;
    this.body.values.WorkflowForm_1x4x1x83 = this.IntRecipientInfo.DepID;
    this.body.values.WorkflowForm_1x4x1x84 = this.IntRecipientInfo.SecID;
    this.body.values.WorkflowForm_1x4x1x85 = this.IntRecipientInfo.RoleID;
  }

  displaySearchFilterValueExt(searchList: OrgNameAutoFillModel) {
    if (searchList) { return searchList.OrgName_En; }
  }

  displaySearchFilterValueInt(searchList: OrgNameAutoFillModel) {
    if (searchList) { return searchList.DepName_En + (searchList.SecName_En === null ? '' : ', ' + searchList.SecName_En); }
  }

  expandeActionRightButton() {
    this.expandedRightAction = !this.expandedRightAction;
  }

  expandeActionLeftButton() {
    this.expandedAction = !this.expandedAction;
  }

  backNavigation() {
    this._location.back();
  }

  getUserInfo() {
    this.correspondenceDetailsService.GetUserInformation().subscribe(
      userInfoVal => {
        this.userInfo = userInfoVal;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  checkFields(): boolean {
    /* check if FormGroup is valid and higlight invalid fields */
    let result = true;
    if (this.correspondenceDetailsForm.invalid) {
      this.notificationmessage.warning('Mandatoty fields', this.translator.transform('mandatory_corr_details'), 3000);
      for (const obj in this.f) {
        if (this.f[obj].invalid) {
          this.f[obj].markAsTouched();
          // console.log(obj);
        }
      }
      result = false;
    }
    return result;
  }

  displayFn(attribute?: any): string | undefined {
    return attribute ? attribute.EN : undefined;
  }

  refreshCoverSection() {
    this.getCoverSection();
  }

  refreshAttachmentSection() {
    this.attachLoaded = false;
    this.getAttachmentSection();
  }

  getCoverSection() {
    this.correspondenceDetailsService.getCoverFolderDetails(Number(this.correspondenceData.AttachCorrCoverID)).subscribe(
      coverFolderdetails => {
        this.externalIncCoverLetterData = coverFolderdetails;
        if (coverFolderdetails[0].myRows.length) {
          this.coverID = coverFolderdetails[0].myRows[0].Dataid;
          this.getCoverDocumentURL(this.coverID);
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  getAttachmentSection() {
    if (!this.attachLoaded) {
      this.setAttachMiscItemsPermiss(this.correspondenceData.AttachCorrAttachmentsID);
      this.correspondenceDetailsService.getAttachmentFolderDetails(Number(this.correspondenceData.AttachCorrAttachmentsID)).subscribe(
        attachmentFolderdetails => {
          this.externalAttachmentFolderData = attachmentFolderdetails;
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
    }
  }

  getCoverDocumentURL(CoverID: String): void {
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getDocumentURL(CoverID).subscribe(
      correspondenceCovertData => {
        this.documentPreviewURL = correspondenceCovertData;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  showActionProperties(dataID: string): void {
    this.correspondenceDetailsService.getDocumentPropertiesURL(dataID).subscribe(
      correspondenceCovertData => {
        this.documentPreviewURL = correspondenceCovertData;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  tranlsateDocument(dataID: string): void {
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = true;
    this.showDistributionTreeArea = false;
    this.correspondenceDetailsService.getDocumentTranslateURL(dataID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  clearTreeParameters() {
    this.showPreviewECMDTreeArea = false;
    this.showDistributionTreeArea = false;
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = false;
    this.currentlyChecked = false;
    this.isSearchResult = false;
    this.CCOUID = [];
    this.CCEID = [];
  }

  showSenderData() {
    this.clearTreeParameters();
    this.showPreviewECMDTreeArea = true;
    this.selectedCaption = 'Sender';
    this.multiSelect = false;
    this.CCOUID = [];
  }

  showRecipientData() {
    this.clearTreeParameters();
    this.showPreviewTreeArea = true;
    this.selectedCaption = 'Recipient';
    this.multiSelect = false;
    this.dataSource.data = this.organizationalChartData;
  }

  showCCData() {
    this.clearTreeParameters();
    this.showPreviewTreeArea = true;
    this.selectedCaption = 'CC';
    this.multiSelect = true;
    this.dataSource.data = this.organizationalChartData;
  }

  showDistributionChart() {
    this.clearTreeParameters();
    this.showDistributionTreeArea = true;
  }

  getOrganizationalChartDetail(): void {
    this.organizationalChartService.getOrgChartInternal()
      .subscribe(OrgChartResponse => {
        const myMap = new Map();
        for (const obj of OrgChartResponse) {
          let orgChartData: organizationalChartModel;
          orgChartData = obj;
          orgChartData.children = [];
          myMap[orgChartData.OUID] = orgChartData;
          const parent = orgChartData.Parent || '-';
          if (!myMap[parent]) {
            myMap[parent] = {
              children: []
            };
          }
          myMap[parent].children.push(orgChartData);
        }
        this.organizationalChartData = myMap['-1'].children;
        // this.treeControl.expand(this.organizationalChartData[0]);
      });
  }

  hasChild = (_number: number, node: organizationalChartModel) => !!node.children && node.children.length > 0;

  getEmplDetail(organizationalChartData: organizationalChartModel): Map<number, organizationalChartEmployeeModel[]> {
    if (!this.isSearchResult) {
      this.showempDetails = false;
      if (this.employeeMap.has(organizationalChartData.OUID)) {
        this.showempDetails = true;
        return this.employeeMap;
      } else {
        // get the List of Employees from an OUID and add to the Map
        this.organizationalChartService.getEmployeeListFromOUID(organizationalChartData.OUID).subscribe(
          emplist => {
            this.employeeMap.set(organizationalChartData.OUID, emplist);
            this.showempDetails = true;
          }, () => { },
          () => {
          }
        );
      }
    }

  }

  getOrgSelectDetail(organizationalChartData: organizationalChartModel) {
    this.showOrgChartData = organizationalChartData;

  }

  addRecipient() {
  }

  // TODO
  searchTreeValue(organizationalChartSearch: string) {
    if (organizationalChartSearch !== '') {
      this.isSearchResult = true;
      if (!this.showEmployees) {
        let filteredData = this.filterData(this.organizationalChartData, function (item) {
          return (item.Name.toLowerCase().indexOf(organizationalChartSearch.toLowerCase()) > -1 || item.Name_AR.toLowerCase().indexOf(organizationalChartSearch.toLowerCase()) > -1);
        });
        filteredData.length ? this.dataSource.data = filteredData : this.cancelSearch();
        this.expandOrgFolders(this.dataSource.data, []);
      } else {
        this.organizationalChartService.fullSearchOUID(organizationalChartSearch).subscribe(
          employees => {
            this.employeeMap = new Map<number, organizationalChartEmployeeModel[]>();
            let OUIDArr = [];

            employees.forEach(element => {
              element.wanted = true;
              if (OUIDArr.indexOf(element.OUID) === -1) {
                OUIDArr.push(element.OUID);
              }
            });

            let filteredData = this.filterData(this.organizationalChartData, function (item) {
              return (item.Name.toLowerCase().indexOf(organizationalChartSearch.toLowerCase()) > -1
                || item.Name_AR.toLowerCase().indexOf(organizationalChartSearch.toLowerCase()) > -1
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
            this._errorHandlerFctsService.handleError(responseError).subscribe();
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

  filterData(data: organizationalChartModel[], predicate) {
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

  searchResult(node: organizationalChartModel) {
    if (this.orgSearch !== '') {
      if (node.Name.toLowerCase().indexOf(this.orgSearch.toLowerCase()) > -1
        || node.Name_AR.toLowerCase().indexOf(this.orgSearch.toLowerCase()) > -1) {
        return true;
      }
    }
    return false;
  }

  expandOrgFolders(data: organizationalChartModel[], Arr): void {
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
          this.getEmplDetail(element);
        }
        this.expandOrgFolders(element.children, Arr);
      });
    }
  }

  cancelSearch() {
    this.dataSource.data = this.organizationalChartData;
    this.isSearchResult = false;
  }

  /***************************************** */

  getSearchValue(value: string) {
    this.value = value;
  }

  selectSinglCheckboxOrg(organizationalChartData: organizationalChartModel, e: MatCheckboxChange) {
    if (this.multiSelect) {
      if (e.checked) {
        if (this.CCOUID.lastIndexOf(organizationalChartData) === -1) {
          this.CCOUID.push(organizationalChartData);
        }
      } else {
        this.CCOUID.splice(this.CCOUID.lastIndexOf(organizationalChartData), 1);
      }
    } else {
      this.currentlyChecked = organizationalChartData;
    }
  }

  selectSinglCheckboxEmp(employeeChartData: organizationalChartEmployeeModel, e: MatCheckboxChange) {
    if (this.multiSelect) {
      if (e.checked) {
        if (this.CCEID.lastIndexOf(employeeChartData) === -1) {
          this.CCEID.push(employeeChartData);
        }
      } else {
        this.CCEID.splice(this.CCEID.lastIndexOf(employeeChartData), 1);
      }
    } else {
      this.currentlyChecked = employeeChartData;
    }
  }

  getSelectedIntDepartment() {
    if (this.selectedCaption === 'Recipient') {
      if (this.currentlyChecked.EID === undefined) {
        this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.OUID, 'IntDepartmentOUID', '').subscribe(
          DepInfo => {
            this.IntRecipientInfo = DepInfo[0];
            this.recipientDetailsForm.get('RecipientDepartment').setValue(DepInfo[0]);
            this.updateRecipientInfo();
          },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          }
        );
      } else {
        this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.EID, 'IntEmployeeEID', '').subscribe(
          EmpInfo => {
            this.IntRecipientInfo = EmpInfo[0];
            this.recipientDetailsForm.get('RecipientDepartment').setValue(EmpInfo[0]);
          },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          }
        );
      }
    } else if (this.selectedCaption === 'CC') {
      this.ccProgbar = true;
      const ccDeetails = this.ccDetailsForm.get('CCDetails') as FormArray;
      let currentArr = new Array();
      ccDeetails.value.forEach(element => {
        currentArr.push(element.DepID);
      });
      const orgArray = new Array();
      this.CCOUID.forEach(function (obj) {
        orgArray.push(obj.OUID);
      });

      const empArray = new Array();
      this.CCEID.forEach(function (obj) {
        empArray.push(obj.EID);
      });

      this.correspondenceDetailsService.getCCUserDetailsSet(orgArray.toString(), empArray.toString(), 'Incoming').subscribe(
        ccDepInfo => {
          for (const obj of ccDepInfo) {
            if (currentArr.indexOf(obj.CCUserID) === -1) {
              this.addCC(obj);
            }
          }
          this.ccProgbar = false;
        }
      );
    }
  }

  uploadCSDocument(files: File[], parentID: number, sectionName: any) {
    // pick from one of the 4 styles of file uploads below
    this.csdocumentupload.uploadDocument(files, '' + parentID).subscribe(
      () => '',
      () => '',
      () => {
        if (sectionName === 'COVER') {
          this.getCoverSection();
        } else if (sectionName === 'ATTACHMENT') {
          this.attachLoaded = false;
          this.getAttachmentSection();
        } else if (sectionName === 'MISC') {
        }
      }
    );
  }

  public dropped(files: NgxFileDropEntry[], parentID: string, section: string) {
    const uploadSession: UploadSession = new UploadSession(files);
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.csdocumentupload.dragandDropUpload(file, parentID).subscribe(
            event => {
              if (event.type === HttpEventType.UploadProgress) {
                this.calcProgressPercent(event, file, uploadSession);
              }
            },
            () => {
              this.progress = 0;
            },
            () => {
              this.progress = 0;
              if (section === 'COVER') {
                this.getCoverSection();
              } else if (section === 'ATTACHMENT') {
                this.attachLoaded = false;
                this.getAttachmentSection();
              } else if (section === 'MISC') {
                // this.GetMiscSection();
              }
            }
          );
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        // console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  calcProgressPercent(event: HttpProgressEvent, file: File, uploadSession: UploadSession) {
    uploadSession.updateProgress(file, event.loaded);
    let progressTemp = Math.round(100 * uploadSession.getTotalLoaded() / uploadSession.getTotalSize());
    // on practice file.size is less than event.total. This prevents to problems of % calculation
    (progressTemp > 100) ? this.progress = 100 : this.progress = progressTemp;
  }

  public fileOver(event) {

  }

  public fileLeave(event) {

  }

  getIDVal(attributeObj: any): string {
    if (typeof attributeObj === 'undefined') {
      return '';
    } else {
      return attributeObj.ID;
    }
  }

  clearDetails(clearFormName: string) {
    switch (clearFormName) {
      case 'senderDetailsForm':
        this.senderDetailsForm.get('ExternalOrganization').setValue('');
        this.senderDetailsForm.get('SenderDepartment').setValue('');
        this.senderDetailsForm.get('SenderName').setValue('');
        this.ExtSenderInfo = new OrgNameAutoFillModel();
        this.body.values.WorkflowForm_1x4x1x93 = null;
        this.body.values.WorkflowForm_1x4x1x80 = null;
        this.body.values.WorkflowForm_1x4x1x88 = '';
        this.correspondenceDetailsForm.get('personalName').setValue('');
        break;
      case 'recipientDetailsForm':
        this.recipientDetailsForm.get('RecipientName').setValue('');
        this.recipientDetailsForm.get('RecipientDepartment').setValue('');
        this.body.values.WorkflowForm_1x4x1x14 = null;
        this.body.values.WorkflowForm_1x4x1x15 = null;
        this.body.values.WorkflowForm_1x4x1x16 = null;
        this.body.values.WorkflowForm_1x4x1x79 = null;
        this.body.values.WorkflowForm_1x4x1x83 = null;
        this.body.values.WorkflowForm_1x4x1x84 = null;
        this.body.values.WorkflowForm_1x4x1x85 = null;
        this.IntRecipientInfo = new OrgNameAutoFillModel();
        break;
      default:
        break;
    }
  }

  openTransferDialog() {
    this.dialog.open(TransferDialogBox, {
      data: this.correspondenceData,
      width: '100%',
      // margin: 'auto',
      panelClass: 'transferDialogBoxClass',
      maxWidth: '85vw'
    })
      .afterClosed().subscribe(result => {
        if (result === 'transfered') {
          this.submitCorrespondenceInfo('SendOn');   // SendOn
        }
      });
  }

  openSendBackDialog() {
    this.dialog.open(SendBackDialogComponent, {
      data: this.body.values.WorkflowForm_1x4x1x96,
      width: '100%',
      panelClass: 'sendBackDialogBoxClass',
      maxWidth: '30vw'
    })
      .afterClosed().subscribe(result => {
        if (result) {
          this.updateReturnReason(result.selectedID, result.selectedDescription, result.comment);
        }
      });
  }

  updateReturnReason(returnReason, returnDescription, comment) {
    this.returnReason = returnReason;
    this.returnComment = comment;
    const CommentObj: CommentsNode = {
      CommentText: returnDescription + ' - ' + comment,
      CreationDate: '',
      CreatorID: '',
      CreatorName_AR: '',
      CreatorName_EN: '',
      Deleted: '',
      ID: '',
      Private: '0',
      ReferenceID: this.VolumeID,
      ReferenceType: 'Workflow',
      ReplyAvailable: '',
      ReplyTo: '',
      Version: '',
      shortComment: '',
    };
    this.insertComment(CommentObj, this.taskID);
  }

  insertComment(CommentObj, taskID) {
    this.correspondenceShareService.setComment(CommentObj, taskID)
      .subscribe(response => {
        this.submitCorrespondenceInfo('SendBack');
      },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  transferTabShowData() {
    this.getTransferHistoryData(this.VolumeID);
  }

  getTransferHistoryData(VolumeID: String): void {
    this.transferProgbar = true;
    this._correspondenceDetailsService.getTransferHistoryTab(VolumeID).subscribe(
      transferhistorytabData => {
        this.transferhistorytabData = transferhistorytabData;
        this.transferProgbar = false;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  toShowWFButtons(taskID: string): any {
    let WFStepsUI: any;
    if (this.CorrespondencType === 'Incoming') {
      WFStepsUI = this.globalConstants.WFStepsUI.Incoming;
    } else if (this.CorrespondencType === 'Outgoing') {
      WFStepsUI = this.globalConstants.WFStepsUI.Outgoing;
    } else if (this.CorrespondencType === 'Internal') {
      WFStepsUI = this.globalConstants.WFStepsUI.Internal;
    }
    let tmpObj: any;
    WFStepsUI.forEach(function (taskObj) {
      if (taskID === taskObj.TaskID) {
        tmpObj = taskObj;
      }
    });
    return tmpObj; 
  }

  SetDisposionsSendOn() {
    const IncomingType = Number(this.globalConstants.FCTS_StepConsole.IncomingType);
    this.body.values.WorkflowForm_1x4x1x75 = 'SendOn'; // Disposition1
    this.body.values.WorkflowForm_1x4x1x76 = ''; // Disposition2

    switch (this.taskID) {
      case '2': // 01 Register Correspondence
        this.body.values.WorkflowForm_1x4x1x75 = 'SendOnAndSkip'; // Disposition1
        this.body.values.WorkflowForm_1x4x1x76 = 'WR2b'; // Disposition2
        if (IncomingType > 1) {
          if (IncomingType === 2) {
            this.skipTaskID = '6';
            this.avoidConfirmDialog('3');
          } else if (IncomingType === 3) { // I can do step 3 - skip and go to step 4
            this.skipTaskID = '18';
            this.avoidConfirmDialog('4');
          } else if (IncomingType === 4) { // I can do step 4 - skip and go to step 5
            this.skipTaskID = '24';
            this.avoidConfirmDialog('5');
          } else if (IncomingType === 5) { // I can do step 5 - skip and go to eva 6
            this.skipTaskID = '18';
            this.avoidConfirmDialog('6');
          }
        }
        break;
      case '4': // 02 Scan Correspondence
      case '7': // 02a Wait External Company
        if (IncomingType > 2) {
          this.body.values.WorkflowForm_1x4x1x75 = 'SendOnAndSkip'; // Disposition1
          this.body.values.WorkflowForm_1x4x1x76 = 'WR2b'; // Disposition2
          if (IncomingType === 3) { // I can do step 3 - skip and go to step 4
            this.skipTaskID = '18';
            this.avoidConfirmDialog('4');
          } else if (IncomingType === 4) { // I can do step 4 - skip and go to step 5
            this.skipTaskID = '24';
            this.avoidConfirmDialog('5');
          } else if (IncomingType === 5) { // I can do step 5 - skip and go to eva 6
            this.skipTaskID = '18';
            this.avoidConfirmDialog('6');
          }
        }
        break;
      case '6': // 03 Index Correspondence
      case '15': // 03a Wait External Company
        if (IncomingType > 3) {
          this.body.values.WorkflowForm_1x4x1x75 = 'SendOnAndSkip'; // Disposition1
          if (IncomingType === 4) { // I can do step 4 - skip and go to step 5
            this.skipTaskID = '24';
            this.avoidConfirmDialog('5');
          } else if (IncomingType === 5) { // I can do step 5 - skip and go to eva 6
            this.skipTaskID = '18';
            this.avoidConfirmDialog('6');
          }
        }
        break;
      case '18': // 04 Check Correspondence
      case '21': // 04a Wait External Company
        if (IncomingType > 4) {
          this.body.values.WorkflowForm_1x4x1x75 = 'SendOnAndSkip'; // Disposition1
          if (IncomingType === 5) { // I can do step 5 - skip and go to eva 6
            this.skipTaskID = '18';
            this.avoidConfirmDialog('6');
          }
        }
        break;
      case '24': // 05 Archive Correspondence
      case '27': // 05a Wait External Company
      case '30': // 06 Dispatch Correspondence
        this.avoidConfirmDialog('0'); // to set DispatchDate and ResponseDueDate
        break;
      case '31':
        const now = new Date();
        this.body.values.WorkflowForm_1x4x1x75 = 'SendOn'; // Disposition1
        this.body.values.WorkflowForm_1x4x1x6 = this.correspondenceShareService.DateToISOStringAbs(now); // AcknowledgementDate
    }
  }

  avoidConfirmDialog(NextID: string) {
    if (NextID !== '0') {
      this.body.values.WorkflowForm_1x4x1x75 = 'SendOnAndSkip'; // Disposition1
      this.body.values.WorkflowForm_1x4x1x76 = 'WR2b';          // Disposition2
      this.body.values.WorkflowForm_1x4x1x77 = NextID;          // Disposition3
      this.checkSkipedValidation();
    }
    if (NextID === '6') {
      const now = new Date();
      const tempDate = new Date();
      const days = 5; // see comment below
      tempDate.setDate(tempDate.getDate() + days);

      this.body.values.WorkflowForm_1x4x1x7 = this.correspondenceShareService.DateToISOStringAbs(now);          // DispatchDate
      this.body.values.WorkflowForm_1x4x1x128 = this.correspondenceShareService.DateToISOStringAbs(tempDate);   // ResponseDueDate
      // !!! NEEDS TO BE CHANGE !!! check with existing solution - ResponseDueDate based on Priority date

    }
  }
  /* checks required fields in case of SendOnAndSkip */
  checkSkipedValidation() {
    this.getUIData(this.skipTaskID, 'SendonAndSkip');
    this.setValidators();
  }

  SetDisposionsSendBack() {
    this.body.values.WorkflowForm_1x4x1x75 = 'SendBack'; // Disposition1
    this.body.values.WorkflowForm_1x4x1x94 = this.returnReason;
    this.body.values.WorkflowForm_1x4x1x95 = this.returnComment;
    switch (this.taskID) {
      case '2': // 01 Register Correspondence
      case '4': // 02 Scan Correspondence
      case '7': // 02a Wait External Company
        this.body.values.WorkflowForm_1x4x1x77 = '1'; // Disposition3
        break;
      case '6': // 03 Index Correspondence
      case '15': // 03a Wait External Company
        this.body.values.WorkflowForm_1x4x1x77 = '2'; // Disposition3
        break;
      case '18': // 04 Check Correspondence
      case '21': // 04a Wait External Company
        this.body.values.WorkflowForm_1x4x1x77 = '3'; // Disposition3
        break;
      case '24': // 05 Archive Correspondence
      case '27': // 05a Wait External Company
        this.body.values.WorkflowForm_1x4x1x77 = '4'; // Disposition3
        break;
      case '30': // 06 Dispatch Correspondence
        this.body.values.WorkflowForm_1x4x1x77 = '5'; // Disposition3
        break;
      case '31': // 07 Retrieve Correspondence
        this.body.values.WorkflowForm_1x4x1x77 = '4'; // Disposition3
        this.body.values.WorkflowForm_1x4x1x96 = '4'; // CorrespondencePhase
        break;
    }
  }

  getInfoDispAudit() {
    /* needs to unify function with Dashboard components
    set only necessary variable  */
    this.stepsInfo.CorrespondenceFlowType = this.CorrespondenceFlowType;
    this.stepsInfo.currTask = Number(this.taskID);
    this.stepsInfo.iterNum = '';
    this.stepsInfo.subWorkID = Number(this.VolumeID);
  }

  setDispAudit(): void {
    // this.notificationmessage.error('Set Disposition1 audit', 'Disposition1 is stored for the custom audit', 2500);
    this.getInfoDispAudit();
    const disposition1 = this.body.values.WorkflowForm_1x4x1x75;
    const setDisp = this.correspondencservice.returnDisp1ForAudit(this.stepsInfo, disposition1);
    this.correspondencservice.setCustomDispositionAudit(this.stepsInfo, setDisp).subscribe(
      response => {
        if (response.toString().trim() === this.stepsInfo.subWorkID.toString()) {
          // DispAudit is set
        } else {
          // this.showMessage('Error withing saving Disposition1 for Correspondence, VolumeID = ' + stepsInfo.subWorkID.toString());
          alert(this.translator.transform('error_saving_disposition1') + this.stepsInfo.subWorkID.toString());
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  setAttachMiscItemsPermiss(FolderID: string | number) {
    // console.log('call service to set subfolder permission');
    const corrDataDetail = {
      locationid: FolderID,
      corrDataID: this.correspondenceData.AttachCorrID,
      TaskID: this.taskID,
      UserID: CSConfig.globaluserid,
      CorrFlowType: this.CorrespondencType
    };

    this._correspondenceDetailsService.setSubfolderPermission(corrDataDetail).subscribe(
      response => {
        this.attachLoaded = true;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }
  showCSCopy(folderID: string) {
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getCopyFromContentServerURL(folderID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }
  loadFolderPageForScan(folderID: string) {
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getFolderBrowse(folderID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }


  LinkedCorrAction(obj) {
    if (obj.hasOwnProperty('action') || obj.hasOwnProperty('dataID')) {
      if (obj.action === 'showActionProperties') {
        this.showActionProperties(obj.dataID);
      } else if (obj.action === 'tranlsateDocument') {
        this.tranlsateDocument(obj.dataID);
      } else if (obj.action === 'getCoverDocumentURL') {
        this.getCoverDocumentURL(obj.dataID);
      }
    }
  }

  // external organization chart functionaliyy
  // get root element
  getECMDRoot(NODEID: number): void {
    this.ECMDMap = new Map();
    this.isSearchResult = false;
    this.isLoading = true;
    this.organizationalChartService.getECMDChart(NODEID).subscribe(
      response => {
        if (response.length > 0) {
          for (const obj of response) {
            let ECMDData: ECMDChartModel;
            ECMDData = obj;
            ECMDData.children = [];
            this.ECMDMap[ECMDData.isCPID ? 'C' + ECMDData.CPID : 'N' + ECMDData.NODEID] = ECMDData;
            const parentNodeID = ECMDData.ParentID ? 'N' + ECMDData.ParentID : '-1';
            const parent = ECMDData.isCPID ? 'C' + ECMDData.pNODEID : parentNodeID;
            if (!this.ECMDMap[parent]) {
              this.ECMDMap[parent] = {
                children: []
              };
            }
            this.ECMDMap[parent].children.push(ECMDData);
          }
          this.dataSourceECMD.data = null;
          this.dataSourceECMD.data = this.ECMDMap['-1'].children;
        } else {
          delete this.ECMDMap[NODEID].children;
          this.dataSourceECMD.data = null;
          this.dataSourceECMD.data = this.ECMDMap['-1'].children;
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => { this.isLoading = false; }
    );
  }
  // build ECPM node elements
  getECMDChart(node: ECMDChartModel): void {
    node.isLoading = true;
    this.organizationalChartService.getECMDChart(node.NODEID).subscribe(
      response => {
        if (response.length > 0) {
          for (const obj of response) {
           
            let ECMDData: ECMDChartModel;
            ECMDData = obj;
            ECMDData.children = [];
            this.ECMDMap[ECMDData.isCPID ? 'C' + ECMDData.CPID : 'N' + ECMDData.NODEID] = ECMDData;
            const parentNodeID = ECMDData.ParentID ? 'N' + ECMDData.ParentID : '-1';
            const parent = ECMDData.isCPID ? 'N' + ECMDData.pNODEID : parentNodeID;

            if (!this.ECMDMap[parent]) {
              this.ECMDMap[parent] = {
                children: []
              };
            }
            this.ECMDMap[parent].children.push(ECMDData);
          }
          this.dataSourceECMD.data = null;
          this.dataSourceECMD.data = this.ECMDMap['-1'].children;
        } else {
          delete this.ECMDMap['N' + node.NODEID].children;
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => { node.isLoading = false; }
    );
  }

  // define action depending on folder/organisation/department
  ECMDTreeOpenAction(node: ECMDChartModel): void {
    if (!this.isSearchResult) {
      if (node.hasOwnProperty('NODEID')) {
        node.isCPID ? this.getECMDChartDepartments(node) : this.getECMDChart(node);
      }
    }
  }

  // build ECPM department elements
  getECMDChartDepartments(node: ECMDChartModel): void {
    node.isLoading = true;
    this.organizationalChartService.getECMDChartDepartments(node.CPID).subscribe(
      response => {
        if (response.length > 0) {
          const myMap = new Map();
          for (const obj of response) {
            let orgChartData: ECMDChartDepartmentModel;
            orgChartData = obj;
            myMap[orgChartData.DEPID] = orgChartData;
            const parent = orgChartData.ParentID || '-1';
            if (!myMap[parent]) {
              myMap[parent] = {
                children: []
              };
            }
            !myMap[parent].hasOwnProperty('children') ? myMap[parent].children = [] : null;
            myMap[parent].children.push(orgChartData);
          }
          this.ECMDMap['C' + node.CPID].children = myMap['-1'].children;
          this.dataSourceECMD.data = null;
          this.dataSourceECMD.data = this.ECMDMap['-1'].children;

        } else {
          delete this.ECMDMap['C' + node.CPID].children;
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => { node.isLoading = false; }
    );
  }

  ECMDhasChild = (_number: number, node: ECMDChartModel) => !!node.children && node.children.length > 0;

  searchCounterParts(value: string) {
    if (value.length > 0) {
      this.isSearchResult = true;
      this.isLoading = true;
      forkJoin(
        this.organizationalChartService.ECMDSearch('searchParentNODES', value),
        this.organizationalChartService.ECMDSearch('searchCounterpart', value),
        this.organizationalChartService.ECMDSearch('searchDepartment', value)
      )
        .subscribe(
          ([res1, res2, res3]) => {
            this.buildECMDChart(res1.concat(res2, res3));
          },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          });
    } else {
      this.getECMDRoot(0);
    }
  }
  // build ECMD chart for search
  buildECMDChart(nodes) {
    if (nodes.length > 0) {
      const myMap = new Map();
      for (const obj of nodes) {
        let ECMDData: any;
        ECMDData = obj;
        if (ECMDData.hasOwnProperty('NODEID')) {
          if (ECMDData.isCPID) {
            myMap['C' + ECMDData.CPID] = ECMDData;
          } else {
            myMap['N' + ECMDData.NODEID] = ECMDData;
          }
        } else {
          myMap['D' + ECMDData.DEPID] = ECMDData;
        }
        //myMap[ECMDData.isCPID ? ECMDData.CPID : ECMDData.NODEID] = ECMDData;
        let parentID;
        let parentPrefix;
        if (ECMDData.hasOwnProperty('NODEID')) {
          if (ECMDData.isCPID) {
            parentID = ECMDData.pNODEID;
            parentPrefix = 'N';
          } else {
            parentID = ECMDData.ParentID;
            parentPrefix = 'N';
          }
        } else {
          parentID = ECMDData.ParentID ? ECMDData.ParentID : ECMDData.CPID;
          parentPrefix = ECMDData.ParentID ? 'D' : 'C';
        }
        const parent = parentID ? parentPrefix + parentID : '-1';
        if (!myMap[parent]) {
          myMap[parent] = {
            children: []
          };
        }
        !myMap[parent].hasOwnProperty('children') ? myMap[parent].children = [] : null;
        myMap[parent].children.push(ECMDData);
      }
      this.dataSourceECMD.data = null;
      this.dataSourceECMD.data = myMap['-1'].children;
    }
    this.isLoading = false;
    this.expandFolders(this.dataSourceECMD.data);
  }
  // expand all elements after search
  expandFolders(data: any): void {
    if (data.length > 0) {
      data.forEach(element => {
        if (element.hasOwnProperty('children')) {
          this.expandFolders(element.children);
        }
        element.NODEID > 0 ? this.treeControlECMD.expand(element) : null;
      });
    }
  }
  // define node type
  ecmdTreeType(node: any): string {
    if (node.hasOwnProperty('NODEID')) {
      if (node.isCPID) {
        return 'counterpart';
      } else {
        return 'folder';
      }
    } else {
      return 'department';
    }
  }
  // on node click function
  selectECMD(node: any): void {
    if (['counterpart', 'department'].indexOf(this.ecmdTreeType(node)) > -1) {
      this.currentlyChecked = node;
    } else {
      this.currentlyChecked = false;
    }
  }


  getSelectedECMD(name: string) {
    if (this.currentlyChecked.hasOwnProperty('NODEID')) {
      this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.CPID, 'ExtOrganizationID', '').subscribe(
        response => {
          this.ExtSenderInfo = response[0];
          this.ExtSenderInfo.Name_En = name;
          if (this.selectedCaption === 'Sender') {
            this.senderDetailsForm.get('ExternalOrganization').setValue(response[0]);
            this.updateSenderInfo();
          } else if (this.selectedCaption === 'Recipient') {
            this.recipientDetailsForm.get('ExternalOrganization').setValue(response[0]);
            this.updateRecipientInfo();
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
    } else if (this.currentlyChecked.hasOwnProperty('DEPID')) {
      this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.DEPID, 'ExtDepartmentID', '').subscribe(
        response => {
          this.ExtSenderInfo = response[0];
          this.ExtSenderInfo.Name_En = name;
          if (this.selectedCaption === 'Sender') {
            this.senderDetailsForm.get('ExternalOrganization').setValue(response[0]);
            this.updateSenderInfo();
          } else if (this.selectedCaption === 'Recipient') {
            this.recipientDetailsForm.get('ExternalOrganization').setValue(response[0]);
            this.updateRecipientInfo();
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
    }
  }

  getInitials(nodename: string) {
    return nodename.slice(0, 1).length > 0 ? nodename.slice(0, 1).toUpperCase() : 'A';
  }
  // ECMD functionality finish

  distributionOutputAction(): void {
    this.submitCorrespondenceInfo('SendOn');
  }

  editFile(nodeID: number, sectionName: string): void {
    const closeMe = '&uiType=2&nextURL=http%3A%2F%2F' + FCTSDashBoard.CSUrlShort + FCTSDashBoard.CloseMe;
    const url = this.CSUrl + '?func=Edit.Edit&nodeid=' + nodeID + closeMe;
    const EditDocWindow: any = window.open(url, '_blank');
    let iterations = 0;
    const interval = setInterval(() => {
      iterations++;
      if (EditDocWindow.closed) {
        if (sectionName === 'COVER') {
          this.getCoverSection();
        } else if (sectionName === 'ATTACHMENT') {
          this.attachLoaded = false;
          this.getAttachmentSection();
        } else if (sectionName === 'MISC') {
        }
        clearInterval(interval);
      }
      if (iterations > 10) {
        clearInterval(interval);
      }
    }, 1000);
  }

deleteDocument(documentDataid: string, section: string) {
  this.csdocumentupload.deleteDocument(documentDataid).subscribe(
      () => { },
      () => { },
      () => {
          if (section === 'COVER') {
              this.coverID = undefined;
              this.getCoverSection();
          } else if (section === 'ATTACHMENT') {
              this.attachLoaded = false;
              this.getAttachmentSection();
          } else if (section === 'MISC') {
              // this.GetMiscSection();
          }
      }
  );
}

openBrowseDocument(event: any, elementID: string) {
  event.preventDefault();
  const element: HTMLElement = document.getElementById(elementID) as HTMLElement;
  element.click();
}

addDocumentVersion(files: File[], documentDataid: number, sectionName: any) {
  this.csdocumentupload.uploadDocumentVersion(files, '' + documentDataid).subscribe(
      () => '',
      () => '',
      () => {
          if (sectionName === 'COVER') {
              this.getCoverSection();
          } else if (sectionName === 'ATTACHMENT') {
              this.attachLoaded = false;
              this.getAttachmentSection();
          } else if (sectionName === 'MISC') {
          }
      }
  );
}

}
