import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-edit-org-chart-roles-dialog',
  templateUrl: './edit-org-chart-roles-dialog.component.html',
  styleUrls: ['./edit-org-chart-roles-dialog.component.scss']
})
export class EditOrgChartRolesDialogComponent implements OnInit {
  RoleData: FormGroup;
  header: string;

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'value': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'value': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'short_name', 'controlName': 'ShortName_EN', 'value': 'ShortName_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'short_name_ar', 'controlName': 'ShortName_AR', 'value': 'ShortName_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'description', 'controlName': 'Description_EN', 'value': 'Description_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'description_ar', 'controlName': 'Description_AR', 'value': 'Description_AR', 'inputLength': '255', 'type': 'text' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formDeclare();
  }

  formDeclare() {
    if (this.data.action === 'updateRole') {
      this.header = 'edit_role';
      this.RoleData = this.formBuilder.group({
        RID: this.data.role.RID,
        Name_EN: [this.data.role.Name_EN, Validators.required],
        Name_AR: [this.data.role.Name_AR, Validators.required],
        ShortName_EN: this.data.role.ShortName_EN,
        ShortName_AR: this.data.role.ShortName_AR,
        Description_EN: this.data.role.Description_EN,
        Description_AR: this.data.role.Description_AR,
      });
    } else if (this.data.action === 'insertRole') {
      this.header = 'add_role';
      this.RoleData = this.formBuilder.group({
        RID: [],
        Name_EN: ['', Validators.required],
        Name_AR: ['', Validators.required],
        ShortName_EN: [],
        ShortName_AR: [],
        Description_EN: [],
        Description_AR: [],
      });
    }
  }

  save() {
    this.fieldTouch();
    if (this.RoleData.valid) {
      this._dialogRef.close(this.RoleData.value);
    }
  }

  fieldTouch() {
    this.RoleData.get('Name_EN').markAsTouched();
    this.RoleData.get('Name_AR').markAsTouched();
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

}
