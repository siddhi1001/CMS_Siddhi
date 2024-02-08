import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { OrgNameAutoFillModel, CCUserSetModel, TableStructureParameters } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { OrganizationalChartService } from 'src/app/dashboard/services/organizationalChart.service';
import { organizationalChartModel, organizationalChartEmployeeModel, ECMDChartModel, ECMDChartDepartmentModel } from 'src/app/dashboard/models/organizational-Chart.model';
import { Location } from '@angular/common';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
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
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';




@Component({
  selector: 'new-external-incoming',
  templateUrl: './external-incoming.component.html',
  styleUrls: ['./external-incoming.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})


export class ExternalIncoming extends BaseCorrespondenceComponent implements OnInit, AfterViewInit {

  basehref: String = FCTSDashBoard.BaseHref;
  CSUrl: String = FCTSDashBoard.CSUrl;
  expandedRightAction = true;
  expandedAction = true;
  workspaceTemplateID:number=674152;
  workspaceFolderID:number=671002;

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


  documentPreviewURL: DocumentPreview[];

  selectedCaption: string;
  multiSelect: boolean;
  currentlyChecked: any = false;
  currentlyCheckedStatus: boolean;
  showPreviewCoverLetter: boolean;

  treeControl = new NestedTreeControl<organizationalChartModel>(node => node.children);
  dataSource = new MatTreeNestedDataSource<organizationalChartModel>();

  showEmployees = false;

  organizationalChartData: organizationalChartModel[];
  showEmplChartData: organizationalChartModel;
  showOrgChartData: organizationalChartModel;
  showPreviewTreeArea = false;
  orgSearch: string;
  //
  percentDone: number;
  uploadSuccess: boolean;


  //
  initiateIncomingCorrespondenceDetails = new CorrespondenceWFFormModel;

  showGeneratebarcodeButton: boolean = true;
  showSendOnButton: boolean = false;


  CCOUID: organizationalChartModel[] = [];
  CCEID: organizationalChartEmployeeModel[] = [];

  barcodeNumberToPrint = '';
  barcodeDate = '';
  initiatorMailroomPrivelage = 0;
  searchVal = '';
  ccProgbar = false;
  showempDetails = false;

  employeeMap = new Map<number, organizationalChartEmployeeModel[]>();
  employeeForOUID: organizationalChartEmployeeModel[] = [];
  spinnerDataLoaded: boolean = false;
  // ECMD VAR
  dataSourceECMD = new MatTreeNestedDataSource<any>();
  treeControlECMD = new NestedTreeControl<any>(node => node.children);
  isSearchResult = false;
  isLoading = false;
  showPreviewECMDTreeArea = false;
  ECMDMap = new Map();
  // sendeer tbl structure
  senderTableStructureFull: TableStructureParameters[] = [
    { 'columnDef': 'OrganizationName', 'columnName': this.translator.transform('organization'), 'priority': 1 },
    { 'columnDef': 'DepartmentName', 'columnName': this.translator.transform('department'), 'priority': 1 },
    { 'columnDef': 'Name', 'columnName': this.translator.transform('name'), 'priority': 2 },
  ];
  senderTableStructure: TableStructureParameters[];
  senderTableStructureDetails: TableStructureParameters[];
  senderColWidth: number;
  senderIconWidth: number;
  senderIconWidthConst = 4;
  @ViewChild('senderContainer') senderContainer: ElementRef;


  constructor(private _location: Location,
    private organizationalChartService: OrganizationalChartService, private formBuilder: FormBuilder,
    private correspondencservice: CorrespondenceService,
    private notificationmessage: NotificationService,
    public csdocumentupload: CSDocumentUploadService,
    public correspondenceDetailsService: CorrespondenceDetailsService,
    public translatorService: multiLanguageTranslator,
    public translator: multiLanguageTranslatorPipe,
    private _errorHandlerFctsService: ErrorHandlerFctsService) {
    super(csdocumentupload, correspondenceDetailsService);
  }
  ngOnInit() {
    // Get Logged in user Information
    this.getUserInfo();
    this.getOrganizationalChartDetail();
    this.getMetadataFilters();
    this.getECMDRoot(0);

    this.senderDetailsForm = this.formBuilder.group({
      ExternalOrganization: ['', Validators.required],
      SenderDepartment: [],
      SenderName: []
    });

    this.recipientDetailsForm = this.formBuilder.group({
      RecipientID: [],
      RecipientUserID: [],
      RecipientVersion: [],
      RecipientType: [],
      RecipientDepartment: ['', Validators.required],
      RecipientSection: [],
      RecipientName: []
    });

    this.ccDetailsForm = this.formBuilder.group({
      CCDetails: this.formBuilder.array([])
    });

    this.correspondenceDetailsForm = this.formBuilder.group({
      regDate: new FormControl({ value: new Date().toLocaleDateString(), disabled: true }),
      docsDate: [''],
      confidential: [''],
      priority: [''],
      refNumber: ['', Validators.required],
      personalName: [''],
      idNumber: [''],
      correspondenceType: [''],
      baseType: [''],
      arabicSubject: [''],
      englishSubject: [''],
      projectCode: [''],
      budgetNumber: [''],
      contractNumber: [''],
      tenderNumber: [''],
      corrNumber: new FormControl({ value: '', disabled: true }),
      fillinPlanPath: [''],
      dispatchMethod: [''],
      staffNumber: ['']
    });


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

  ngAfterViewInit() {
    this.getWorkspaceDetails(this.workspaceTemplateID,this.workspaceFolderID);
    // this.getTempFolderAttachments('Incoming');
    this.getUserMailroomPrivvelage();
  }

  getMetadataFilters(): void {
    this.correspondencservice
      .getDashboardFilters()
      .subscribe(
        (MetadataFilters) => {
          this.MetadataFilters = MetadataFilters
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
      return searchList.DepName_En + (searchList.SecName_En != null ? (',' + searchList.SecName_En) : '');
    }
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
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getDocumentURL(CoverID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  showActionProperties(dataID: string): void {
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getDocumentPropertiesURL(dataID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }
  tranlsateDocument(dataID: string): void {
    this.showPreviewTreeArea = false;
    this.showPreviewCoverLetter = true;
    this.correspondenceDetailsService.getDocumentTranslateURL(dataID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  clearTreeParameters() {
    this.showPreviewECMDTreeArea = false;
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
          }
        );
      } else {
        this.correspondenceDetailsService.searchFieldForAutoFillOUID(this.currentlyChecked.EID, 'IntEmployeeEID', '').subscribe(
          EmpInfo => {
            this.IntRecipientInfo = EmpInfo[0];
            this.recipientDetailsForm.get('RecipientDepartment').setValue(EmpInfo[0]);
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

  GenerateBarcode() {
    if (this.correspondenceDetailsForm.invalid) {
      this.notificationmessage.warning('Correspondence details missing',this.translator.transform('mandatory_corr_details'), 2500);
    } else if (this.senderDetailsForm.invalid) {
      this.notificationmessage.warning('Sender information missing', this.translator.transform('mandatory_sender_info'), 2500);
    } else if (this.recipientDetailsForm.invalid) {
      this.notificationmessage.warning('Recipient infomration missing', this.translator.transform('mandatory_recipient_info'), 2500);
    } else {
      this.correspondenceDetailsService.getCorredpondenceBarcode(this.corrFolderData.AttachCorrID, 'Incoming', new Date().getFullYear()).subscribe(
        barcodeVal => {
          this.correspondenceDetailsForm.get('corrNumber').setValue(barcodeVal.CorrespondenceCode);
          this.barcodeNumberToPrint = barcodeVal.CorrespondenceCode;
          this.barcodeDate = new Date().toLocaleDateString();
          this.showSendOnButtons();
        }
      );
    }
  }

  initiateWFCorrespondence(Disposition1: string, Disposition2: string, Dispostion3: string) {

    if (this.correspondenceDetailsForm.invalid) {
      this.notificationmessage.warning('Correspondence details missing', this.translator.transform('mandatory_corr_details'), 2500);
    } else if (this.senderDetailsForm.invalid) {
      this.notificationmessage.warning('Sender information missing', this.translator.transform('mandatory_sender_info'), 2500);
    } else if (this.recipientDetailsForm.invalid) {
      this.notificationmessage.warning('Recipient infomration missing', this.translator.transform('mandatory_recipient_info'), 2500);
    }
    else {
      this.spinnerDataLoaded = true;
      //Set each and every Value ofr the three Forms to one Single Object For Post
      this.initiateIncomingCorrespondenceDetails.CorrespondenceDate = this.correspondenceDetailsForm.get('regDate').value;
      this.initiateIncomingCorrespondenceDetails.Confidential = this.correspondenceDetailsForm.get('confidential').value;
      this.initiateIncomingCorrespondenceDetails.ConnectedID = '';
      this.initiateIncomingCorrespondenceDetails.ConnectedRefID = '';
      this.initiateIncomingCorrespondenceDetails.CorrespondenceID = '' + this.corrFolderData.AttachCorrID;
      this.initiateIncomingCorrespondenceDetails.CorrespondenceCode = this.correspondenceDetailsForm.get('corrNumber').value;
      this.initiateIncomingCorrespondenceDetails.SenderDetails = this.senderDetailsForm.get('ExternalOrganization').value;
      this.initiateIncomingCorrespondenceDetails.RecipientDetails = this.recipientDetailsForm.get('RecipientDepartment').value;
      this.initiateIncomingCorrespondenceDetails.SenderName = '';
      this.initiateIncomingCorrespondenceDetails.RecipientName = '';
      this.initiateIncomingCorrespondenceDetails.CCSet = '';
      this.initiateIncomingCorrespondenceDetails.Disposition1 = Disposition1;
      this.initiateIncomingCorrespondenceDetails.Disposition2 = Disposition2;
      this.initiateIncomingCorrespondenceDetails.Disposition3 = Dispostion3;
      this.initiateIncomingCorrespondenceDetails.CoverID = '' + this.coverID;
      this.initiateIncomingCorrespondenceDetails.ArabicSubject = this.correspondenceDetailsForm.get('arabicSubject').value;
      this.initiateIncomingCorrespondenceDetails.EnglishSubject = this.correspondenceDetailsForm.get('englishSubject').value;
      this.initiateIncomingCorrespondenceDetails.CoverDate = this.correspondenceDetailsForm.get('docsDate').value;
      this.initiateIncomingCorrespondenceDetails.DocumentNumber = this.correspondenceDetailsForm.get('refNumber').value;
      this.initiateIncomingCorrespondenceDetails.Priority = this.getIDVal(this.correspondenceDetailsForm.get('priority').value);
      this.initiateIncomingCorrespondenceDetails.CorrespondenceType2 = this.getIDVal(this.correspondenceDetailsForm.get('correspondenceType').value);
      this.initiateIncomingCorrespondenceDetails.IDNumber = this.correspondenceDetailsForm.get('idNumber').value;
      this.initiateIncomingCorrespondenceDetails.BaseType = this.getIDVal(this.correspondenceDetailsForm.get('baseType').value);
      this.initiateIncomingCorrespondenceDetails.ProjectCode = this.correspondenceDetailsForm.get('projectCode').value;
      this.initiateIncomingCorrespondenceDetails.BudgetNumber = this.correspondenceDetailsForm.get('budgetNumber').value;
      this.initiateIncomingCorrespondenceDetails.CommitmentNumber = '';
      this.initiateIncomingCorrespondenceDetails.TenderNumber = this.correspondenceDetailsForm.get('tenderNumber').value;
      this.initiateIncomingCorrespondenceDetails.CompanyRegistrationNumber = '';
      this.initiateIncomingCorrespondenceDetails.ContractNumber = this.correspondenceDetailsForm.get('contractNumber').value;
      this.initiateIncomingCorrespondenceDetails.StaffNumber = this.correspondenceDetailsForm.get('staffNumber').value;
      this.initiateIncomingCorrespondenceDetails.CorrespondencePurpose = '';
      this.initiateIncomingCorrespondenceDetails.TemplateLanguage = '';
      this.initiateIncomingCorrespondenceDetails.FillingFilePlanPath = this.getIDVal(this.correspondenceDetailsForm.get('fillinPlanPath').value);
      this.initiateIncomingCorrespondenceDetails.CorrespondenceFlowType = '1';
      this.initiateIncomingCorrespondenceDetails.CorrespondenceYear = '' + new Date().getFullYear();
      this.initiateIncomingCorrespondenceDetails.DocumentType = '';
      this.initiateIncomingCorrespondenceDetails.CorrespondenceDueDate = '';
      this.initiateIncomingCorrespondenceDetails.HeadOfSectionRequired = '';
      this.initiateIncomingCorrespondenceDetails.CorrespondencePhase = '';
      this.initiateIncomingCorrespondenceDetails.CCSet = this.ccDetailsForm.get('CCDetails').value;

      this.correspondencservice.initiateWF(this.initiateIncomingCorrespondenceDetails, 'Incoming').subscribe(
        () => {
          this.spinnerDataLoaded = false;
          this.notificationmessage.success('Correspondence Created Succesfully',this.translator.transform('correpondence_created_sucessfully'), 2500);
          this.backNavigation();
        }

      );
    }
  }

  getIDVal(attributeObj: any): string {
    if (typeof attributeObj === 'undefined') {
      return '';
    } else {
      return attributeObj.ID;
    }

  }

  showSendOnButtons() {
    this.showGeneratebarcodeButton = false;
    this.showSendOnButton = true;
  }

  SendOnWF(action: string) {
    if (action === 'SENDON') {

      if (this.initiatorMailroomPrivelage > 1) {
        switch (this.initiatorMailroomPrivelage) {
          case 2:
            // Disposition1 SendOnAndSkip
            // Disposition3  3
            this.initiateWFCorrespondence('SendOnAndSkip', 'WR2b', '3');
            break;
          case 3:
            // Disposition1 SendOnAndSkip
            // Disposition3  4
            this.initiateWFCorrespondence('SendOnAndSkip', 'WR2b', '4');
            break;
          case 4:
            // Disposition1 SendOnAndSkip
            // Disposition3  5
            this.initiateWFCorrespondence('SendOnAndSkip', 'WR2b', '5');
            break;
          case 5:
            // Disposition1 SendOnAndSkip
            // Disposition3  6
            if (this.coverID !== '' && this.coverID != undefined) {
              this.initiateWFCorrespondence('SendOnAndSkip', 'WR2b', '6');
            } else {
              this.notificationmessage.warning('Cover Document Manadatory', this.translator.transform('upload_cover_document'), 2500);
            }

            break;
        }
      } else {
        this.initiateWFCorrespondence('SendOn', '', '2b');
      }
    } else if (action === 'SAVE') {
      this.initiateWFCorrespondence('Save', '', '1');
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
        this.recipientDetailsForm.get('RecipientID').setValue('');
        this.recipientDetailsForm.get('RecipientUserID').setValue('');
        this.recipientDetailsForm.get('RecipientVersion').setValue('');
        this.recipientDetailsForm.get('RecipientType').setValue('');
        this.recipientDetailsForm.get('RecipientDepartment').setValue('');
        this.recipientDetailsForm.get('RecipientSection').setValue('');
        this.recipientDetailsForm.get('RecipientName').setValue('');
        this.IntRecipientInfo = new OrgNameAutoFillModel();
        break;
      default:
        break;
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

  getUserMailroomPrivvelage() {
    this.correspondenceDetailsService.getCurrentUserMailroomPrivelage().subscribe(
      mailroomuserprivelage => {
        this.initiatorMailroomPrivelage = Number(mailroomuserprivelage.usermailroomprivelage);
      }
    );
  }
  showSpinner() {
    this.spinnerDataLoaded = true;
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
            this.senderDetailsForm.get('SenderDepartment').setValue(this.ExtSenderInfo.DepName_En);
            this.senderDetailsForm.get('SenderName').setValue(this.ExtSenderInfo.Name_En);
          } else if (this.selectedCaption === 'Recipient') {
            this.recipientDetailsForm.get('ExternalOrganization').setValue(response[0]);
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

  // flex sender section
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

}
