import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatRadioButton } from '@angular/material';
import { CorrespondenceShareService } from '../../services/correspondence-share.service';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { CorrResponse, CommentsNode } from '../../services/correspondence-response.model';
import { AppLoadConstService } from 'src/app/app-load-const.service';

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss']
})
export class CommentDialogComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  commentsProgbar = false;
  correspondenceCommentsDetail: CorrResponse[];
  VolumeID: string;
  commentsDataBufer: CommentsNode[];
  showAddCommentField: Boolean = false;
  addCommentObj: CommentsNode = {
    CommentText:    '',
    CreationDate:   '',
    CreatorID:      '',
    CreatorName_AR: '',
    CreatorName_EN: '',
    Deleted:        '',
    ID:             '',
    Private:        '',
    ReferenceID:    '',
    ReferenceType:  '',
    ReplyAvailable: '',
    ReplyTo:        '',
    Version:        '',
    shortComment:   ''
  };
  privateLabels: string[] = ['Private', 'Public'];
  infoText: string;
  replyToComment: string;
  replyToDate: string;
  checkedPrivate: Boolean = true;
  commentsEditable: Boolean = false;
  expandedRightAction: Boolean = false;
  ReferenceType = 'Workflow';
  CurrTaskID = '';
  currPerformerID: string;
  @ViewChild('txtArea') textArea: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<CommentDialogComponent>,
    public correspondenceShareService: CorrespondenceShareService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public appLoadConstService: AppLoadConstService,
    @Inject(MAT_DIALOG_DATA) public corrData: any,
  ) { }

  ngOnInit() {
    this.VolumeID = this.corrData.data.VolumeID;
    this.checkEditable();
    this.getCommentsData();

  }

  closeDialog(): void {
    this.dialogRef.close('close');
  }

  getCommentsData(): void {
    this.commentsProgbar = true;
    this.correspondenceShareService.getCommentsData(this.VolumeID)
      .subscribe(response => {
        this.correspondenceCommentsDetail = response;
        if ( Array.isArray(this.correspondenceCommentsDetail) && this.correspondenceCommentsDetail.length) {
          this.commentsDataBufer = this.correspondenceCommentsDetail[0].myRows;
        } else {          
        }
        this.commentsProgbar = false;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
        this.closeDialog();
      });
  }

  saveComment(): void {
    this.correspondenceShareService.setComment(this.addCommentObj ,  this.CurrTaskID === '' ? this.corrData.data.SubWorkTask_TaskID : this.CurrTaskID )
     .subscribe(response => {
        this.showAddCommentField = false;
        this.getCommentsData();
    },
    responseError => {
      this._errorHandlerFctsService.handleError(responseError).subscribe();
    });
  }

  openAddReplyWindow(replyToObj: CommentsNode): void {
    this.defaltRadio(0);
    this.replyToComment = replyToObj.CommentText;
    this.replyToDate = replyToObj.CreationDate;
    this.infoText = 'Reply to ' + (replyToObj.Private ? 'Private' : 'Public')  + ' comment posted by ' + replyToObj.CreatorName_EN + ' on ';
    this.addCommentObj.CommentText    = '';
    this.addCommentObj.ReferenceID    = this.corrData.data.VolumeID;
    this.addCommentObj.ReferenceType  = this.ReferenceType;
    this.addCommentObj.ReplyTo        = replyToObj.ID;
    this.showAddCommentField = true;
    this.textArea.nativeElement.focus();

  }

  openAddCommentWindow(): void {
    this.defaltRadio(0);
    this.infoText = 'Write new comment :';
    this.replyToComment = '';
    this.addCommentObj.CommentText    = '';
    this.addCommentObj.ReferenceID    = this.corrData.data.VolumeID;
    this.addCommentObj.ReferenceType  = this.ReferenceType;
    this.addCommentObj.ReplyTo        = '';
    this.showAddCommentField = true;
  }


  defaltRadio(val: number): void {
    this.checkedPrivate = !val;
    this.addCommentObj.Private = val.toString();
  }

  checkEditable(): void {
    if (this.corrData.reportType !== 'ExtFullSearch' && this.corrData.reportType !== 'IntFullSearch') {

      // const isAssignee = this.globalConstants.FCTS_Dashboard.UserGroupsArray.includes(this.corrData.data.SubWorkTask_PerformerID);
      let isAssignee: boolean;
      this.globalConstants.FCTS_Dashboard.UserGroupsArray.indexOf(this.corrData.data.SubWorkTask_PerformerID) > -1 ? isAssignee = true : isAssignee = false;
      if ( this.corrData.data.SubWorkTask_TaskID !== '0' && this.corrData.data.CorrespondencePhase !== '3' && (this.corrData.data.CorrespondenceFlowType === '1' || this.corrData.data.CorrespondenceFlowType === '7')) {
        this.commentsEditable = true;

      } else if ( this.corrData.data.SubWorkTask_TaskID !== '0' && this.corrData.data.CorrespondenceFlowType === '5' && (  isAssignee === true ||  this.corrData.data.transIsCC !== '1')) {

        this.commentsEditable = true;
      } else if ( this.corrData.data.transID.toString() !== '0' && this.corrData.data.transHoldSecretaryID.toString() === CSConfig.globaluserid && this.corrData.data.transStatus.toString() === '0') {
        this.commentsEditable = true;
        this.ReferenceType = 'Transfer';
        this.CurrTaskID = this.corrData.data.transID;
        this.currPerformerID = this.corrData.data.transHoldSecretaryID;
      }
    }
  }

}
