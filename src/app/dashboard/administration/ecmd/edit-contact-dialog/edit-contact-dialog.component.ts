import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItemOrgStructure } from '../ecmd-classes.model';

@Component({
  selector: 'app-edit-contact-dialog',
  templateUrl: './edit-contact-dialog.component.html',
  styleUrls: ['./edit-contact-dialog.component.scss']
})
export class EditContactDialogComponent implements OnInit {
  NodeData: FormGroup;
  actionType: string;
  parentsList: ItemOrgStructure[];

  interactionStructure = [
    { 'name': 'first_name', 'controlName': 'FirstName_EN', 'value': 'FirstName_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'first_name_ar', 'controlName': 'FirstName_AR', 'value': 'FirstName_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'last_name', 'controlName': 'LastName_EN', 'value': 'LastName_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'last_name_ar', 'controlName': 'LastName_AR', 'value': 'LastName_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'phone', 'controlName': 'Phone1', 'value': 'Phone1', 'inputLength': '64', 'type': 'text' },
    { 'name': 'phone2', 'controlName': 'Phone2', 'value': 'Phone2', 'inputLength': '64', 'type': 'text' },
    { 'name': 'fax', 'controlName': 'Fax', 'value': 'Fax', 'inputLength': '64', 'type': 'text' },
    { 'name': 'email', 'controlName': 'Email', 'value': 'Email', 'inputLength': '255', 'type': 'email' },
    { 'name': 'parent', 'controlName': 'DEPID', 'value': 'DEPID', 'inputLength': '', 'type': '' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.NodeData = this.formBuilder.group({
      CID: '',
      CPID: '',
      DEPID: ['', Validators.required],
      FirstName_EN: ['', Validators.required],
      FirstName_AR: ['', Validators.required],
      LastName_EN: ['', Validators.required],
      LastName_AR: ['', Validators.required],
      Phone1: '',
      Phone2: '',
      Fax: '',
      Email: ['', ([Validators.required, Validators.email])]
    });

    if (this.data.action === 'updateLvl4') {
      this.fillForm();
      this.parentsList = this.data.orgStr;
      this.actionType = 'edit_contact';
    } else if (this.data.action === 'insertLvl4') {
      this.NodeData.get('DEPID').setValue(this.data.node.getID);
      this.NodeData.get('CPID').setValue(this.data.node.CPID);
      this.parentsList = [{
        ID: this.data.node.getID,
        Type: this.data.node.Type,
        Name_EN: this.data.node.Name_EN,
        Name_AR: this.data.node.Name_AR
      }];
      this.actionType = 'add_contact';
    }
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  fillForm() {
    this.NodeData.get('CID').setValue(this.data.node.CID);
    this.NodeData.get('CPID').setValue(this.data.node.CPID);
    this.NodeData.get('DEPID').setValue(this.data.node.getParent);
    this.NodeData.get('FirstName_EN').setValue(this.data.node.FirstName_EN);
    this.NodeData.get('FirstName_AR').setValue(this.data.node.FirstName_AR);
    this.NodeData.get('LastName_EN').setValue(this.data.node.LastName_EN);
    this.NodeData.get('LastName_AR').setValue(this.data.node.LastName_AR);
    this.NodeData.get('Phone1').setValue(this.data.node.Phone1);
    this.NodeData.get('Phone2').setValue(this.data.node.Phone2);
    this.NodeData.get('Fax').setValue(this.data.node.Fax);
    this.NodeData.get('Email').setValue(this.data.node.Email);
  }

  save() {
    this.fieldTouch();
    if (this.NodeData.valid) {
      const parent = this.parentsList.find(element => {
        return element.ID === this.NodeData.get('DEPID').value;
      });
      if (parent && parent.Type === 'ctrp') {
        this.NodeData.get('DEPID').setValue('');
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
