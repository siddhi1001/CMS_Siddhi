import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { MetadataService } from '../../services/metadata.service';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { IPriorityModel, ActionType } from '../../models/metadata.model';
import { DialogDirection } from '../../administration.model';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { EditPriorityDialogComponent } from './edit-priority-dialog/edit-priority-dialog.component';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-priority',
  templateUrl: './priority.component.html',
  styleUrls: ['./priority.component.scss']
})
export class PriorityComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  displayedColumns: string[] = ['priority', 'daysNumber', 'action'];
  dataSource: MatTableDataSource<IPriorityModel> = new MatTableDataSource();

  runSpinner: boolean;
  searchValue: string;

  constructor(
    public dialog: MatDialog,
    private _metadataService: MetadataService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private translatorService: multiLanguageTranslator,
  ) { }

  ngOnInit() {
    this.runSpinner = true;
    this.getData();
  }

  setFullSearch(): void {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  getData(): void {
    this.runSpinner = true;
    this._metadataService.getPriority().subscribe(
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

  addItem(): void {
    this.openDialog(ActionType.add);
  }

  editItem(elem: IPriorityModel): void {
    this.openDialog(ActionType.edit, elem);
  }

  deleteItem(elem: IPriorityModel): void {
    this.deleteConfirm(elem, ActionType.delete);
  }

  saveItem(element: IPriorityModel, action: ActionType) {
    this._metadataService.savePriority(element, action)
      .subscribe(
        response => {
          this.getData();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  openDialog(action: ActionType, element?: IPriorityModel): void {
    this.dialog.open(EditPriorityDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '550px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        element: element,
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.saveItem(result, action);
      }
    });
  }

  deleteConfirm(element: IPriorityModel, action: ActionType): void {
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
