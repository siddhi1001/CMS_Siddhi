import { Location } from '@angular/common';
import { Component, Inject, OnInit, Pipe, PipeTransform, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { FCTSDashBoard } from '../../../../environments/environment';
import { CorrespondenenceDetailsModel, TableStructureParameters } from '../../models/CorrespondenenceDetails.model';
import { StatusRequest } from '../../models/Shared.model';
import { CorrResponse } from '../../services/correspondence-response.model';
import { DocumentPreview } from '../../services/documentpreview.model';
import { AppLoadConstService } from 'src/app/app-load-const.service';

import { ShowButtons } from './correspondence-show-buttons';
import { ShowSections } from './correspondence-show-sections';
import { TransferDialogBox } from './correspondence-transfer-dialog/correspondence-transfer-dialog.component';
import { MessageDialogComponent } from '../../dialog-boxes/message-dialog/message-dialog.component';
import { CompleteDialogComponent } from '../../dialog-boxes/complete-dialog/complete-dialog.component';
import { TransferReplyDialogComponent } from '../../dialog-boxes/transfer-reply-dialog/transfer-reply-dialog.component';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MultipleApproveComponent, MultipleApproveInputData } from 'src/app/dashboard/shared-components/multiple-approve/multiple-approve.component';
import { DistributionComponent } from 'src/app/dashboard/shared-components/distribution/distribution.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';



