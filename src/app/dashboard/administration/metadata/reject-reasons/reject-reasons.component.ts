import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { IRejectReasons, ActionType, ISimpleDataModel } from '../../models/metadata.model';
import { MetadataService } from '../../services/metadata.service';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { RejectReasonsDialogComponent } from './reject-reasons-dialog/reject-reasons-dialog.component';
import { DialogDirection } from '../../administration.model';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { forkJoin } from 'rxjs';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-reject-reasons',
  templateUrl: './reject-reasons.component.html',
  styleUrls: ['./reject-reasons.component.scss']
})
export class RejectReasonsComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  dataSource: MatTableDataSource<IRejectReasons> = new MatTableDataSource();
  displayedColumns: string[] = ['phase', 'reason', 'action'];

  searchValue: string;
  runSpinner: boolean;

  phaseList: ISimpleDataModel;

  constructor(
    public dialog: MatDialog,
    private _metadataService: MetadataService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public translatorService: multiLanguageTranslator,
  ) { }

  ngOnInit() {
    this.getData();
  }

  setFullSearch() {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  getData(): void {
    this.runSpinner = true;
    forkJoin([this._metadataService.getReasons(), this._metadataService.getPhaseList()])
      .subscribe(
        ([res1, res2]) => {
          this.dataSource = new MatTableDataSource(res1);
          this.phaseList = res2;
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          this.runSpinner = false;
        }
      );
  }

  getReasons() {
    this.runSpinner = true;
    this._metadataService.getReasons().subscribe(
      response => {
        this.dataSource = new MatTableDataSource(response);
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  saveItem(element: IRejectReasons, action: string) {
    this._metadataService.saveReason(element, action)
      .subscribe(
        response => {
          this.getReasons();
          this.searchValue = '';
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  addItem() {
    this.openDialog(ActionType.add);
  }

  editItem(elem: IRejectReasons) {
    this.openDialog(ActionType.edit, elem);
  }

  deleteItem(elem: IRejectReasons) {
    this.deleteConfirm(elem, ActionType.delete);
  }

  openDialog(action: ActionType, element?: IRejectReasons) {
    this.dialog.open(RejectReasonsDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '550px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        element: element,
        phaseList: this.phaseList
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.saveItem(result, action);
      }
    });
  }

  deleteConfirm(element: IRejectReasons, action: ActionType): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '400px',
      data: {
        message: 'delete_confirmation'
      }
    }).afterClosed().subscribe(
      response => {
        if (response) {
          this.saveItem(element, action);
        }
      });
  }

}
