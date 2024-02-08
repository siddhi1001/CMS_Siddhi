import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { CorrespondenceShareService } from '../../services/correspondence-share.service';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';
import { CorrResponse, CommentsNode } from '../../services/correspondence-response.model';
import { CommentsTreeComponent } from '../comments-tree/comments-tree.component';
import { AppLoadConstService } from 'src/app/app-load-const.service';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})

export class CommentSectionComponent implements OnInit {
  public globalConstants = this.appLoadConstService.getConstants();
  commentsProgbar = false;
  correspondenceCommentsDetail: CorrResponse[];
  VolumeID: string;
  commentsDataBufer: CommentsNode[];
  showAddCommentField: Boolean = false;
  addCommentObj: CommentsNode = {
    CommentText: '',
    CreationDate: '',
    CreatorID: '',
    CreatorName_AR: '',
    CreatorName_EN: '',
    Deleted: '',
    ID: '',
    Private: '',
    ReferenceID: '',
    ReferenceType: '',
    ReplyAvailable: '',
    ReplyTo: '',
    Version: '',
    shortComment: ''
  };
  privateLabels: string[] = ['Private', 'Public'];
  infoText: string;
  replyToComment: string;
  replyToDate: string;
  checkedPrivate: Boolean = true;
  commentsEditable: Boolean = false;
  expandedRightAction: Boolean = true;
  displayTree: Boolean = true;
  ReferenceType = 'Workflow';
  CurrTaskID = '';
  currPerformerID: string;

  @Input() data;
  @Input() corrType;
  @Input() corrTaskID;
  @ViewChild(CommentsTreeComponent) child;
  @ViewChild('txtArea') textArea: ElementRef;
  constructor(
    public correspondenceShareService: CorrespondenceShareService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public appLoadConstService: AppLoadConstService
  ) { }

  ngOnInit() {
    this.checkEditable();
    this.getCommentsData();
  }

  refresh() {
    setTimeout(() => this.child.ngOnInit(), 100);
  }

  getCommentsData(): void {
    /*     this.displayTree = false; */
    this.correspondenceShareService.getCommentsData(this.data.VolumeID)
      .subscribe(response => {
        this.correspondenceCommentsDetail = response;
        if (Array.isArray(this.correspondenceCommentsDetail) && this.correspondenceCommentsDetail.length) {
          this.commentsDataBufer = this.correspondenceCommentsDetail[0].myRows;
        } else {
          console.log('Comments data error!!!');
        }
        this.commentsProgbar = false;
        if (this.child) {
          this.refresh();
        }
      },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  openAddReplyWindow(replyToObj: CommentsNode): void {
    this.defaltRadio(0);
    this.replyToComment = replyToObj.CommentText;
    this.replyToDate = replyToObj.CreationDate;
    this.infoText = 'Reply to ' + (replyToObj.Private ? 'Private' : 'Public') + ' comment posted by ' + replyToObj.CreatorName_EN + ' on ';
    this.addCommentObj.CommentText = '';
    this.addCommentObj.ReferenceID = this.data.VolumeID;
    this.addCommentObj.ReferenceType = this.ReferenceType;
    this.addCommentObj.ReplyTo = replyToObj.ID;
    this.showAddCommentField = true;
    this.textArea.nativeElement.focus();
  }

  defaltRadio(val: number): void {
    this.checkedPrivate = !val;
    this.addCommentObj.Private = val.toString();
  }

  saveComment(): void {
    this.correspondenceShareService.setComment(this.addCommentObj, this.CurrTaskID === '' ? this.data.taskID : this.CurrTaskID)
      .subscribe(response => {
        this.showAddCommentField = false;
        this.getCommentsData();
      },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  openAddCommentWindow(): void {
    this.defaltRadio(0);
    this.infoText = 'gbl_write_new_comment';
    this.replyToComment = '';
    this.addCommentObj.CommentText = '';
    this.addCommentObj.ReferenceID = this.data.VolumeID;
    this.addCommentObj.ReferenceType = this.ReferenceType;
    this.addCommentObj.ReplyTo = '';
    this.showAddCommentField = true;
  }

  checkEditable(): void {
    // const isAssignee = this.globalConstants.FCTS_Dashboard.UserGroupsArray.includes(this.data.UserID); doenat work with IE
    let isAssignee: boolean;
    this.globalConstants.FCTS_Dashboard.UserGroupsArray.indexOf(this.data.UserID) > -1 ? isAssignee = true : isAssignee = false;
    if ((this.corrTaskID != 0 && this.corrTaskID != undefined) && this.data.CorrespondencePhase.toString() != '3' && (this.corrType === 'Internal' || this.corrType === 'Incoming')) {
      this.commentsEditable = true;
      // console.log('Condition 1');
    } else if ((this.corrTaskID != 0 && this.corrTaskID != undefined) && this.corrType === 'Outgoing' && (isAssignee === true || this.data.isCC !== 1)) {
      // console.log('Condition 2');
      this.commentsEditable = true;
    } else if (this.data.ID.toString() !== '0' && this.data.Status.toString() === '0' && this.data.holdSecretaryID.toString() === CSConfig.globaluserid) {
      // console.log('Condition 3');
      this.commentsEditable = true;
      this.ReferenceType = 'Transfer';
      this.CurrTaskID = this.data.ID;
      this.currPerformerID = this.data.holdSecretaryID;
      // console.log(this.ReferenceType + '-' + this.CurrTaskID + '-' + this.currPerformerID);
    } else {
      // console.log('Condition 4');
    }
  }

}
