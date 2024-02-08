import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';

@Component({
  selector: 'app-edit-org-chart-dialog',
  templateUrl: './edit-org-chart-dialog.component.html',
  styleUrls: ['./edit-org-chart-dialog.component.scss']
})
export class EditOrgChartDialogComponent implements OnInit {
  OrgUnitData: FormGroup;
  header: string;

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'value': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'value': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'short_name', 'controlName': 'ShortName_EN', 'value': 'ShortName_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'short_name_ar', 'controlName': 'ShortName_AR', 'value': 'ShortName_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'code', 'controlName': 'Code', 'value': 'Code', 'inputLength': '', 'type': 'number' },
    { 'name': 'parent', 'controlName': 'ParentName', 'value': 'ParentName_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'description', 'controlName': 'Description_EN', 'value': 'Description_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'description_ar', 'controlName': 'Description_AR', 'value': 'Description_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'type', 'controlName': 'OUTID', 'value': 'Type_EN', 'inputLength': '', 'type': '' },
    { 'name': 'link_type', 'controlName': 'LTID', 'value': 'LinkType_EN', 'inputLength': '', 'type': '' }
  ];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private _administration: AdministrationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private notificationmessage: NotificationService,
    private translator: multiLanguageTranslatorPipe,
  ) { }

  ngOnInit() {
    this.header = this.data.action + '_org_unit';
    if (this.data.action === 'update') {
      this.editForm();
    } else if (this.data.action === 'insert') {
      this.addForm();
    }
  }

  addForm() {
    this.OrgUnitData = this.formBuilder.group({
      OUID: [],
      Parent: this.data.node.OUID,
      Name_EN: ['', Validators.required],
      Name_AR: ['', Validators.required],
      ShortName_EN: [],
      ShortName_AR: [],
      Code: [],
      ParentName: [{
        value: this.translator.transform(this.data.node.Name_EN, this.data.node.Name_AR),
        disabled: true
      }, Validators.required],
      Description_EN: [],
      Description_AR: [],
      OUTID: [this.data.node.OUTID + 1, Validators.required],
      LTID: ['', Validators.required],
    });
  }


  editForm() {
    this.OrgUnitData = this.formBuilder.group({
      OUID: this.data.node.OUID,
      Parent: this.data.node.Parent,
      Name_EN: [this.data.node.Name_EN, Validators.required],
      Name_AR: [this.data.node.Name_AR, Validators.required],
      ShortName_EN: this.data.node.ShortName_EN,
      ShortName_AR: this.data.node.ShortName_AR,
      Code: this.data.node.Code,
      ParentName: [{
        value: this.translator.transform(this.data.node.ParentName_EN, this.data.node.ParentName_AR),
        disabled: true
      }, Validators.required],
      Description_EN: this.data.node.Description_EN,
      Description_AR: this.data.node.Description_AR,
      OUTID: [this.data.node.OUTID, Validators.required],
      LTID: [this.data.node.LTID, Validators.required],
    });
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  save() {
    this.fieldTouch();
    if (this.OrgUnitData.valid) {
      const elem = this.OrgUnitData.value;
      this._administration.canChange('orgmdOrgChartEdit', elem.OUID, elem.Name_EN, elem.Name_AR, elem.Parent, '', '').subscribe(
        response => {
          if (response[0].Counter === 0) {
            this._dialogRef.close(this.OrgUnitData.value);
          } else {
            this.notificationmessage.error('Item name coincidence', this.translator.transform('gbl_err_name_coincidence'), 2500);
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
    }
  }

  fieldTouch() {
    this.OrgUnitData.get('Name_EN').markAsTouched();
    this.OrgUnitData.get('Name_AR').markAsTouched();
    this.OrgUnitData.get('OUTID').markAsTouched();
    this.OrgUnitData.get('LTID').markAsTouched();
  }

  typeCheck(OUTID: number) {
    const currentID = this.data.node.OUTID;
    if (this.data.action === 'update') {
      if (OUTID === currentID) {
        return true;
      }
      return false;
    } else if (this.data.action === 'insert') {
      if ((currentID === 1 && OUTID <= currentID + 2 && OUTID !== currentID) ||
        (currentID !== 1 && OUTID === currentID + 1)) {
        return true;
      }
      return false;
    }
  }

}
