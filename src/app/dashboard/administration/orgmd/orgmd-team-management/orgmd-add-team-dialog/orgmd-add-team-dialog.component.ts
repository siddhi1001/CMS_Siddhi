import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { OrgmdService } from 'src/app/dashboard/administration/services/orgmd.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { NotificationService } from 'src/app/dashboard/services/notification.service';

@Component({
  selector: 'app-orgmd-add-team-dialog',
  templateUrl: './orgmd-add-team-dialog.component.html',
  styleUrls: ['./orgmd-add-team-dialog.component.scss']
})
export class OrgmdAddTeamDialogComponent implements OnInit {
  NodeData: FormGroup;
  header: string;
  actionType: string;
  runSpinner = false;

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'value': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'value': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'parent', 'controlName': 'ParentName', 'value': 'ParentName', 'inputLength': '', 'type': '' },
    { 'name': 'short_name', 'controlName': 'ShortName_EN', 'value': 'ShortName_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'short_name_ar', 'controlName': 'ShortName_AR', 'value': 'ShortName_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'project', 'controlName': 'ProjectID', 'value': 'ProjectID', 'inputLength': '', 'type': '' },
    { 'name': 'email', 'controlName': 'Email', 'value': 'Email', 'inputLength': '255', 'type': 'text' },
    { 'name': 'team_description', 'controlName': 'Description_EN', 'value': 'Description_EN', 'inputLength': '255', 'type': 'textarea' },
    { 'name': 'team_description_ar', 'controlName': 'Description_AR', 'value': 'Description_AR', 'inputLength': '255', 'type': 'textarea' },
    { 'name': 'team_purpose_short', 'controlName': 'TeamPurposeShort_EN', 'value': 'TeamPurposeShort_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'team_purpose_short_ar', 'controlName': 'TeamPurposeShort_AR', 'value': 'TeamPurposeShort_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'team_purpose', 'controlName': 'TeamPurpose_EN', 'value': 'TeamPurpose_EN', 'inputLength': '255', 'type': 'textarea' },
    { 'name': 'team_purpose_ar', 'controlName': 'TeamPurpose_AR', 'value': 'TeamPurpose_AR', 'inputLength': '255', 'type': 'textarea' },
  ];



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private translator: multiLanguageTranslatorPipe,
    private _orgmdService: OrgmdService,
    private notificationmessage: NotificationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
  ) { }

  ngOnInit() {
    this.NodeData = this.formBuilder.group({
      TID: '',
      Name_EN: [{ value: '', disabled: this.data.action === 'updateLvl1' ? true : false }, Validators.required],
      Name_AR: ['', Validators.required],
      ParentID: '',
      ParentName: [{ value: '', disabled: true }, Validators.required],
      ShortName_EN: ['', Validators.required],
      ShortName_AR: ['', Validators.required],
      ProjectID: [{ value: '', disabled: this.data.action === 'updateLvl1' ? true : false }, Validators.required],
      Email: ['', ([Validators.required, Validators.email])],
      Description_EN: '',
      Description_AR: '',
      TeamPurposeShort_EN: '',
      TeamPurposeShort_AR: '',
      TeamPurpose_EN: '',
      TeamPurpose_AR: '',
    });

    if (this.data.action === 'updateLvl1') {
      this.fillForm();
      this.actionType = 'edit_team';
    } else if (this.data.action === 'insertLvl1') {
      this.NodeData.get('ParentID').setValue(this.data.node.getID);
      this.NodeData.get('ParentName')
        .setValue(this.translator.transform(this.data.node.Name_EN, this.data.node.Name_AR));
      this.actionType = 'add_team';
    }
  }

  fillForm() {
    this.NodeData.get('TID').setValue(this.data.node.TID);
    this.NodeData.get('Name_EN').setValue(this.data.node.Name_EN);
    this.NodeData.get('Name_AR').setValue(this.data.node.Name_AR);
    this.NodeData.get('ParentID').setValue(this.data.node.ParentID);
    this.NodeData.get('ParentName').setValue(this.translator.
      transform(this.data.node.ParentName_EN, this.data.node.ParentName_AR));
    this.NodeData.get('ShortName_EN').setValue(this.data.node.ShortName_EN);
    this.NodeData.get('ShortName_AR').setValue(this.data.node.ShortName_AR);
    this.NodeData.get('ProjectID').setValue(this.data.node.ProjectID);
    this.NodeData.get('Email').setValue(this.data.node.Email);
    this.NodeData.get('Description_EN').setValue(this.data.node.Description_EN);
    this.NodeData.get('Description_AR').setValue(this.data.node.Description_AR);
    this.NodeData.get('TeamPurposeShort_EN').setValue(this.data.node.TeamPurposeShort_EN);
    this.NodeData.get('TeamPurposeShort_AR').setValue(this.data.node.TeamPurposeShort_AR);
    this.NodeData.get('TeamPurpose_EN').setValue(this.data.node.TeamPurpose_EN);
    this.NodeData.get('TeamPurpose_AR').setValue(this.data.node.TeamPurpose_AR);
  }

  save() {
    this.fieldTouch();
    if (this.NodeData.valid) {
      this.runSpinner = true;
      const obj = {
        templateName: 'orgmdOrgChartEdit',
        objectID: '',
        field1: this.NodeData.get('Name_EN').value,
        field2: this.NodeData.get('Name_AR').value,
        field3: this.NodeData.get('ParentID').value,
        field4: '',
        csvIDS: '',
      };
      this._orgmdService.canChange(obj).subscribe(
        response => {
          if (response[0].Counter === 0) {
            if (this.data.action === 'insertLvl1') {
              this.createGroup();
            } else if (this.data.action === 'updateLvl1') {
              this._dialogRef.close({ teamData: this.NodeData.getRawValue(), groupKuafID: null });
            }
          } else {
            this.notificationmessage.error(
              'Name coincidence', this.translator.transform('gbl_err_name_coincidence'),
              2500);
            this.runSpinner = false;
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
    }
  }

  createGroup() {
    this._orgmdService.createGroup(this.NodeData.get('Name_EN').value, this.NodeData.get('ProjectID').value)
      .subscribe(
        response => {
          if (response.success) {
            this._dialogRef.close({ teamData: this.NodeData.getRawValue(), groupKuafID: response.createResult });
          } else {
            this.notificationmessage.error(
              'Unable to create a group', this.translator.transform(response.createResult),
              2500);
            this.runSpinner = false;
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  fieldTouch() {
    this.interactionStructure.forEach(element => {
      this.NodeData.get(element.controlName).markAsTouched();
    });
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

}
