import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { MetadataService } from '../../services/metadata.service';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { DialogDirection } from '../../administration.model';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { ActionType, IMDFilingPlanModel } from '../../models/metadata.model';
import { YearReceiverDialogComponent } from './year-receiver-dialog/year-receiver-dialog.component';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-year-receiver',
  templateUrl: './year-receiver.component.html',
  styleUrls: ['./year-receiver.component.scss']
})
export class YearReceiverComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;

  runSpinner: boolean;
  searchValue: string;

  dataSource: MatTableDataSource<IMDFilingPlanModel> = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'action'];

  constructor(
    public dialog: MatDialog,
    private _metadataService: MetadataService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private translatorService: multiLanguageTranslator,
    private translator: multiLanguageTranslatorPipe,
    private notificationmessage: NotificationService,
  ) { }

  ngOnInit() {
    this.getData();
  }

  setFullSearch() {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  getData() {
    this.runSpinner = true;
    this._metadataService.getYear().subscribe(
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

  editItem(elem: IMDFilingPlanModel) {
    this.openDialog(ActionType.edit, elem);
  }

  addItem() {
    this.openDialog(ActionType.add);
  }

  deleteItem(element: IMDFilingPlanModel) {
    this.deleteCheck(element, ActionType.delete);
  }

  saveItem(element: IMDFilingPlanModel, action: string) {
    this.runSpinner = true;
    this._metadataService.setYear(element, action)
      .subscribe(
        response => {
          this.getData();
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

  deleteCheck(element: IMDFilingPlanModel, action: string): void {
    const obj = {
      templateName: 'DelYear',
      objectID: element.ID,
      field1: '',
      field2: '',
      field3: '',
      field4: '',
      csvIDS: '',
    };
    this._metadataService.canChange(obj).subscribe(
      response => {
        if (response[0].Counter === 0) {
          this.deleteConfirm(element, action);
        } else {
          this.notificationmessage.error(
            'Object is not empty', this.translator.transform('gbl_err_this_record_has_children'),
            2500);
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  deleteConfirm(element: IMDFilingPlanModel, action: string): void {
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

  openDialog(action: string, element?: IMDFilingPlanModel) {
    this.dialog.open(YearReceiverDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '550px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        element: element
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.saveItem(result, action);
      }
    });
  }

}
