import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MetadataService } from 'src/app/dashboard/administration/services/metadata.service';
import { ActionType } from 'src/app/dashboard/administration/models/metadata.model';

@Component({
  selector: 'app-edit-purpose-dialog',
  templateUrl: './edit-purpose-dialog.component.html'
})
export class EditPurposeDialogComponent implements OnInit {
  actionType: string;
  runSpinner: boolean;

  ItemData: FormGroup;
  interactionStructure = [
    {
      name: 'phase_id',
      controlName: 'PhaseID',
      inputLength: '',
      type: ''
    },
    {
      name: 'purpose',
      controlName: 'Purpose_EN',
      inputLength: 255,
      type: 'text'
    },
    {
      name: 'purpose_ar',
      controlName: 'Purpose_AR',
      inputLength: 255,
      type: 'text'
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private notificationmessage: NotificationService,
    private translator: multiLanguageTranslatorPipe,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private _metadataService: MetadataService
  ) { }

  ngOnInit() {
    this.ItemData = this.formBuilder.group({
      PhaseID: ['', Validators.required],
      PurposeID: [''],
      Purpose_EN: ['', Validators.required],
      Purpose_AR: ['', Validators.required],
    });

    if (this.data.action === ActionType.edit && this.data.element) {
      this.actionType = 'edit_purpose';
      this.fillForm();
    } else if (this.data.action === ActionType.add) {
      this.actionType = 'add_purpose';
    }
  }

  fillForm() {
    this.ItemData.get('PhaseID').setValue(this.data.element.PhaseID);
    this.ItemData.get('PurposeID').setValue(this.data.element.PurposeID);
    this.ItemData.get('Purpose_EN').setValue(this.data.element.Purpose_EN);
    this.ItemData.get('Purpose_AR').setValue(this.data.element.Purpose_AR);
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  save() {
    this.markFormGroupTouched(this.ItemData);
    if (this.ItemData.valid) {
      this.runSpinner = true;
      const obj = {
        templateName: 'Purpose',
        objectID: this.ItemData.get('PurposeID').value,
        field1: this.ItemData.get('Purpose_EN').value,
        field2: this.ItemData.get('Purpose_AR').value,
        field3: this.ItemData.get('PhaseID').value,
        field4: '',
        csvIDS: '',
      };
      this._metadataService.canChange(obj).subscribe(
        response => {
          if (response[0].Counter === 0) {
            this._dialogRef.close(this.ItemData.value);
          } else {
            this.notificationmessage.error(
              'Name coincidence', this.translator.transform('gbl_err_item_name_coincidence'),
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
}
