import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ActionType } from 'src/app/dashboard/administration/models/metadata.model';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MetadataService } from 'src/app/dashboard/administration/services/metadata.service';

@Component({
  selector: 'app-reject-reasons-dialog',
  templateUrl: './reject-reasons-dialog.component.html'
})
export class RejectReasonsDialogComponent implements OnInit {
  ItemData: FormGroup;

  actionType: string;
  runSpinner = false;

  interactionStructure = [
    {
      name: 'phase_id',
      controlName: 'PhaseID',
      inputLength: '',
      type: ''
    },
    {
      name: 'reject_reason',
      controlName: 'RejectReason_EN',
      inputLength: 255,
      type: 'text'
    },
    {
      name: 'reject_reason_ar',
      controlName: 'RejectReason_AR',
      inputLength: 255,
      type: 'text'
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private notificationmessage: NotificationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private translator: multiLanguageTranslatorPipe,
    private _metadataService: MetadataService
  ) { }

  ngOnInit() {
    this.ItemData = this.formBuilder.group({
      PhaseID: ['', Validators.required],
      RejectReasonID: [''],
      RejectReason_EN: ['', Validators.required],
      RejectReason_AR: ['', Validators.required],
    });

    if (this.data.action === ActionType.edit) {
      this.actionType = 'edit_reject_reason';
      this.fillForm();
    } else if (this.data.action === ActionType.add) {
      this.actionType = 'add_reject_reason';
    }
  }

  fillForm() {
    this.ItemData.get('PhaseID').setValue(this.data.element.PhaseID);
    this.ItemData.get('RejectReasonID').setValue(this.data.element.RejectReasonID);
    this.ItemData.get('RejectReason_EN').setValue(this.data.element.RejectReason_EN);
    this.ItemData.get('RejectReason_AR').setValue(this.data.element.RejectReason_AR);
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

  save() {
    this.markFormGroupTouched(this.ItemData);
    if (this.ItemData.valid) {
      this.runSpinner = true;
      const obj = {
        templateName: 'RejectReason',
        objectID: this.ItemData.get('RejectReasonID').value,
        field1: this.ItemData.get('RejectReason_EN').value,
        field2: this.ItemData.get('RejectReason_AR').value,
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

  closeDialog(): void {
    this._dialogRef.close();
  }

}
