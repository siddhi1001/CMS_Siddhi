import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';

export interface ApproverLevelsFormData {
  ApproveLevel: number;
  ApproverID: any;
  IsActive: number;
  IsDone: number;
  LevelName_AR: string;
  LevelName_EN: string;
  SecretaryGroupID: number;
  SkipSecretary: boolean;
  isMandatory: number;
}

@Component({
  selector: 'app-add-approver-dialog',
  templateUrl: './add-approver-dialog.component.html',
  styleUrls: ['./add-approver-dialog.component.scss']
})
export class AddApproverDialogComponent implements OnInit {
  approverLevelsForm: FormGroup;
  approverLevels: FormArray;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddApproverDialogComponent>,
    public dialogU: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.approverLevelsForm = this.formBuilder.group({
      approverLevels: this.formBuilder.array([])
    });
    this.data.unActiveApprovers.forEach(element => {
      this.addApprover(element);
    });
  }

  addApprover(approver: ApproverLevelsFormData): void {
    this.approverLevels = this.approverLevelsForm.get('approverLevels') as FormArray;
    this.approverLevels.push(this.createNewApproverLevel(approver));
  }

  createNewApproverLevel(approver: ApproverLevelsFormData): FormGroup {
    return this.formBuilder.group({
      ApproveLevel: new FormControl({ value: approver.ApproveLevel, disabled: false }),
      makeActive: new FormControl({ value: false, disabled: false }),
      LevelName_EN: new FormControl({ value: approver.LevelName_EN, disabled: false }),
      LevelName_AR: new FormControl({ value: approver.LevelName_AR, disabled: false }),
    });
  }

  getLevels() {
    const arrayControl = this.approverLevelsForm.get('approverLevels') as FormArray;
    let levelsArr = new Array;
    arrayControl.value.forEach(element => {
      if (element.makeActive) {
        levelsArr.push(element.ApproveLevel);
      }
    });
    return levelsArr;
  }

  addLevels() {
    this.closeDialog(this.getLevels());
  }

  closeDialog(Arr: any[]): void {
    this.dialogRef.close(Arr);
  }

}
