import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MetadataService } from 'src/app/dashboard/administration/services/metadata.service';
import { ActionType } from 'src/app/dashboard/administration/models/metadata.model';
import { NumberValidators } from '../../../validators/form.validator';

@Component({
  selector: 'app-edit-priority-dialog',
  templateUrl: './edit-priority-dialog.component.html'
})
export class EditPriorityDialogComponent implements OnInit {
  actionType: string;
  runSpinner: boolean;

  ItemData: FormGroup;
  interactionStructure = [
    {
      name: 'priority',
      controlName: 'Priority_EN',
      inputLength: 255,
      type: 'text'
    },
    {
      name: 'priority_ar',
      controlName: 'Priority_AR',
      inputLength: 255,
      type: 'text'
    },
    {
      name: 'number_of_days',
      controlName: 'NumberOfDays',
      inputLength: '',
      type: 'number'
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
      PriorityID: [''],
      Priority_EN: ['', Validators.required],
      Priority_AR: ['', Validators.required],
      NumberOfDays: ['', [Validators.required, NumberValidators.onlyNumbers()]],
    });

    if (this.data.action === ActionType.edit && this.data.element) {
      this.actionType = 'edit_priority';
      this.fillForm();
    } else if (this.data.action === ActionType.add) {
      this.actionType = 'add_priority';
    }
  }

  fillForm() {
    this.ItemData.get('PriorityID').setValue(this.data.element.PriorityID);
    this.ItemData.get('NumberOfDays').setValue(this.data.element.NumberOfDays);
    this.ItemData.get('Priority_EN').setValue(this.data.element.Priority_EN);
    this.ItemData.get('Priority_AR').setValue(this.data.element.Priority_AR);
  }

  save() {
    this.markFormGroupTouched(this.ItemData);
    if (this.ItemData.valid) {
      this.runSpinner = true;
      const obj = {
        templateName: 'Priority',
        objectID: this.ItemData.get('PriorityID').value,
        field1: this.ItemData.get('Priority_EN').value,
        field2: this.ItemData.get('Priority_AR').value,
        field3: '',
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

  closeDialog(): void {
    this._dialogRef.close();
  }

}
