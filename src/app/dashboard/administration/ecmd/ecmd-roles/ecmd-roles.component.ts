import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { ErrorHandlerFctsService } from '../../../services/error-handler-fcts.service';
import { FormBuilder } from '@angular/forms';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { EcmdService } from '../../services/ecmd.service';
import { BaseDefinitionComponent } from '../../base-classes/base-definition/base-definition.component';
import { RolesData } from '../../administration.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ecmd-roles',
  templateUrl: './ecmd-roles.component.html',
  styleUrls: ['./ecmd-roles.component.scss']
})
export class EcmdRolesComponent extends BaseDefinitionComponent implements OnInit {
  rolesData: RolesData[];
  displayedColumns: string[] = ['name', 'description'];

  constructor(
    public dialog: MatDialog,
    public translatorService: multiLanguageTranslator,
    private _ecmdService: EcmdService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private formBuilder: FormBuilder,
    private router: Router) {
    super(dialog, translatorService);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.rolesData);

    this.filtersForm = this.formBuilder.group({
      Definition: [],
      Description: []
    });

    this.getRoles();
  }

  getRoles() {
    this.runSpinner = true;
    this._ecmdService.getECMDRoles().subscribe(
      response => {
        this.rolesData = response;
        this.dataSource = new MatTableDataSource(this.rolesData);
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

  editRoleUsers(role: RolesData) {
    this.router.navigate([this.router.url + '/users'],
      {
        queryParams:
        {
          ID: role.ID,
          GRID: role.Grid,
          ItemName: role.Name_EN
        }
      });
  }

}
