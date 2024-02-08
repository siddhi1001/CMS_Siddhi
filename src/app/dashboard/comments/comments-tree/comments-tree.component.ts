import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { CorrResponse, CommentsNode } from '../../services/correspondence-response.model';
import { CorrespondenceShareService } from '../../services/correspondence-share.service';
import { ErrorHandlerFctsService } from '../../services/error-handler-fcts.service';

 const TREE_DATA: CommentsNode[] = [
  {
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
    shortComment:   '',
  }
];

interface ExampleCommentsNode {
  expandable: boolean;
  CommentText: string;
  CreationDate: string;
  CreatorID: string;
  CreatorName_AR: string;
  CreatorName_EN: string;
  Deleted: string;
  ID: string;
  Private: string;
  ReferenceID: string;
  ReferenceType: string;
  ReplyAvailable: string;
  ReplyTo: string;
  Version: string;
  shortComment: string;
  level: number;
}

@Component({
  selector: 'app-comments-tree',
  templateUrl: './comments-tree.component.html',
  styleUrls: ['./comments-tree.component.scss']
})
export class CommentsTreeComponent implements OnInit {
  private CurrentUserID: string = CSConfig.globaluserid;
  private _transformer = (node: CommentsNode, level: number) => {
    return {
      expandable: !!node.subComments && node.subComments.length > 0,
      CommentText: node.CommentText,
      CreationDate: node.CreationDate,
      CreatorID: node.CreatorID,
      CreatorName_AR: node.CreatorName_AR,
      CreatorName_EN: node.CreatorName_EN,
      Deleted: node.Deleted,
      ID: node.ID,
      Private: node.Private,
      ReferenceID: node.ReferenceID,
      ReferenceType: node.ReferenceType,
      ReplyAvailable: node.ReplyAvailable,
      ReplyTo: node.ReplyTo,
      Version: node.Version,
      shortComment: node.shortComment,
      level: level,
    };
  }
  // tslint:disable-next-line: member-ordering

  treeControl = new FlatTreeControl<ExampleCommentsNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this._transformer, node => node.level, node => node.expandable, node => node.subComments);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    public correspondenceShareService: CorrespondenceShareService,
    private _errorHandlerFctsService: ErrorHandlerFctsService
    ) {
    this.dataSource.data = TREE_DATA;
  }
  @Output() makeReply = new EventEmitter<string>();
  @Output() closeDialogBox = new EventEmitter<string>();
  @Input() commentsDetails: CommentsNode[];
  @Input() commentEdit: Boolean;

  hasChild = (_: number, node: ExampleCommentsNode) => node.expandable;


  ngOnInit() {
    this.treeRebuild();
  }
  reply(item) {
    this.makeReply.next(item);
  }

  closeDialog() {
    this.closeDialogBox.next();
  }

  treeRebuild() {    
    this.dataSource.data = this.commentsDetails;
  }

  testChild() {    
  }

  deleteItem(commentParams: CommentsNode) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.correspondenceShareService.deleteComment(commentParams)
      .subscribe(
        response => {
          this.closeDialog();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
          this.closeDialog();
        });
    }
  }
}
