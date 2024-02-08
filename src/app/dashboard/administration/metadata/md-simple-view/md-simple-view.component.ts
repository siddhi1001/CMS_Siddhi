import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { MetadataService } from '../../services/metadata.service';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { ISimpleDataModel, ActionType } from '../../models/metadata.model';
import { DialogDirection } from '../../administration.model';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SimpleViewConfig } from './md-simple-view-config';
import { MdSimpleViewDialogComponent } from './md-simple-view-dialog/md-simple-view-dialog.component';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-md-simple-view',
  templateUrl: './md-simple-view.component.html',
  styleUrls: ['./md-simple-view.component.scss']
})

export class MdSimpleViewComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  viewParameters: SimpleViewConfig;
  routeDataEvent: Subscription;

  dataSource: MatTableDataSource<ISimpleDataModel> = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'action'];

  searchValue: string;
  runSpinner: boolean;

  constructor(
    public dialog: MatDialog,
    public translatorService: multiLanguageTranslator,
    private route: ActivatedRoute,
    private _metadataService: MetadataService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
  ) { }

  ngOnInit() {
    this.routeDataEvent = this.route.data
      .subscribe(data => {
        this.viewParameters = new SimpleViewConfig(data.dataType);
        this.getData();
      });
  }

  ngOnDestroy() {
    this.routeDataEvent.unsubscribe();
  }

  setFullSearch() {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  getData() {
    this.runSpinner = true;
    this._metadataService[this.viewParameters.getMethod]().subscribe(
      response => {
        this.dataSource = new MatTableDataSource(response);
        this.searchValue = '';
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  saveItem(element: ISimpleDataModel, action: string) {
    this.runSpinner = true;
    this._metadataService[this.viewParameters.setMethod](element, action)
      .subscribe(
        response => {
          this.getData();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          this.runSpinner = false;
        }
      );
  }

  editItem(elem: ISimpleDataModel) {
    this.openDialog(ActionType.edit, elem);
  }

  addItem() {
    this.openDialog(ActionType.add);
  }

  deleteConfirm(element: ISimpleDataModel, action: ActionType): void {
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

  openDialog(action: ActionType, element?: ISimpleDataModel) {
    this.dialog.open(MdSimpleViewDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '550px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        element: element,
        viewParameters: this.viewParameters
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.saveItem(result, action);
      }
    });
  }

}
