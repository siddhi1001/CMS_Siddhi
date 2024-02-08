import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MetadataService } from 'src/app/dashboard/administration/services/metadata.service';
import { ActionType } from 'src/app/dashboard/administration/models/metadata.model';
import { NumberValidators } from '../../../validators/form.validator';

@Component({
  selector: 'app-year-receiver-dialog',
  templateUrl: './year-receiver-dialog.component.html'
})
export class YearReceiverDialogComponent implements OnInit {
  ItemData: FormGroup;

  header: string;
  runSpinner: boolean;

  interactionStructure = [
    {
      name: 'year',
      controlName: 'Name_EN',
      inputLength: 255,
      type: 'number'
    },
    {
      name: 'year_ar',
      controlName: 'Name_AR',
      inputLength: '255',
      type: 'number'
    },
    {
      name: 'is_full',
      controlName: 'IsFull',
      inputLength: '',
      type: ''
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public _dialogRef: MatDialogRef<any>,
    private notificationmessage: NotificationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private translator: multiLanguageTranslatorPipe,
    private _metadataService: MetadataService
  ) { }

  ngOnInit() {
    this.ItemData = this.formBuilder.group({
      ID: [''],
      Name_EN: ['', [Validators.required, NumberValidators.range(1999, 2999)]],
      Name_AR: ['', [Validators.required, NumberValidators.range(1999, 2999)]],
      IsFull: ['0']
    });

    if (this.data.action === ActionType.edit) {
      this.fillForm();
      this.header = 'edit_year';
    } else {
      this.header = 'add_year';
    }
  }

  fillForm() {
    this.ItemData.get('ID').setValue(this.data.element.ID);
    this.ItemData.get('Name_EN').setValue(this.data.element.Name_EN);
    this.ItemData.get('Name_AR').setValue(this.data.element.Name_AR);
    this.ItemData.get('IsFull').setValue(this.data.element.IsFull);
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
        templateName: 'Year',
        objectID: this.ItemData.get('ID').value,
        field1: this.ItemData.get('Name_EN').value,
        field2: this.ItemData.get('Name_AR').value,
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

  closeDialog(): void {
    this._dialogRef.close();
  }

}
