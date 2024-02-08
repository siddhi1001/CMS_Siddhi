import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OrgmdService } from 'src/app/dashboard/administration/services/orgmd.service';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';

@Component({
  selector: 'app-entity-relations-dialog',
  templateUrl: './entity-relations-dialog.component.html',
  styleUrls: ['./entity-relations-dialog.component.scss']
})
export class EntityRelationsDialogComponent implements OnInit {
  NodeData: FormGroup;
  header: string;
  actionType: string;
  runSpinner = false;

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'description', 'controlName': 'Description_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'description_ar', 'controlName': 'Description_AR', 'inputLength': '255', 'type': 'text' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public _dialogRef: MatDialogRef<any>,
    private _orgmdService: OrgmdService,
    private notificationmessage: NotificationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private translator: multiLanguageTranslatorPipe
  ) { }

  ngOnInit() {
    this.NodeData = this.formBuilder.group({
      LTID: new FormControl(''),
      Name_EN: new FormControl('', Validators.required),
      Name_AR: new FormControl('', Validators.required),
      Description_EN: new FormControl(''),
      Description_AR: new FormControl(''),
    });
    if (this.data.action === 'update') {
      this.actionType = 'edit_link';
      this.fillForm();
    } else if (this.data.action === 'insert') {
      this.actionType = 'add_link';
    }
  }

  fillForm() {
    this.NodeData.get('LTID').setValue(this.data.element.LTID);
    this.NodeData.get('Name_EN').setValue(this.data.element.Name_EN);
    this.NodeData.get('Name_AR').setValue(this.data.element.Name_AR);
    this.NodeData.get('Description_EN').setValue(this.data.element.Description_EN);
    this.NodeData.get('Description_AR').setValue(this.data.element.Description_AR);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).map(x => formGroup.controls[x]).forEach(control => {
      control.markAsTouched();
      if (control['controls']) {
        control['controls'].forEach(element => {
          this.markFormGroupTouched(element);
        });
      }
    });
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  save() {
    this.markFormGroupTouched(this.NodeData);
    if (this.NodeData.valid) {
      this.runSpinner = true;
      const obj = {
        templateName: 'LINK_TYPE_VER',
        objectID: this.NodeData.get('LTID').value,
        field1: this.NodeData.get('Name_EN').value,
        field2: this.NodeData.get('Name_AR').value,
        field3: '',
        field4: '',
        csvIDS: '',
      };
      this._orgmdService.canChange(obj).subscribe(
        response => {
          if (response[0].Counter === 0) {
            this._dialogRef.close(this.NodeData.value);
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


}
