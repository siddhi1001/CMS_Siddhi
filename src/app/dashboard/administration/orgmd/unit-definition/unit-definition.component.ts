import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { DialogDirection } from '../../administration.model';
import { UnitDefinitionModel } from '../../models/orgmd.model';
import { UnitDefinitionDialogComponent } from './unit-definition-dialog/unit-definition-dialog.component';
import { FormBuilder } from '@angular/forms';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { OrgmdService } from '../../services/orgmd.service';
import { BaseDefinitionComponent } from '../../base-classes/base-definition/base-definition.component';


@Component({
  selector: 'app-unit-definition',
  templateUrl: '../../base-classes/base-definition/base-definition.component.html',
  styleUrls: ['./unit-definition.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        overflow: 'auto',
        height: '*',
        flex: 1
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        width: '0px',
        height: '0px',
        flex: 0
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})
export class UnitDefinitionComponent extends BaseDefinitionComponent implements OnInit {

  orgUnitsData: UnitDefinitionModel[];
  sideInfoItem = new UnitDefinitionModel();
  displayedColumns: string[] = ['Name_' + this.lang, 'Description_' + this.lang, 'actionButtons'];

  constructor(
    public dialog: MatDialog,
    public translatorService: multiLanguageTranslator,
    private _orgmdService: OrgmdService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private formBuilder: FormBuilder,
    private translator: multiLanguageTranslatorPipe) {
    super(dialog, translatorService);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.orgUnitsData);
    this.filtersForm = this.formBuilder.group({
      Definition: [],
      Description: []
    });
    this.getUnitDefinition();
  }

  getUnitDefinition() {
    this.runSpinner = true;
    this._orgmdService.getUnitDefinition()
      .subscribe(
        data => {
          this.orgUnitsData = data;
          this.dataSource = new MatTableDataSource(this.orgUnitsData);
          this.setFilterPredicate();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          this.runSpinner = false;
        }
      );
  }

  saveUnitDefinition(element: UnitDefinitionModel) {
    this.runSpinner = true;
    this.closeFilter();
    this.closeDetails();
    this.searchValue = '';
    this._orgmdService.saveUnitDefinition(element)
      .subscribe(
        data => {
          this.getUnitDefinition();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  setSelectedUnit(elem: UnitDefinitionModel) {
    this.sideInfoItem = elem;
    this.sideInfoHeader = 'org_unit';
    this.sideInfoName = this.translator.transform(elem.Name_EN, elem.Name_AR);
    this.detailState = 'in';
  }

  editItem(elem: UnitDefinitionModel) {
    this.openDialog('update', elem, (result) => this.saveUnitDefinition(result));
  }

  addUdef() {
    this.openDialog('insert', new UnitDefinitionModel, (result) => { console.log('add ', result); });
  }

  openDialog(action: string, element: UnitDefinitionModel, backend) {
    this.dialog.open(UnitDefinitionDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '520px',
      direction: DialogDirection[this.translatorService.translatorDir],
      data: {
        action: action,
        element: element
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        backend(result);
      }
    });
  }

}
