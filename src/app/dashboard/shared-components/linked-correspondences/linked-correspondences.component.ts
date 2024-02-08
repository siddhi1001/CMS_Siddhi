import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FCTSDashBoard } from '../../../../environments/environment';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from 'src/app/dashboard/dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { LinkedCorrDialogComponent } from 'src/app/dashboard/dialog-boxes/linked-corr-dialog/linked-corr-dialog.component';


export interface CorrespondData {
  Name: string;
  DataID: string;
}

export interface IconType {
  title: string;
  icon: string;
}

export interface ConnectedCorrespondencesData {
  CorrespondenceIcon: IconType[];
  SeeContents: string;
  ID: string;
  DataID: string;
  name: string;
  VolumeID: string;
  CorrespondenceCode: string;
  ArabicSubject: string;
  EnglishSubject: string;
  CoverID: string;
  CoverLetterName: string;
  ModifyDate: string;
  CoverLetterSize: string;
  CoverLetterType: string;
  DownloadURL: string;
}

@Component({
  selector: 'app-linked-correspondences',
  templateUrl: './linked-correspondences.component.html',
  styleUrls: ['./linked-correspondences.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LinkedCorrespondencesComponent implements OnInit {

  public basehref: String = FCTSDashBoard.BaseHref;
  public CSUrl: String = FCTSDashBoard.CSUrl;
  public loadSpinner = false;
  public firstLoadAction = false;
  public connectedCorrData: ConnectedCorrespondencesData[];
  @Input() DataID: string;
  @Input() Name: string;
  @Input() Modify: boolean;
  @Output() CoverAction = new EventEmitter<Object>();

  CorrDisplayedColumns: string[] = ['DocType', 'name', 'EnglishSubject', 'Remove'];

  CorrTableStructure = [
    { 'columnDef': 'DocType', 'columnName': '' },
    { 'columnDef': 'name', 'columnName': 'PWA Reference' },
    { 'columnDef': 'EnglishSubject', 'columnName': 'Subject' },
    { 'columnDef': 'Remove', 'columnName': '' }
  ];

  constructor(
    public correspondenceShareService: CorrespondenceShareService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogU: MatDialog,
  ) { }

  ngOnInit() {
  }

  coverLetterAction(action, dataID) {
    this.CoverAction.next({ action: action, dataID: dataID });
  }

  firstLoad() {
    if (!this.firstLoadAction) {
      this.getCorrConnected();
      this.firstLoadAction = true;
    }
  }

  getCorrConnected() {
    this.loadSpinner = true;
    this.correspondenceShareService.getCorrConnectedDet(this.DataID).subscribe(
      response => {
        this.connectedCorrData = response;
        this.loadSpinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.loadSpinner = false;
      }
    );
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
          this.deleteConnectedCorr(ConnectionID);
        }
      });
  }

  deleteConnectedCorr(ConnectionID: string): void {
    this.correspondenceShareService.deleteConnectedCorr(ConnectionID).subscribe(
      response => {
        this.getCorrConnected();
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  OpenLinkedCorrDialog() {
    const correspondData: CorrespondData = {
      Name: this.Name,
      DataID: this.DataID
    };
    this.LinkedCorrespondenceDialogBox(correspondData);
  }

  LinkedCorrespondenceDialogBox(correspondData: CorrespondData): void {
    const dialogRef = this.dialogU.open(LinkedCorrDialogComponent, {
      width: '100%',
      panelClass: 'linkedCorrespondenceDialogBox',
      maxWidth: '85vw',
      data: {
        correspondData: correspondData
      }
    }).afterClosed().subscribe(
      response => {
        this.getCorrConnected();
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      });
  }

}
