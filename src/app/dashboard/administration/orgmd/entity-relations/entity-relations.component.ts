import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { DialogDirection } from '../../administration.model';
import { EntityRelationModel } from '../../models/orgmd.model';
import { EntityRelationsDialogComponent } from './entity-relations-dialog/entity-relations-dialog.component';
import { FormBuilder } from '@angular/forms';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { OrgmdService } from '../../services/orgmd.service';
import { BaseDefinitionComponent } from '../../base-classes/base-definition/base-definition.component';

@Component({
  selector: 'app-entity-relations',
  templateUrl: '../../base-classes/base-definition/base-definition.component.html',
  styleUrls: ['./entity-relations.component.scss'],
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

export class EntityRelationsComponent extends BaseDefinitionComponent implements OnInit {

  orgUnitsData: EntityRelationModel[];
  sideInfoItem = new EntityRelationModel();
  displayedColumns: string[] = ['Name_' + this.lang, 'Description_' + this.lang, 'actionButtons'];

  constructor(
    public dialog: MatDialog,
    public translatorService: multiLanguageTranslator,
    private _orgmdService: OrgmdService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private formBuilder: FormBuilder,
    public translator: multiLanguageTranslatorPipe) {
      super(dialog, translatorService);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.orgUnitsData);
    this.filtersForm = this.formBuilder.group({
      Definition: [],
      Description: []
    });
    this.getEntityRelations();
  }

  getEntityRelations() {
    this.runSpinner = true;
    this._orgmdService.getEntityRelations()
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

  saveEntityRelations(element: EntityRelationModel) {
    this.runSpinner = true;
    this.closeFilter();
    this.closeDetails();
    this.searchValue = '';
    this._orgmdService.saveEntityRelations(element)
      .subscribe(
        response => {
          this.getEntityRelations();
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  setSelectedUnit(elem: EntityRelationModel) {
    this.sideInfoItem = elem;
    this.sideInfoHeader = 'link_definition';
    this.sideInfoName = this.translator.transform(elem.Name_EN, elem.Name_AR);
    this.detailState = 'in';
  }

  editItem(elem: EntityRelationModel) {
    this.openDialog('update', elem, (result) => this.saveEntityRelations(result));
  }

  addUdef() {
    this.openDialog('insert', new EntityRelationModel, (result) => { console.log('add ', result); });
  }

  openDialog(action: string, element: EntityRelationModel, backend) {
    this.dialog.open(EntityRelationsDialogComponent, {
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
