import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { MetadataService } from 'src/app/dashboard/administration/services/metadata.service';
import { ActionType } from 'src/app/dashboard/administration/models/metadata.model';

@Component({
  selector: 'app-filing-plan-dialog',
  templateUrl: './filing-plan-dialog.component.html'
})
export class FilingPlanDialogComponent implements OnInit {
  ItemData: FormGroup;
  runSpinner: boolean;
  header: string;

  interactionStructure = [
    {
      name: this.data.title.parent,
      controlName: 'ParentName',
      inputLength: '',
      type: ''
    },
    {
      name: this.data.title.name,
      controlName: 'Name_EN',
      inputLength: 255,
      type: 'text'
    },
    {
      name: this.data.title.name_ar,
      controlName: 'Name_AR',
      inputLength: 255,
      type: 'text'
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
      Name_EN: ['', Validators.required],
      Name_AR: ['', Validators.required],
      IsFull: ['0'],
      ParentID: [this.data.itemParent.ID],
      ParentName: [{
        value: this.translator.transform(this.data.itemParent.Name_EN, this.data.itemParent.Name_AR),
        disabled: true
      }],
    });

    if (this.data.action === ActionType.edit) {
      this.fillForm();
      this.header = this.data.title.editHeader;
    } else {
      this.header = this.data.title.addHeader;
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
        templateName: this.data.title.templateName,
        objectID: this.ItemData.get('ID').value,
        field1: this.ItemData.get('Name_EN').value,
        field2: this.ItemData.get('Name_AR').value,
        field3: this.ItemData.get('ParentID').value,
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
