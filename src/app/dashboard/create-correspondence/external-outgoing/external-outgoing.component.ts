import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { OrgNameAutoFillModel, CCUserSetModel, ColUserSetModel, SyncDocumentMetadataModel, TemplateModel, TableStructureParameters } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { OrganizationalChartService } from 'src/app/dashboard/services/organizationalChart.service';
import { organizationalChartModel, organizationalChartEmployeeModel, ECMDChartModel, ECMDChartDepartmentModel } from 'src/app/dashboard/models/organizational-Chart.model';
import { Location } from '@angular/common'
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree'
import { Observable, forkJoin } from 'rxjs';
import { FCTSDashBoard } from '../../../../environments/environment';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { MatOptionSelectionChange, MatCheckboxChange } from '@angular/material';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { DocumentPreview } from '../../services/documentpreview.model';
import { CorrespondenceWFFormModel } from '../../models/CorrepondenceWFFormModel';
import { NotificationService } from '../../services/notification.service';
import { BaseCorrespondenceComponent } from '../../base-classes/base-correspondence-csactions/base-correspondence.component';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { CSDocumentUploadService } from '../../services/CSDocumentUpload.service';
import { ActivatedRoute } from '@angular/router';
import { RecipientDetailsData, SenderDetailsData } from '../../services/correspondence-response.model';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { multiLanguageTranslator,multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MultipleApproveComponent, MultipleApproveInputData, CurrentApprovers } from 'src/app/dashboard/shared-components/multiple-approve/multiple-approve.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import { MatDialog } from '@angular/material';
import { SelectTeamDialogComponent } from '../../dialog-boxes/select-team-dialog/select-team-dialog.component';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';



