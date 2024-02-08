import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { MetadataService, } from '../../services/metadata.service';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { IPurposeModel, ISimpleDataModel, ActionType } from '../../models/metadata.model';
import { DialogDirection } from '../../administration.model';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { EditPurposeDialogComponent } from './edit-purpose-dialog/edit-purpose-dialog.component';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { FCTSDashBoard } from 'src/environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purposes',
  templateUrl: './purposes.component.html',
  styleUrls: ['./purposes.component.scss']
})
export class PurposesComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  displayedColumns: string[] = ['phase', 'purpose', 'action'];
  dataSource: MatTableDataSource<IPurposeModel> = new MatTableDataSource();

  runSpinner: boolean;
  searchValue: string;

  phaseList: ISimpleDataModel[];

  constructor(
    public dialog: MatDialog,
    public translatorService: multiLanguageTranslator,
    private _metadataService: MetadataService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
  ) { }

  ngOnInit() {
    this.getData();
  }

  setFullSearch(): void {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  getData(): void {
    this.runSpinner = true;
    forkJoin([this._metadataService.getPurposes(), this._metadataService.getPhaseList()])
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

  getPurposes(): void {
    this.runSpinner = true;
    this._metadataService.getPurposes().subscribe(
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

  saveItem(element: IPurposeModel, action: string): void {
    this._metadataService.savePurpose(element, action)
      .subscribe(
        response => {
          this.getPurposes();
          this.searchValue = '';
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  addItem(): void {
    this.openDialog(ActionType.add);
  }

  editItem(elem: IPurposeModel): void {
    this.openDialog(ActionType.edit, elem);
  }

  deleteItem(elem: IPurposeModel): void {
    this.deleteConfirm(elem, ActionType.delete);
  }

  openDialog(action: ActionType, element?: IPurposeModel): void {
    this.dialog.open(EditPurposeDialogComponent, {
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

  deleteConfirm(element: IPurposeModel, action: ActionType): void {
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