@Component({
  selector: 'app-correspondence-detail',
  templateUrl: './correspondence-detail.component.html',
  styleUrls: ['./correspondence-detail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class CorrespondenceDetailComponent implements OnInit {
  private _globalConstants = this._appLoadConstService.getConstants();

  constructor(
    private _correspondenceDetailsService: CorrespondenceDetailsService
    , private _correspondenceShareService: CorrespondenceShareService
    , private _errorHandlerFctsService: ErrorHandlerFctsService
    , private route: ActivatedRoute
    , public dialog: MatDialog
    , private _location: Location
    , private _appLoadConstService: AppLoadConstService
    ,public translatorService: multiLanguageTranslator
    ,public translator: multiLanguageTranslatorPipe) {
  }

  basehref: String = FCTSDashBoard.BaseHref;
  CSUrl: String = FCTSDashBoard.CSUrl;
  VolumeID: string;
  CoverID: string;
  locationid: string;
  CorrespondencType: string;
  taskID: string;
  CorrespondenceFolderName: Observable<any>;
  transID: string;
  onbehalfUserid: string;
  panelOpenState = false;
  correspondenceData: CorrespondenenceDetailsModel;
  correspondenceRecipientDetailsData: CorrResponse[];
  correspondenceSenderDetailsData: CorrResponse[];
  correspondenceCCtData: CorrResponse[];
  correspondenceCovertData: CorrResponse[];
  correspondenceAttachmentsData: CorrResponse[];
  correspondenceCollaborationDetail: CorrResponse[];
  corrConnectionsData: CorrResponse[];
  expanded = true;
  expandedAction = true;
  expandedRightAction = true;
  documentPreviewURL: DocumentPreview[];
  correspondenceMetadata: CorrResponse[];
  transferhistorytabData: CorrResponse[];
  CorrAttachTransDetail: CorrResponse[];
  correspondenceCommentsDetail: CorrResponse[];
  messageDialogBox: MessageDialogComponent;
  // Progress icons per Tab
  ccProgbar = false;
  correspondenceProgbar = false;
  coverProgbar = false;
  recipientProgbar = false;
  senderProgbar = false;
  attachmentsProgbar = false;
  transferProgbar = false;
  userCollaborationProgbar = false;
  commentsProgbar = true;
  openedSubComment = false;
  openedComment = false;
  openedSubReplies = false;
  corrConnectionsProgbar = false;
  sectionDisplay = new ShowSections();
  buttonsDisplay = new ShowButtons(this._appLoadConstService);
  correspondenceTabLoaded = false;
  // multi approve parameters
  approve: MultipleApproveInputData;
  @ViewChild(MultipleApproveComponent) multiApprove;
  @ViewChild(DistributionComponent) distributionSection;
  // distribution
  showPreviewCoverLetter = true;
  showDistributionTreeArea = false;
  // sendeer tbl structure
  senderTableStructureFull: TableStructureParameters[] = [
    { 'columnDef': 'OrganizationName', 'columnName': 'Organization', 'priority': 1 },
    { 'columnDef': 'DepartmentName', 'columnName': 'Department', 'priority': 1 },
    { 'columnDef': 'DepartmentNativeName', 'columnName': 'On Behalf', 'priority': 2 },
    { 'columnDef': 'Name', 'columnName': 'Name', 'priority': 1 },
  ];
  senderTableStructure: TableStructureParameters[];
  senderTableStructureDetails: TableStructureParameters[];
  senderColWidth: number;
  senderIconWidth: number;
  senderIconWidthConst = 5;
  @ViewChild('senderContainer') senderContainer: ElementRef;

  ngOnInit() {
    this.VolumeID = this.route.snapshot.queryParamMap.get('VolumeID');
    this.CoverID = this.route.snapshot.queryParamMap.get('CoverID');
    this.CorrespondencType = this.route.snapshot.queryParamMap.get('CorrType');
    this.locationid = this.route.snapshot.queryParamMap.get('locationid');
    this.taskID = this.route.snapshot.queryParamMap.get('TaskID');
    this.transID = this.route.snapshot.queryParamMap.get('TransID');

    // LoadAllCorrandTransInformation
    this.RefreshRecord();
    // Get the FolderName to Show as the Heading
    this.CorrespondenceFolderName = this._correspondenceDetailsService.getCorrespondenceFolderName(this.VolumeID);
    // Load Correspondence Sender Details
    this.getCorrespondenceSenderDetails(this.VolumeID, this.CorrespondencType);
    // Load Correspondence Recipient Details
    this.getCorrespondenceRecipientDetails(this.VolumeID, this.CorrespondencType);
    // load Cover Section
    this.getCorrespondenceCoverDetail(this.VolumeID);
    // Load Preview
    this.getCoverDocumentURL(this.CoverID);
    this.correspondenceShowData();
  }

  ReadRecord(locationid: string, transid: string) {
    this._correspondenceDetailsService
      .getCorrRecord(locationid, transid, this._globalConstants.general.ProxyUserID)
      .subscribe(correspondenceData => {
        this.correspondenceData = correspondenceData[0];
        this.buttonsDisplay.showButton(this.correspondenceData);
        this.sectionDisplay.ShowCorrSection(this.correspondenceData, this.CorrespondencType, this.taskID);
        this.markTranserOpened();
      });
  }

  RefreshRecord() {
    this.ReadRecord(this.locationid, this.transID);
  }

  backNavigation() {
    this._location.back();
  }

  getCorrespondenceRecipientDetails(VolumeID: string, CorrespondencType: String): void {
    this._correspondenceDetailsService
      .getCorrespondenceRecipientDetails(VolumeID, CorrespondencType)
      .subscribe(
        correspondenceRecipientDetailsData => (this.correspondenceRecipientDetailsData = correspondenceRecipientDetailsData)
      );
  }

  getCorrespondenceSenderDetails(VolumeID: string, CorrespondencType: String): void {
    this._correspondenceDetailsService.getCorrespondenceSenderDetails(VolumeID, CorrespondencType, false, '', 0)
      .subscribe(correspondenceSenderDetailsData => {
        this.correspondenceSenderDetailsData = correspondenceSenderDetailsData;
        this.setMultiApproveParameters();
      });

  }

  displayColumnsForm(width: number): void {
    const priority = this._correspondenceDetailsService.definePriorityToShow(width);
    this.senderTableStructure = [];
    this.senderTableStructureDetails = [];
    let senderTableLength = 0;
    this.senderTableStructureFull.forEach(element => {
      if (element.priority > priority) {
        if (this.CorrespondencType === 'Incoming' && element.columnDef === 'DepartmentNativeName') {
          // skip
        } else {
          this.senderTableStructureDetails.push(element);
        }
      } else {
        if (this.CorrespondencType === 'Incoming' && element.columnDef === 'DepartmentNativeName') {
          // skip
        } else {
          this.senderTableStructure.push(element);
          senderTableLength += element.columnDef !== 'Icon' ? 1 : 0;
        }
      }
    });
    this.senderIconWidth = this.senderTableStructureDetails.length > 0 ? this.senderIconWidthConst : 0;
    this.senderColWidth = Math.floor((100 - this.senderIconWidth) / senderTableLength);
  }

  onResized(event: ResizedEvent) {
    this.displayColumnsForm(event.newWidth);
  }

  getCorrespondenceCCDetail(VolumeID: String, CorrFlowType: String): void {
    this.ccProgbar = true;
    this._correspondenceDetailsService.getCorrespondenceCCDetail(VolumeID, CorrFlowType)
      .subscribe(correspondenceCCtData => {
        this.correspondenceCCtData = correspondenceCCtData;
        this.ccProgbar = false;
      });

  }

  ccShowData() {
    this.getCorrespondenceCCDetail(this.VolumeID, this.CorrespondencType);

  }

  getCorrespondenceCoverDetail(VolumeID: String): void {
    this.coverProgbar = true;
    this._correspondenceDetailsService.getCorrespondenceCoverDetail(VolumeID)
      .subscribe(correspondenceCovertData => {
        this.correspondenceCovertData = correspondenceCovertData;
        this.coverProgbar = false;
      });
  }

  getCoverDocumentURL(CoverID: String): void {
    this.showCoverLetter();
    this._correspondenceDetailsService.getDocumentURL(CoverID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }

  getCorrespondenceAttachmentsDetail(): void {
    this.attachmentsProgbar = true;
    this._correspondenceDetailsService.getCorrespondenceAttachmentsDetail(this.VolumeID, this.CorrespondencType)
      .subscribe(correspondenceAttachmentsData => {
        this.correspondenceAttachmentsData = correspondenceAttachmentsData;
        this.attachmentsProgbar = false;
      });
  }

  getCorrespondenceInfoData(): void {
    if (!this.correspondenceTabLoaded) {
      this.correspondenceProgbar = true;

      this._correspondenceDetailsService.getCorrespondenceMetadataDetail(this.VolumeID, this.CorrespondencType)
        .subscribe(correspondenceMetadata => {
          this.correspondenceMetadata = correspondenceMetadata;
          this.correspondenceProgbar = false;
          this.correspondenceTabLoaded = true;
        });
    }
  }

  getTransferHistoryData(VolumeID: String): void {
    this.transferProgbar = true;
    this._correspondenceDetailsService.getTransferHistoryTab(VolumeID)
      .subscribe(transferhistorytabData => {
        this.transferhistorytabData = transferhistorytabData;
        this.transferProgbar = false;
      });
  }

  attachmentShowData() {
    this.getCorrespondenceAttachmentsDetail();
  }

  transferTabShowData() {
    this.getTransferHistoryData(this.VolumeID);
  }

  openDialog() {
    this.dialog.open(TransferDialogBox, {
      data: this.correspondenceData,
      width: '100%',
      // margin: 'auto',
      panelClass: 'transferDialogBoxClass',
      maxWidth: '85vw'
    })
      .afterClosed().subscribe(result => {
        if (result === 'transfered') {
          this.transferTabShowData();
        }
      });
  }
  // call complete comment window (for transfers)
  OpenCompleteDialog(status: string): void {
    if (status === '1' && this.correspondenceData.ID.toString() !== '0' && this.correspondenceData.Status.toString() === '0') {
      const dialogRef = this.dialog.open(CompleteDialogComponent, {
        width: '100%',
        panelClass: 'complete-dialog',
        maxWidth: '30vw',
        data: {
          data: this.correspondenceData,
          callplace: 'CorrDetails'
        }
      })
        .afterClosed().subscribe(result => {
          if (result === 'Reload') {
            this.backNavigation();
            // this.RefreshRecord();
          }
        });
    } else {
      let CompleteRequestFinal: StatusRequest = new StatusRequest;
      CompleteRequestFinal = this._correspondenceShareService.buildObject(this.correspondenceData, status, 'CorrDetails', '');
      this._correspondenceShareService.setTransferToStatus(CompleteRequestFinal).subscribe(data => { this.RefreshRecord(); });
    }
  }

  showMessage(message: string) {
    this.dialog.open(MessageDialogComponent, {
      width: '100%',
      // margin: 'auto',
      panelClass: 'complete-dialog',
      maxWidth: '30vw',
      data: {
        message
      }

    })
      .afterClosed().subscribe();
  }

  correspondenceShowData() {
    this.getCorrespondenceInfoData();
  }

  expandeActionLeftButton() {
    this.expandedAction = !this.expandedAction;
  }

  expandeActionRightButton() {
    this.expandedRightAction = !this.expandedRightAction;
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

  /*  showCommentsData() {
      this.getCommentsData();
    }

    getCommentsData(): void {
      this.commentsProgbar = true;
      this._correspondenceDetailsService.getCommentsData(this.VolumeID)
        .subscribe(correspondenceCommentsDetail => {
          this.correspondenceCommentsDetail = correspondenceCommentsDetail;
          this.commentsProgbar = false;
        });
    }*/

  corrconnectionsData() {
    this.getCorrConnectionsData();
  }

  getCorrConnectionsData(): void {
    this.corrConnectionsProgbar = true;
    this._correspondenceDetailsService.getCorrConnectionsData(this.locationid)
      .subscribe(corrConnectionsData => {
        this.corrConnectionsData = corrConnectionsData;
        this.corrConnectionsProgbar = false;
      });
  }

  showActionProperties(dataID: string): void {
    this._correspondenceDetailsService.getDocumentPropertiesURL(dataID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }
  tranlsateDocument(dataID: string): void {

    this._correspondenceDetailsService.getDocumentTranslateURL(dataID)
      .subscribe(correspondenceCovertData => this.documentPreviewURL = correspondenceCovertData);
  }
  // change transfer statuses - HoldSecretary, ReleaseTask, TransferOpened
  toggleTransferTo(toggleAction: string) {
    this._correspondenceShareService.ToggleTransStatus(this.correspondenceData.ID, toggleAction).subscribe(
      data => {
        if (data.transfer_status_changes.length > 0 && data.transfer_status_changes[0].ID.toString() === this.correspondenceData.ID.toString()) {
          this.RefreshRecord();
        } else {
          this.showMessage(this.translator.transform('error_transfer_action')+'- ' + toggleAction + this.translator.transform('plz_contact_administrator') );
        }

      });
  }

  saveTransferTo() {
    this.toggleTransferTo('releaseTask');
  }

  markTranserOpened() {
    if (this.correspondenceData.ID.toString() !== '0' && this.correspondenceData.WasOpened.toString() === '0' && this.correspondenceData.holdSecretaryID.toString() === CSConfig.globaluserid.toString()) {
      this.toggleTransferTo('openTask');
    }
  }


  /* *****************************  Transfer reply ******************************************* */
  transferReplyDialog(transUser: CorrResponse): void {
    const dialogRef = this.dialog.open(TransferReplyDialogComponent, {
      width: '100%',
      panelClass: 'transfer-reply-dialog',
      maxWidth: '50vw',
      data: {
        corrData: this.correspondenceData,
        transferUser: transUser,
        callPlace: 'CorrDetails'
      }
    }).afterClosed().subscribe(
      result => {
        if (result === 'Reload') {
          this.backNavigation();
          // this.RefreshRecord();
        }
      });
  }

  transferReply(): void {
    // console.log(this.correspondenceData);
    this._correspondenceShareService.getTransferUser(this.correspondenceData.TransferUserID).subscribe(
      transferUser => {
        this.transferReplyDialog(transferUser);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  LinkedCorrAction(obj): void {
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

  // parameters passed to MultipleApproveComponent
  setMultiApproveParameters() {
    this.approve = {
      UserID: this.correspondenceSenderDetailsData[0].myRows[0].SenderUserID,
      CorrID: this.locationid,
      VolumeID: this.VolumeID,
      mainLanguage: this.translatorService.lang,
      TeamID: null,
      fGetStructure: true,
      fGetTeamStructure: false,
      fInitStep: false,
      fChangeTeam: false,
      taskID: '0',
      selectApproverStep: '',
      approveStep: '',
      selectFinalApproverStep: '',
      approveAndSignStep: ''
    };
  }

  showDistributionChart() {
    this.showPreviewCoverLetter = false;
    this.showDistributionTreeArea = true;
  }

  showCoverLetter() {
    this.showPreviewCoverLetter = true;
    this.showDistributionTreeArea = false;
  }

  distributionOutputAction(): void {
    this.distributionSection.getDistributionData(false);
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
          this.getCorrespondenceCoverDetail(this.VolumeID);
        } else if (sectionName === 'ATTACHMENT') {
          this.getCorrespondenceAttachmentsDetail();
        } else if (sectionName === 'MISC') {
        }
        clearInterval(interval);
      }
      if (iterations > 10) {
        clearInterval(interval);
      }
    }, 1000);
  }
}
