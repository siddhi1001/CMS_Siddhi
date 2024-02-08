import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IMDFilingPlanModel, ActionType } from '../../models/metadata.model';
import { MetadataService } from '../../services/metadata.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { MatDialog, MatSelect, MatTableDataSource } from '@angular/material';
import { FilingPlanDialogComponent } from './filing-plan-dialog/filing-plan-dialog.component';
import { DialogDirection } from '../../administration.model';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { FilingPlanView, IDropdownOptionData, ViewType } from './filing-plan-config';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-filing-plan',
  templateUrl: './filing-plan.component.html',
  styleUrls: ['./filing-plan.component.scss']
})

export class FilingPlanComponent implements OnInit {
  filtersForm: FormGroup;
  runSpinner: boolean;

  filterStructure: FilingPlanView;
  routeDataEvent: Subscription;

  viewMainSelectorData: IMDFilingPlanModel;
  viewMainSelectorStructure: IDropdownOptionData;


  dataSource: MatTableDataSource<IMDFilingPlanModel> = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'action'];
  searchValue: string;
  addAction: boolean;
  basehref = FCTSDashBoard.BaseHref;

  constructor(
    public formBuilder: FormBuilder,
    public translatorService: multiLanguageTranslator,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private _metadataService: MetadataService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private notificationmessage: NotificationService,
    private translator: multiLanguageTranslatorPipe,
  ) { }

  ngOnInit() {

    this.routeDataEvent = this.route.data
      .subscribe(data => {
        this.filterStructure = new FilingPlanView(data.dataType);
      });

    this.filtersForm = this.formBuilder.group({
      Year: [''],
      Location: [''],
      Cabinet: [''],
      Row: [''],
      Shelf: [''],
      File: ['']
    });

    this.getOptionList(ViewType.Year, '');
  }

  ngOnDestroy() {
    this.routeDataEvent.unsubscribe();
  }

  applyMainFilter() {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  getOptionList(dropDownName: ViewType, id: string) {
    const dropDownInstance = this.findDropDownByName(dropDownName);
    this._metadataService[dropDownInstance.getListMethod](id).subscribe(
      response => {
        this.updateOptionList(dropDownName, response);
        this.searchValue = '';
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  getData(optionData: IMDFilingPlanModel, item: IDropdownOptionData) {
    this.runSpinner = true;
    this._metadataService[item.getDataMethod](optionData.ID).subscribe(
      response => {
        this.dataSource = new MatTableDataSource(response);
        if (optionData.IsFull !== '1') {
          this.addAction = true;
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  setData(obj, action: string) {
    this.runSpinner = true;
    this._metadataService[this.filterStructure.dialogParams.setMethod](obj, action).subscribe(
      response => {
        this.getData(this.viewMainSelectorData, this.viewMainSelectorStructure)
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      },
      () => {
        this.runSpinner = false;
      }
    );
  }

  optionSelectionChange(event: MatSelect, item: IDropdownOptionData): void {
    this.clearChildSelections(item);
    if (this.filterStructure.dropDownData.indexOf(item) + 1 === this.filterStructure.dropDownData.length) {
      this.viewMainSelectorData = event.value;
      this.viewMainSelectorStructure = item;
      this.getData(this.viewMainSelectorData, this.viewMainSelectorStructure)
    } else {
      this.getOptionList(item.attributesToReset[0], event.value.ID);
    };
  }

  clearChildSelections(item: IDropdownOptionData) {
    this.filterStructure.dropDownData.forEach(element => {
      if (item.attributesToReset.indexOf(element.name) > -1) {
        element.selectList = [];
      }
      this.dataSource = new MatTableDataSource();
      this.addAction = false;
    })
  }

  findDropDownByName(name: ViewType) {
    return this.filterStructure.dropDownData.find(element => {
      return element.name === name;
    })
  }

  updateOptionList(name: ViewType, value: IMDFilingPlanModel[]): void {
    this.filterStructure.dropDownData.forEach(element => {
      if (element.name === name) {
        element.selectList = value;
      }
    })
  }

  addNewItem() {
    this.openDialog(ActionType.add);
  }

  editItem(element: IMDFilingPlanModel) {
    this.openDialog(ActionType.edit, element);
  }

  deleteItem(element: IMDFilingPlanModel) {
    if (this.filterStructure.deleteCheckTemplate) {
      this.deleteCheck(element, ActionType.delete);
    } else {
      this.deleteConfirm(element, ActionType.delete);
    }
  }

  openDialog(action: string, element: IMDFilingPlanModel = null) {
    this.dialog.open(FilingPlanDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '550px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        itemParent: this.viewMainSelectorData,
        title: this.filterStructure.dialogParams,
        element: element,
        action: action,
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.setData(result, action);
      }
    });
  }

  deleteCheck(element: IMDFilingPlanModel, action: string): void {
    const obj = {
      templateName: this.filterStructure.deleteCheckTemplate,
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
          this.deleteConfirm(element, action)
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
          this.setData(element, action);
        }
      });
  }

}