@Component({
  selector: 'new-external-outgoing',
  templateUrl: './external-outgoing.component.html',
  styleUrls: ['./external-outgoing.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})


export class ExternalOutgoing extends BaseCorrespondenceComponent implements OnInit, AfterViewInit {


  corrFlowType: string = 'Outgoing';
  workspaceTemplateID:number=646304;
  workspaceFolderID:number=673145;

  basehref: String = FCTSDashBoard.BaseHref;
  CSUrl: String = FCTSDashBoard.CSUrl;
  expandedRightAction: boolean = true;
  expandedAction: boolean = true;

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
  colDetailsForm: FormGroup;
  ColDetails: FormArray;

  submitted = false;
  CorrespondenceType: string;
  MetadataFilters: any[];
  documentPreviewURL: DocumentPreview[];
  selectedCaption: string;
  multiSelect: boolean;
  currentlyChecked: any = false;
  currentlyCheckedStatus: boolean;
  showPreviewCoverLetter: boolean;
  showTemplatePreview: boolean;

  treeControl = new NestedTreeControl<organizationalChartModel>(node => node.children);
  dataSource = new MatTreeNestedDataSource<organizationalChartModel>();

  showEmployees = false;

  organizationalChartData: organizationalChartModel[];
  showEmplChartData: organizationalChartModel;
  showOrgChartData: organizationalChartModel;
  showPreviewTreeArea = false;
  orgSearch: string;

  percentDone: number;
  uploadSuccess: boolean;

  initiateOutgoingCorrespondenceDetails = new CorrespondenceWFFormModel;
  parentIncomingCorrespondenceDetails = new CorrespondenceWFFormModel;

  showGeneratebarcodeButton: boolean = true;
  showSendOnButton: boolean = false;


  CCOUID: organizationalChartModel[] = [];
  CCEID: organizationalChartEmployeeModel[] = [];

  barcodeNumberToPrint: string = "";
  barcodeDate: string = "";
  initiatorMailroomPrivelage: number = 0;
  searchVal: string = '';
  ccProgbar = false;
  colProgBar = false;
  showempDetails: boolean = false;
  employeeMap = new Map<number, organizationalChartEmployeeModel[]>();
  employeeForOUID: organizationalChartEmployeeModel[] = [];

  // 

  showTemplateArea: boolean = false;

  templateLanguage: string;
  documentMetadataSync = new SyncDocumentMetadataModel;
  showCommentsTextArea: boolean = false;
  spinnerDataLoaded: boolean = false;

  VolumeID: string;
  action: string;
  parentLocationID: string;

  correspondenceParentSenderDetails: SenderDetailsData;

  @Input() data: number;
  @Output() focusOut: EventEmitter<number> = new EventEmitter<number>();
  viewNoteStatus;
  activeRowItem: any;
  editMode: any;

  // ECMD VAR
  dataSourceECMD = new MatTreeNestedDataSource<any>();
  treeControlECMD = new NestedTreeControl<any>(node => node.children);
  isSearchResult = false;
  isLoading = false;
  showPreviewECMDTreeArea = false;
  ECMDMap = new Map();

  // temlete types
  templateTypes: TemplateModel[];

  // multi approve parameters
  approve: MultipleApproveInputData;
  @ViewChild(MultipleApproveComponent) multiApprove;
  confidential = false;
  // sendeer tbl structure
  correspondenceSenderDetailsData: SenderDetailsData;
  teamID: number = null;
  teamsList: SenderDetailsData[];
  senderTableStructureFull: TableStructureParameters[] = [
    { 'columnDef': 'OrganizationName', 'columnName': this.translator.transform('organization'), 'priority': 2 },
    { 'columnDef': 'DepartmentName', 'columnName': this.translator.transform('department'), 'priority': 1 },
    { 'columnDef': 'DepartmentNativeName', 'columnName': this.translator.transform('on_behalf'), 'priority': 3 },
    { 'columnDef': 'Name', 'columnName': this.translator.transform('name'), 'priority': 1 },
  ];
  senderTableStructure: TableStructureParameters[];
  senderTableStructureDetails: TableStructureParameters[];
  senderColWidth: number;
  senderIconWidth: number;
  senderIconWidthConst = 5;
  @ViewChild('senderContainer') senderContainer: ElementRef;

  constructor(private _location: Location,
    private organizationalChartService: OrganizationalChartService,
    private formBuilder: FormBuilder,
    private correspondencservice: CorrespondenceService,
    private notificationmessage: NotificationService,
    public csdocumentupload: CSDocumentUploadService,
    public correspondenceDetailsService: CorrespondenceDetailsService,
    private route: ActivatedRoute,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private appLoadConstService: AppLoadConstService,
    public translatorService: multiLanguageTranslator,
    public translator: multiLanguageTranslatorPipe,
    public dialog: MatDialog,
    private correspondenceShareService: CorrespondenceShareService) {
    super(csdocumentupload, correspondenceDetailsService);
  }
  ngOnInit() {

    this.VolumeID = this.route.snapshot.queryParamMap.get('VolumeID');
    this.parentLocationID = this.route.snapshot.queryParamMap.get('locationid');
    this.action = this.route.snapshot.queryParamMap.get('action');



    //Get Logged in user Information
    this.getSenderUserInfromation(0);
    this.getOrganizationalChartDetail();
    this.getMetadataFilters();
    this.getECMDRoot(0);
    this.getTeams();


    this.senderDetailsForm = this.formBuilder.group({
      SenderInfo: ['', Validators.required]
    });

    this.recipientDetailsForm = this.formBuilder.group({
      ExternalOrganization: ['', Validators.required],
      RecipientDepartment: [],
      RecipientName: []
    });

    this.ccDetailsForm = this.formBuilder.group({
      CCDetails: this.formBuilder.array([])
    });

    this.colDetailsForm = this.formBuilder.group({
      ColDetails: this.formBuilder.array([])
    });

    this.correspondenceDetailsForm = this.formBuilder.group({
      regDate: new FormControl({ value: new Date().toLocaleDateString(), disabled: true }),
      priority: [],
      confidential: [],
      personalName: [],
      idNumber: [],
      correspondenceType: [],
      obType: [],
      arabicSubject: ['', Validators.required],
      englishSubject: ['', Validators.required],
      projectCode: [],
      budgetNumber: [],
      contractNumber: [],
      tenderNumber: [],
      fillinPlanPath: [],
      dispatchMethod: [],
      staffNumber: []
    });

    this.filteredExtOrgNames = this.recipientDetailsForm.get('ExternalOrganization').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value =>
          this.correspondenceDetailsService.searchFieldForAutoFill(value, 'ExtOrganization', '')
        )
      );
     

  }
  ngAfterViewInit() {
    this.getWorkspaceDetails(this.workspaceTemplateID,this.workspaceFolderID);
    // this.getTempFolderAttachments(this.corrFlowType);

    if (this.VolumeID != '' && this.VolumeID != undefined) {
      switch (this.action) {
        case 'reply':
          this.setreplyCorrespondence();
          break;
      }
    }

  }

  getMetadataFilters(): void {
    this.correspondencservice
      .getDashboardFilters()
      .subscribe(
        (MetadataFilters: any[]) => {
          this.MetadataFilters = MetadataFilters;
          this.SetDefaultPriority();
        }
      );
  }
  SetDefaultPriority() {
    this.correspondenceDetailsForm.get('priority').setValue({ EN: 'Normal', ID: 1, AR: 'Normal' });
  }
  public optionSelectionChangeExternal(orgInfo: OrgNameAutoFillModel, event: MatOptionSelectionChange) {
    this.ExtSenderInfo = orgInfo;
  }
  public optionSelectionChangeInternal(DepInfo: OrgNameAutoFillModel, event: MatOptionSelectionChange) {
    this.IntRecipientInfo = DepInfo;
  }
  displaySearchFilterValueExt(searchList: OrgNameAutoFillModel) {

    if (searchList) { return searchList.OrgName_En; }
  }
  displaySearchFilterValueInt(searchList: OrgNameAutoFillModel) {
    if (searchList) {
      return searchList.DepName_En + (searchList.SecName_En != null ? (',' + searchList.SecName_En) : "")
    }
  }


  expandeActionRightButton() {
    this.expandedRightAction = !this.expandedRightAction;
  }
  expandeActionLeftButton() {
    this.expandedAction = !this.expandedAction;
  }
  backNavigation() {
    this._location.back()
  }

  get f() { return this.correspondenceDetailsForm.controls; }
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.correspondenceDetailsForm.invalid) {
      return;
    }
  }
  displayFn(attribute?: any): string | undefined {
    return attribute ? attribute.EN : undefined;
  }

  refreshCoverSection() {
    this.getCoverSection();
  }
  refreshAttachmentSection() {
    this.getAttachmentSection();
  }
  getCoverDocumentURL(CoverID: String): void {
    this.showPreviewTreeArea = false;
    this.showTemplateArea = false;
    this.showTemplatePreview = false;    
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getDocumentURL(CoverID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  getPreviewTemplateURL(CoverID: string,version:string): void {
    this.showPreviewTreeArea = false;
    this.showTemplateArea = false;
    this.showPreviewCoverLetter = false;
    this.showTemplatePreview = true;
  
    // Call getTemplateID and switch to getPreviewTemplateURL when done
    this.correspondenceDetailsService
      .getPreviewTemplateID(CoverID,version)
      .pipe(
        switchMap(templateid => {
          // Use the templateID to call getPreviewTemplateURL
          return this.correspondenceDetailsService.getPreviewTemplateURL(CoverID,templateid);
        })
      )
      .subscribe(correspondenceCoverData => {
        this.documentPreviewURL = correspondenceCoverData;
      });
  }

  showActionProperties(dataID: string): void {
    this.showPreviewTreeArea = false;
    this.showTemplateArea = false;
    this.showTemplatePreview = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getDocumentPropertiesURL(dataID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  clearTreeParameters() {
    this.showPreviewECMDTreeArea = false;
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = false;
    this.showTemplateArea = false;
    this.showTemplatePreview = false; 
    this.currentlyChecked = false;
    this.isSearchResult = false;
    this.CCOUID = [];
    this.CCEID = [];
  }

  showSenderData() {
    this.clearTreeParameters();
    this.showPreviewTreeArea = true;
    this.selectedCaption = 'Sender';
    this.multiSelect = false;
    this.dataSource.data = this.organizationalChartData;
  }
  showRecipientData() {
    this.clearTreeParameters();
    this.showPreviewECMDTreeArea = true;
    this.selectedCaption = 'Recipient';
    this.dataSource.data = this.organizationalChartData;
  }
  showCCData() {
    this.clearTreeParameters();
    this.showPreviewTreeArea = true;
    this.selectedCaption = 'CC';
    this.multiSelect = true;
    this.dataSource.data = this.organizationalChartData;
  }

  showCollaboartorData() {
    this.clearTreeParameters();
    this.showPreviewTreeArea = true;
    this.selectedCaption = 'Collaboration';
    this.multiSelect = true;
    this.dataSource.data = this.organizationalChartData;
  }

  showMultiAppData() {
    this.clearTreeParameters();
    this.showPreviewTreeArea = true;
    this.selectedCaption = 'Approver';
    this.multiSelect = false;
    this.dataSource.data = this.organizationalChartData;
  }

  showTemplateSection() {
    debugger;
    this.clearTreeParameters();
    this.showTemplateArea = true;
    this.getTemplatesSectionData(this.corrFlowType, 'Default', '');
    this.LoadTemplateFilter('Template_Type');
  }
  getOrganizationalChartDetail(): void {
    this.organizationalChartService.getOrgChartInternal()
      .subscribe(OrgChartResponse => {
        let myMap = new Map();
        for (let obj of OrgChartResponse) {
          let orgChartData: organizationalChartModel;
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
        this.organizationalChartData = myMap['-1'].children;
        //this.treeControl.expand(this.organizationalChartData[0]);        
      });
  }
  hasChild = (_number: number, node: organizationalChartModel) => !!node.children && node.children.length > 0;
  getEmplDetail(organizationalChartData: organizationalChartModel): Map<number, organizationalChartEmployeeModel[]> {
    this.showempDetails = false;
    if (this.employeeMap.has(organizationalChartData.OUID)) {
      this.showempDetails = true;
      return this.employeeMap;
    }
    else {
      //get the List of Employees from an OUID and add to the Map
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
  getOrgSelectDetail(organizationalChartData: organizationalChartModel) {
    this.showOrgChartData = organizationalChartData;
  }
  addRecipient() {
  }

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
    this.searchVal = value;
  }
  selectSinglCheckboxOrg(organizationalChartData: organizationalChartModel, e: MatCheckboxChange) {
    if (this.multiSelect) {
      if (e.checked) {
        if (this.CCOUID.lastIndexOf(organizationalChartData) === -1) {
          this.CCOUID.push(organizationalChartData);
        }
      }
      else {
        this.CCOUID.splice(this.CCOUID.lastIndexOf(organizationalChartData), 1);
      }
    }
    else {
      this.currentlyChecked = organizationalChartData;
    }
  }
  selectSinglCheckboxEmp(employeeChartData: organizationalChartEmployeeModel, e: MatCheckboxChange) {

    if (this.multiSelect) {
      if (e.checked) {
        if (this.CCEID.lastIndexOf(employeeChartData) === -1) {
          this.CCEID.push(employeeChartData);
        }
      }
      else {
        this.CCEID.splice(this.CCEID.lastIndexOf(employeeChartData), 1);
      }
    }
    else {
      this.currentlyChecked = employeeChartData;
    }
  }

  getSelectedIntDepartment() {
    if (this.selectedCaption === 'Recipient') {
      if (this.currentlyChecked.EID === undefined) {
        this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.OUID, 'IntDepartmentOUID', '').subscribe(
          DepInfo => {
            this.IntRecipientInfo = DepInfo[0]
            this.recipientDetailsForm.get('RecipientDepartment').setValue(DepInfo[0])
          }
        )
      }
      else {
        this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.EID, 'IntEmployeeEID', '').subscribe(
          EmpInfo => {
            this.IntRecipientInfo = EmpInfo[0]
            this.recipientDetailsForm.get('RecipientDepartment').setValue(EmpInfo[0])
          }
        )
      }
    }
    else if (this.selectedCaption === 'CC') {
      this.ccProgbar = true;
      const ccDeetails = this.ccDetailsForm.get('CCDetails') as FormArray;
      let currentArr = new Array();
      ccDeetails.value.forEach(element => {
        currentArr.push(element.DepID);
      });
      let orgArray = new Array();
      this.CCOUID.forEach(function (obj) {
        orgArray.push(obj.OUID);
      });

      let empArray = new Array();
      this.CCEID.forEach(function (obj) {
        empArray.push(obj.EID);
      });

      this.correspondenceDetailsService.getCCUserDetailsSet(orgArray.toString(), empArray.toString(), this.corrFlowType).subscribe(
        ccDepInfo => {
          for (let obj of ccDepInfo) {
            if (currentArr.indexOf(obj.CCUserID) === -1) {
              this.addCC(obj);
            }
          }
          this.ccProgbar = false;
        }

      )

    }
    else if (this.selectedCaption === 'Collaboration') {
      this.colProgBar = true;
      const colDetails = this.colDetailsForm.get('ColDetails') as FormArray;
      let currentArr = new Array();
      colDetails.value.forEach(element => {
        currentArr.push(element.UserColl_User);
      });

      let empArray = new Array();
      this.CCEID.forEach(function (obj) {
        empArray.push(obj.EID);
      });

      this.correspondenceDetailsService.getCollUserDetailsSet(empArray.toString(), this.corrFlowType).subscribe(
        colEmpInfo => {
          for (let obj of colEmpInfo) {
            if (currentArr.indexOf(obj.UserColl_User) === -1) {
              this.addCollaboator(obj);
            }
          }
          this.colProgBar = false;
        }
      );
    } else if (this.selectedCaption === 'Approver') {
      this.multiApprove.setPMData(this.currentlyChecked);
    }
  }

  validateCorrespondenceForm(): boolean {
    let isValid = false;
    if (this.correspondenceDetailsForm.invalid) {
      this.notificationmessage.warning('Correspondence details missing', this.translator.transform('mandatory_corr_details'), 3000);
      return isValid;
    }
    if (this.senderDetailsForm.invalid) {
      this.notificationmessage.warning('Sender is missing', this.translator.transform('add_user_to_FCTS_org_user_list'), 3000);
      return isValid;
    }
    if (this.recipientDetailsForm.invalid) {
      this.notificationmessage.warning('Recipient Information Missing', this.translator.transform('select_recipient_for_this_corr'), 3000);
      return isValid;
    }
    if (this.coverID == null || this.coverID == undefined) {
      this.notificationmessage.warning('Cover ID Missing', this.translator.transform('upload_cover_letter'), 3000);
      return isValid;
    }
    return true;
  }

  initiateWFCorrespondence(Disposition1: string, Disposition2: string, Dispostion3: string) {
    this.spinnerDataLoaded = true;
    //Set each and every Value ofr the three Forms to one Single Object For Post
    this.initiateOutgoingCorrespondenceDetails.CorrespondenceID = this.corrFolderData.AttachCorrID.toString();
    this.initiateOutgoingCorrespondenceDetails.SenderDetails = this.correspondenceSenderDetailsData;

    this.initiateOutgoingCorrespondenceDetails.RecipientDetails = this.recipientDetailsForm.get('ExternalOrganization').value;
    this.initiateOutgoingCorrespondenceDetails.RecipientName = this.recipientDetailsForm.get('RecipientName').value;

    this.initiateOutgoingCorrespondenceDetails.CCSet = this.ccDetailsForm.get('CCDetails').value;
    this.initiateOutgoingCorrespondenceDetails.UserCollSet = this.colDetailsForm.get('ColDetails').value;

    this.initiateOutgoingCorrespondenceDetails.ArabicSubject = this.correspondenceDetailsForm.get('arabicSubject').value;
    this.initiateOutgoingCorrespondenceDetails.EnglishSubject = this.correspondenceDetailsForm.get('englishSubject').value;

    this.initiateOutgoingCorrespondenceDetails.DocumentType = this.getIDVal(this.correspondenceDetailsForm.get('obType').value);
    this.initiateOutgoingCorrespondenceDetails.ProjectCode = this.correspondenceDetailsForm.get('projectCode').value;
    this.initiateOutgoingCorrespondenceDetails.BudgetNumber = this.correspondenceDetailsForm.get('budgetNumber').value;
    this.initiateOutgoingCorrespondenceDetails.TenderNumber = this.correspondenceDetailsForm.get('tenderNumber').value;
    this.initiateOutgoingCorrespondenceDetails.ContractNumber = this.correspondenceDetailsForm.get('contractNumber').value;
    this.initiateOutgoingCorrespondenceDetails.FillingFilePlanPath = this.getIDVal(this.correspondenceDetailsForm.get('fillinPlanPath').value);
    this.initiateOutgoingCorrespondenceDetails.StaffNumber = this.correspondenceDetailsForm.get('staffNumber').value;
    this.initiateOutgoingCorrespondenceDetails.Confidential = this.correspondenceDetailsForm.get('confidential').value;

    this.initiateOutgoingCorrespondenceDetails.Disposition1 = Disposition1;
    this.initiateOutgoingCorrespondenceDetails.Disposition2 = Disposition2;
    this.initiateOutgoingCorrespondenceDetails.Disposition3 = Dispostion3;

    this.initiateOutgoingCorrespondenceDetails.CorrespondenceType2 = this.getIDVal(this.correspondenceDetailsForm.get('correspondenceType').value);
    this.initiateOutgoingCorrespondenceDetails.CoverID = this.coverID;
    this.initiateOutgoingCorrespondenceDetails.TemplateLanguage = this.templateLanguage;

    this.initiateOutgoingCorrespondenceDetails.UserCollSet.forEach(element => {
      element.UserColl_DueDate = this.correspondenceShareService.DateToISOStringAbs(element.UserColl_DueDate);
    });

    this.multiApproversDataSave();

    this.correspondencservice.initiateWF(this.initiateOutgoingCorrespondenceDetails, this.corrFlowType).subscribe(
      () => {
        this.spinnerDataLoaded = false;
        this.notificationmessage.success('Correspondence Created Succesfully', this.translator.transform('correpondence_created_sucessfully'), 2500);
        this.backNavigation();
      }

    );
  }

  getIDVal(attributeObj: any): string {
    if (typeof attributeObj === 'undefined' || attributeObj === null) {
      return '';
    }
    else {
      return attributeObj.ID;
    }
  }
  SendOnWF(action: string) {
    if (action === 'SendOn') {
      if (this.validateCorrespondenceForm() && this.multiApprove.approversValidation()) {
        this.initiateWFCorrespondence('SendOn', '', '');
      }
    }
    else if (action === 'Save') {
      if (this.validateCorrespondenceForm() && this.multiApprove.approversValidation()) {
        this.initiateWFCorrespondence('Save', '', '');
      }
    }
    else if (action === 'StartCollaboration' && this.multiApprove.approversValidation()) {
      if (this.validateCorrespondenceForm()) {
        this.initiateWFCorrespondence('StartCollaboration', '', '');
      }
    }
  }


  clearDetails(clearFormName: string) {
    switch (clearFormName) {
      case 'senderDetailsForm':
        this.senderDetailsForm.get('ExternalOrganization').setValue('');
        this.senderDetailsForm.get('SenderDepartment').setValue('');
        this.senderDetailsForm.get('SenderName').setValue('');
        this.ExtSenderInfo = new OrgNameAutoFillModel();
        break;
      case 'recipientDetailsForm':
        this.recipientDetailsForm.get('ExternalOrganization').setValue('');
        this.recipientDetailsForm.get('SenderDepartment').setValue('');
        this.recipientDetailsForm.get('SenderName').setValue('');
        this.ExtSenderInfo = new OrgNameAutoFillModel();
      default:
        break;
    }
  }

  //CC Actions
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



  //Collaboration Actions
  addCollaboator(depDetails: ColUserSetModel): void {
    this.ColDetails = this.colDetailsForm.get('ColDetails') as FormArray;
    this.ColDetails.push(this.createNewCollaboator(depDetails));

  }
  createNewCollaboator(empDetails: ColUserSetModel): FormGroup {
    return this.formBuilder.group({
      UserColl_User: empDetails.UserColl_User,
      UserColl_Type: empDetails.UserColl_Type,
      UserColl_Purpose: empDetails.UserColl_Purpose,
      UserColl_Priority: empDetails.UserColl_Priority,
      UserColl_DueDate: empDetails.UserColl_DueDate,
      UserColl_Notes: empDetails.UserColl_Notes,
      UserColl_FurtherAction: empDetails.UserColl_FurtherAction,
      UserColl_Status: empDetails.UserColl_Status,
      Name_EN: empDetails.Name_EN,
      Name_AR: empDetails.Name_AR,
      DepartmentName_EN: empDetails.DepartmentName_EN,
      DepartmentName_AR: empDetails.DepartmentName_AR,
      Purpose_EN: empDetails.Purpose_EN,
      Purpose_AR: empDetails.Purpose_AR,
      Status_EN: empDetails.Status_EN,
      Status_AR: empDetails.Status_AR
    });
  }

  removeCollaboator(index: number) {
    this.ColDetails = this.colDetailsForm.get('ColDetails') as FormArray;
    this.ColDetails.removeAt(index);
  }

  confidentialChange(e: MatCheckboxChange) {
    this.confidential = e.checked;
  }

  importLettertoCoverFolder(templateDataID: string, language: string) {
    //Check Child Count    
    if (this.coverID == undefined || this.coverID == null) {
      const newFileName = this.corrFlowType + ' ' + 'Cover Template';
      this.csdocumentupload.copyDocToCoverFolder(templateDataID, this.corrFolderData.AttachCorrCoverID, newFileName).subscribe(
        response => {          
          this.coverID = response.data.properties.id;
          this.setLanguage(language)
        },
        () => { },
        () => {
          this.syncCoverData();
        }
      );
    }
    else {
      this.notificationmessage.warning('Cover Document Already Available', this.translator.transform('delete_existing_doc'), 2500);
    }
  }
  setLanguage(language: string) {
    switch (language.toUpperCase()) {
      case 'ENGLISH':
        this.templateLanguage = 'EN';
        break;
      case 'ARABIC':
        this.templateLanguage = 'AR';
        break;

    }
  }

  getTeams() {
    this.correspondenceDetailsService.getTeams(null, true)
      .subscribe(
        response => {
          if (response.hasOwnProperty('myRows')) {
            this.teamsList = response.myRows;
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  selectTeamDialogBox(): void {
    const dialogRef = this.dialog.open(SelectTeamDialogComponent, {
      width: '100%',
      panelClass: 'select-team-dialog',
      maxWidth: '30vw',
      //maxHeight: '60vh',
      data: {
        teamsList: this.teamsList,
        teamID: this.teamID
      }
    }).afterClosed().subscribe(result => {
      if (result && result !== 'Cancel') {
        this.correspondenceSenderDetailsData = result;
        this.senderDetailsForm.get('SenderInfo').setValue(this.correspondenceSenderDetailsData);
        this.teamID = this.correspondenceSenderDetailsData.TeamID > 0 ? this.correspondenceSenderDetailsData.TeamID : null;
        this.setMultiApproveParameters(this.teamID, true);
        if (this.coverID) {
          this.syncCoverData();
        }
      }
    });
  }


  getSenderUserInfromation(maxApproveLevel: number): void {
    const UserID = this.appLoadConstService.getConstants().general.UserID;
    this.correspondenceDetailsService.getCorrespondenceSenderDetails('', this.corrFlowType, true, UserID, maxApproveLevel)
      .subscribe(correspondenceSenderDetailsData => {
        if (correspondenceSenderDetailsData[0].myRows && correspondenceSenderDetailsData[0].myRows.length > 0) {
          this.correspondenceSenderDetailsData = correspondenceSenderDetailsData[0].myRows[0];
          this.senderDetailsForm.get('SenderInfo').setValue(this.correspondenceSenderDetailsData);
          this.displayColumnsForm(this.senderContainer.nativeElement.clientWidth);
          if (maxApproveLevel > 0 && this.coverID) {
            this.syncCoverData();
          }
        }
      });
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
    this.senderIconWidth = this.senderTableStructureDetails.length > 0 ? this.senderIconWidthConst : 0;
    this.senderColWidth = Math.floor((100 - this.senderIconWidth) / senderTableLength);
  }

  onResized(event: ResizedEvent) {
    this.displayColumnsForm(event.newWidth);
  }

  syncCoverData() {
    this.documentMetadataSync.docFolderID = this.corrFolderData.AttachCorrCoverID.toString();
    this.documentMetadataSync.srcDocID = this.coverID;
    if (this.templateLanguage === 'EN') {

      this.documentMetadataSync.SenderOrganization = this.convertUndefindedOrNulltoemptyString(this.correspondenceSenderDetailsData.OrganizationName_EN)
      this.documentMetadataSync.SenderDepartment = this.convertUndefindedOrNulltoemptyString(this.correspondenceSenderDetailsData.DepartmentName_EN)
      this.documentMetadataSync.SenderName = this.convertUndefindedOrNulltoemptyString(this.correspondenceSenderDetailsData.Name_EN)
      let recipientDetails: OrgNameAutoFillModel = this.recipientDetailsForm.get('ExternalOrganization').value;
      this.documentMetadataSync.RecipientOrganization = this.convertUndefindedOrNulltoemptyString(recipientDetails.OrgName_En)
      this.documentMetadataSync.RecipientDepartment = this.convertUndefindedOrNulltoemptyString(recipientDetails.DepName_En) + (this.convertUndefindedOrNulltoemptyString(recipientDetails.SecName_En) ? "," + this.convertUndefindedOrNulltoemptyString(recipientDetails.SecName_En) : "");
      this.documentMetadataSync.RecipientRole = this.convertUndefindedOrNulltoemptyString(recipientDetails.RoleName_En)
      this.documentMetadataSync.RecipientName = this.convertUndefindedOrNulltoemptyString(this.recipientDetailsForm.get('RecipientName').value)
      this.documentMetadataSync.DATE = this.convertUndefindedOrNulltoemptyString(this.correspondenceDetailsForm.get('regDate').value)
      this.documentMetadataSync.SUBJECT = this.convertUndefindedOrNulltoemptyString(this.correspondenceDetailsForm.get('englishSubject').value)
      this.documentMetadataSync.Fax=this.convertUndefindedOrNulltoemptyString(recipientDetails.FaxNumber);

    }
    else if (this.templateLanguage === 'AR') {

      this.documentMetadataSync.SenderOrganization = this.convertUndefindedOrNulltoemptyString(this.correspondenceSenderDetailsData.OrganizationName_AR)
      this.documentMetadataSync.SenderDepartment = this.convertUndefindedOrNulltoemptyString(this.correspondenceSenderDetailsData.DepartmentName_AR)
      this.documentMetadataSync.SenderName = this.convertUndefindedOrNulltoemptyString(this.correspondenceSenderDetailsData.Name_AR)
      let recipientDetails: OrgNameAutoFillModel = this.recipientDetailsForm.get('ExternalOrganization').value
      this.documentMetadataSync.RecipientOrganization = this.convertUndefindedOrNulltoemptyString(recipientDetails.OrgName_Ar)
      this.documentMetadataSync.RecipientDepartment = this.convertUndefindedOrNulltoemptyString(recipientDetails.DepName_Ar) + (this.convertUndefindedOrNulltoemptyString(recipientDetails.SecName_Ar) ? "," + this.convertUndefindedOrNulltoemptyString(recipientDetails.SecName_Ar) : "");
      this.documentMetadataSync.RecipientRole = this.convertUndefindedOrNulltoemptyString(recipientDetails.RoleName_Ar)
      this.documentMetadataSync.RecipientName = this.convertUndefindedOrNulltoemptyString(this.recipientDetailsForm.get('RecipientName').value)
      this.documentMetadataSync.DATE = this.convertUndefindedOrNulltoemptyString(this.correspondenceDetailsForm.get('regDate').value)
      this.documentMetadataSync.SUBJECT = this.convertUndefindedOrNulltoemptyString(this.correspondenceDetailsForm.get('arabicSubject').value)
      this.documentMetadataSync.Fax=this.convertUndefindedOrNulltoemptyString(recipientDetails.FaxNumber);
    }

    this.correspondenceDetailsService.syncDocumentMetadata(this.documentMetadataSync)
      .subscribe(
        () => { },
        () => { },
        () => {
          this.getCoverSection();
          this.getCoverDocumentURL(this.coverID);
        }
      );
  }

  previewTemplate(){
    this.getPreviewTemplateURL(this.coverID,this.version);
  }

  viewLastNote(selectItemRow: number) {
    this.activeRowItem = selectItemRow;
    this.editMode = false;
  }
  closeLastNote(selectItemRow: number) {
    // this.ColDetails = this.colDetailsForm.get('ColDetails') as FormArray;    
    // let currentNoteValue = this.ColDetails.value[selectItemRow].UserColl_Notes;
    // if (currentNoteValue != null || currentNoteValue != undefined) {
    //   this.insertNewNote(currentNoteValue, selectItemRow);
    // }
    this.activeRowItem = ' ';
    this.editMode = false;
  }

  viewLastNoteEdit(editItem) {
    this.editMode = true;
  }

  insertNewNote(notesVal: string, selectItemRow: number) {
    this.correspondenceDetailsService.insertCorrNotes(notesVal).subscribe(
      (resultVal) => {
        this.ColDetails = this.colDetailsForm.get('ColDetails') as FormArray;
        this.ColDetails.value[selectItemRow].UserColl_Notes = resultVal.NotesID;
      },
      () => { },
      () => { }
    );
  }

  showCommentsTextAreaSection() {
    this.showCommentsTextArea = true;
  }
  CloseCommentsSection() {
    this.showCommentsTextArea = false;
  }
  SaveComments(Comments: string) {

  }

  setreplyCorrespondence() {   
    let connectiontype = 3;
    let copy = 'false';
    let referencetype = 'Correspondence';
    let connectedtype = 'Correspondence';
    this.setConnection(this.parentLocationID, connectiontype, referencetype, connectedtype, this.corrFlowType, copy);
  }
  setConnection(connectedid, connectiontype, referenceType, connectedtype, flowType, copy) {

    //WRInsertConnection
    this.correspondenceDetailsService.setConnectionn(connectedid, connectiontype,
      referenceType, connectedtype, CSConfig.globaluserid, '1').subscribe(
        (resultVal) => {
          this.initiateOutgoingCorrespondenceDetails.ConnectedRefID = resultVal[0].ID;
          this.initiateOutgoingCorrespondenceDetails.ConnectedID = connectedid;
          this.getParentCorrespondenceSenderDetails();
          this.getParentCorrespondenceMetadataDetails();
        }

      );


  }

  getParentCorrespondenceMetadataDetails() {
    this.correspondenceDetailsService.getCorrespondenceMetadataDetails(this.VolumeID).subscribe(
      corrDetailsMetadata => {
        this.parentIncomingCorrespondenceDetails = corrDetailsMetadata[0];
        this.setReplyMetadata();
      }
    )

  }
  getParentCorrespondenceSenderDetails(): void {
    this.correspondenceDetailsService
      .getCorrespondenceSenderDetails(this.VolumeID, 'Incoming', false, '', 0)
      .subscribe(
        correspondenceSenderDetailsData => {
          if ((typeof correspondenceSenderDetailsData[0].myRows !== 'undefined') && correspondenceSenderDetailsData[0].myRows.length > 0) {

            this.correspondenceParentSenderDetails = correspondenceSenderDetailsData[0].myRows[0];
            this.recipientDetailsForm.get('RecipientName').setValue(this.correspondenceParentSenderDetails.Name_EN);
            this.recipientDetailsForm.get('RecipientDepartment').setValue(this.correspondenceParentSenderDetails.DepartmentName_EN);
            this.recipientDetailsForm.get('ExternalOrganization').setValue({ OrgName_En: this.correspondenceParentSenderDetails.OrganizationName_EN, OrgName_Ar: this.correspondenceParentSenderDetails.OrganizationName_AR, OrgID: this.correspondenceParentSenderDetails.ExternalOrganization });
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }
  setReplyMetadata() {
    this.correspondenceDetailsForm.get('arabicSubject').setValue(this.parentIncomingCorrespondenceDetails.ArabicSubject);
    this.correspondenceDetailsForm.get('englishSubject').setValue(this.parentIncomingCorrespondenceDetails.EnglishSubject);
    this.correspondenceDetailsForm.get('projectCode').setValue(this.parentIncomingCorrespondenceDetails.ProjectCode);
    this.correspondenceDetailsForm.get('budgetNumber').setValue(this.parentIncomingCorrespondenceDetails.BudgetNumber);
    this.correspondenceDetailsForm.get('tenderNumber').setValue(this.parentIncomingCorrespondenceDetails.TenderNumber);
    this.correspondenceDetailsForm.get('contractNumber').setValue(this.parentIncomingCorrespondenceDetails.ContractNumber);
    this.correspondenceDetailsForm.get('correspondenceType').setValue(this.setDropDownValue('CorrespondenceType',
      this.parentIncomingCorrespondenceDetails.CorrespondenceType2));
  }

  setDropDownValue(Attrname: string, ID: string): any {
    if (ID == undefined || ID === '' || ID === '0') {
      return '';
    } else {
      let obj: any = {};
      this.MetadataFilters.forEach(element => {
        if (element.AttrName === Attrname && element.ID === ID) {
          obj.EN = element.Name_EN;
          obj.AR = element.Name_EN;
          obj.ID = element.ID;
        }
      });
      return obj;
    }
  }
  showCSCopy(folderID: string) {
    this.showPreviewTreeArea = false;
    this.showTemplatePreview = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getCopyFromContentServerURL(folderID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }
  loadFolderPageForScan(folderID: string) {
    this.showPreviewTreeArea = false;
    this.showTemplatePreview = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getFolderBrowse(folderID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  LinkedCorrAction(obj) {
    if (obj.hasOwnProperty('action') || obj.hasOwnProperty('dataID')) {
      if (obj.action === 'showActionProperties') {
        this.showActionProperties(obj.dataID);
      } else if (obj.action === 'tranlsateDocument') {
        //this.tranlsateDocument(obj.dataID);
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
            this.senderDetailsForm.get('SenderDepartment').setValue(this.ExtSenderInfo.DepName_En);
            this.senderDetailsForm.get('SenderName').setValue(this.ExtSenderInfo.Name_En);
          } else if (this.selectedCaption === 'Recipient') {
            this.recipientDetailsForm.get('ExternalOrganization').setValue(response[0]);
            this.recipientDetailsForm.get('RecipientDepartment').setValue(this.ExtSenderInfo.DepName_En);
            this.recipientDetailsForm.get('RecipientName').setValue(this.ExtSenderInfo.Name_En);
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
            this.senderDetailsForm.get('SenderDepartment').setValue(this.ExtSenderInfo.DepName_En);
            this.senderDetailsForm.get('SenderName').setValue(this.ExtSenderInfo.Name_En);
          } else if (this.selectedCaption === 'Recipient') {
            this.recipientDetailsForm.get('ExternalOrganization').setValue(response[0]);
            this.recipientDetailsForm.get('RecipientDepartment').setValue(this.ExtSenderInfo.DepName_En);
            this.recipientDetailsForm.get('RecipientName').setValue(this.ExtSenderInfo.Name_En);
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
  // template types
  LoadTemplateFilter(type: string): void {
    if (!this.templateTypes && this.corrFlowType === 'Outgoing') {
      this.correspondenceDetailsService.LoadTemplateFilter(type)
        .subscribe(
          response => {
            this.templateTypes = response;
          },
          responseError => {
            this._errorHandlerFctsService.handleError(responseError).subscribe();
          }
        );
    }
  }

  CorrTypesSelectChange(type): void {
    this.getTemplatesSectionData(this.corrFlowType, type.value, '');
  }

  // getTempFolderAttachments(corrflowType: string): void {
  //   this.correspondenceDetailsService.createTempAttachments(corrflowType).subscribe(
  //     tempAttachment => {
  //       this.corrFolderData = tempAttachment;
  //       this.setMultiApproveParameters(null, false);
  //     }
  //   );
  // }

  getWorkspaceDetails(workspaceTemplateID:number,workspaceFolderID:number): void {
    //debugger;
    this.correspondenceDetailsService.createWorkspace(workspaceTemplateID,workspaceFolderID).pipe(
      switchMap((workspaceID: number) => {
        return this.correspondenceDetailsService.getWorkspaceSubFolderID(workspaceID);
      })
    ).subscribe(
      (response:any) => {
        // Initialize variables
        this.corrFolderData.AttachCorrID = response.AttachCorrID;
        const idAndNameArray = response.idAndNameArray;
        this.setMultiApproveParameters(null, false);

  
        // Extract and assign the id values from the idAndNameArray
        if (idAndNameArray && idAndNameArray.length === 3) {
          this.corrFolderData.AttachCorrCoverID = idAndNameArray[0].id;
          this.corrFolderData.AttachCorrAttachmentsID = idAndNameArray[1].id;
          this.corrFolderData.AttachCorrMiscID = idAndNameArray[2].id;
        } else {
          console.error('Invalid');
        }
      },
      (error) => {
        // Handle any errors here
        console.error('Error', error);
      }
    );
  }

  setMultiApproveParameters(teamID: number, changeTeam: boolean) {
    const getStructure = teamID > 0 ? false : true;
    const getTeamStructure = !getStructure;
    this.approve = {
      UserID: this.appLoadConstService.getConstants().general.UserID,
      CorrID: this.corrFolderData.AttachCorrID.toString(),
      mainLanguage: this.translatorService.lang,
      TeamID: teamID,
      fGetStructure: getStructure,
      fGetTeamStructure: getTeamStructure,
      fInitStep: true,
      fChangeTeam: changeTeam,
      VolumeID: '',
      taskID: '',
      selectApproverStep: '12',
      approveStep: '14',
      selectFinalApproverStep: '16',
      approveAndSignStep: '17'
    };
  }


  multiApproversDataSave() {
    this.multiApproversFormFill(this.multiApprove.getCurrentApprovers(false));
    this.multiApprove.setMultiApprovers();
  }

  multiApproversFormFill(approversObj: CurrentApprovers) {
    if (approversObj.minLevel) {
      //this.initiateOutgoingCorrespondenceDetails.Disposition2 = 'MultiApprove';
      this.initiateOutgoingCorrespondenceDetails.SkipHOSSecratory = approversObj.minLevel.ApproveLevel === 1 ?
        'true' : approversObj.minLevel.SkipSecretary.toString();
      if (this.initiateOutgoingCorrespondenceDetails.SkipHOSSecratory) {
        this.initiateOutgoingCorrespondenceDetails.HeadOfSection = approversObj.minLevel.ApproveLevel === 1 ?
          approversObj.minLevel.ApproverID.ID : approversObj.minLevel.ApproverID;;
      } else {
        this.initiateOutgoingCorrespondenceDetails.HeadOfSection = null;
      }
      this.initiateOutgoingCorrespondenceDetails.HeadOfSectionSecretary = approversObj.minLevel.SecretaryGroupID.toString();
      this.initiateOutgoingCorrespondenceDetails.HeadOfSectionRequired = 'Yes';
    } else {
      //this.initiateOutgoingCorrespondenceDetails.Disposition2 = ' ';
      this.initiateOutgoingCorrespondenceDetails.HeadOfSectionRequired = 'No';
    }
    this.initiateOutgoingCorrespondenceDetails.SkipDeptSecratory = approversObj.maxLevel.ApproveLevel === 1 ?
      'true' : approversObj.maxLevel.SkipSecretary.toString();
    if (this.initiateOutgoingCorrespondenceDetails.SkipDeptSecratory) {
      this.initiateOutgoingCorrespondenceDetails.SigningAuthority = approversObj.maxLevel.ApproveLevel === 1 ?
        approversObj.maxLevel.ApproverID.ID : approversObj.maxLevel.ApproverID;
    } else {
      this.initiateOutgoingCorrespondenceDetails.SigningAuthority = null;
    }
    this.initiateOutgoingCorrespondenceDetails.SigningAuthoritySecretary = approversObj.maxLevel.SecretaryGroupID.toString();
  }
}