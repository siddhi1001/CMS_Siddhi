import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItemOrgStructure } from '../ecmd-classes.model';

@Component({
  selector: 'app-edit-department-dialog',
  templateUrl: './edit-department-dialog.component.html',
  styleUrls: ['./edit-department-dialog.component.scss']
})
export class EditDepartmentDialogComponent implements OnInit {
  NodeData: FormGroup;
  actionType: string;
  parentsList: ItemOrgStructure[];

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'value': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'value': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'short_name', 'controlName': 'ShortName_EN', 'value': 'ShortName_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'short_name_ar', 'controlName': 'ShortName_AR', 'value': 'ShortName_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'parent', 'controlName': 'ParentID', 'value': 'ParentID', 'inputLength': '255', 'type': 'text' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.NodeData = this.formBuilder.group({
      DEPID: '',
      CPID: '',
      Name_EN: ['', Validators.required],
      Name_AR: ['', Validators.required],
      ShortName_EN: '',
      ShortName_AR: '',
      ParentID: ['', Validators.required]
    });

    if (this.data.action === 'updateLvl3') {
      this.fillForm();
      this.parentsList = this.data.orgStr;
      this.actionType = 'edit_department';
    } else if (this.data.action === 'insertLvl3') {
      this.NodeData.get('ParentID').setValue(this.data.node.getID);
      this.NodeData.get('CPID').setValue(this.data.node.CPID);
      this.parentsList = [{
        ID: this.data.node.getID,
        Type: this.data.node.Type,
        Name_EN: this.data.node.Name_EN,
        Name_AR: this.data.node.Name_AR
      }];
      this.actionType = 'add_department';
    }
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  fillForm() {
    this.NodeData.get('DEPID').setValue(this.data.node.DEPID);
    this.NodeData.get('CPID').setValue(this.data.node.CPID);
    this.NodeData.get('Name_EN').setValue(this.data.node.Name_EN);
    this.NodeData.get('Name_AR').setValue(this.data.node.Name_AR);
    this.NodeData.get('ShortName_EN').setValue(this.data.node.ShortName_EN);
    this.NodeData.get('ShortName_AR').setValue(this.data.node.ShortName_AR);
    this.NodeData.get('ParentID').setValue(this.data.node.getParent);
  }

  save() {
    this.fieldTouch();
    if (this.NodeData.valid) {
      const parent = this.parentsList.find(element => {
        return element.ID === this.NodeData.get('ParentID').value;
      });
      if (parent && parent.Type === 'ctrp') {
        this.NodeData.get('ParentID').setValue('');
      }
      this._dialogRef.close(this.NodeData.value);
    }
  }

  fieldTouch() {
    this.interactionStructure.forEach(element => {
      this.NodeData.get(element.controlName).markAsTouched();
    });
  }
}
