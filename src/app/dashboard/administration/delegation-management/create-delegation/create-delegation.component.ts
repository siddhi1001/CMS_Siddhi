import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { DelegationService } from '../../services/delegation.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { ConfirmationDialogComponent } from '../../admin-dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { DelegationUsers } from '../../validators/form.validator';
import { UsersAutocompleteModel, DelegationRequest } from '../../models/delegation.model';


@Component({
  selector: 'app-create-delegation',
  templateUrl: './create-delegation.component.html',
  styleUrls: ['./create-delegation.component.scss']
})
export class CreateDelegationComponent implements OnInit {

  DelegationData: FormGroup;
  delegateeList: Observable<UsersAutocompleteModel[]>[] = [];
  usersAutocml: Observable<UsersAutocompleteModel[]>;
  proxyCounter = 1;
  formDefaultState;
  isLoading = false;

  constructor(
    public dialogU: MatDialog,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    private formBuilder: FormBuilder,
    private _delegationService: DelegationService,
    private translator: multiLanguageTranslatorPipe,
    private notificationmessage: NotificationService) { }

  ngOnInit() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    this.DelegationData = this.formBuilder.group({
      Delegator: new FormControl('', [Validators.required, DelegationUsers]),
      StartDate: new FormControl('', Validators.required),
      StartTime: new FormControl(date, Validators.required),
      EndDate: new FormControl('', Validators.required),
      EndTime: new FormControl(date, Validators.required),
      ProxyData: this.formBuilder.array([]),
    });
    this.usersAutocml = this.DelegationData.get('Delegator').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value =>
          this._delegationService.delegationUsersAutoCmpl(value)
        )
      );

    this.addProxy();
    this.formDefaultState = this.DelegationData.value;
  }

  addProxy(): void {
    const controls = this.DelegationData.get('ProxyData') as FormArray;
    controls.push(this.createNewProxy(controls.length));
    this.ManageNameControl(controls.length - 1);
    this.proxyCounter = controls.length;
  }

  createNewProxy(index: number): FormGroup {
    return this.formBuilder.group({
      Delegatee: new FormControl('', [Validators.required, DelegationUsers]),
      Active: new FormControl(index > 0 ? false : true)
    });
  }

  ManageNameControl(index: number): void {
    const controls = this.DelegationData.get('ProxyData') as FormArray;
    this.delegateeList[index] = controls.at(index).get('Delegatee').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._delegationService.delegationUsersAutoCmpl(value))
      );
  }

  displayFieldValue(fieldValue: any) {
    if (fieldValue) { return this.translator.transform(fieldValue.Name_EN, fieldValue.Name_AR); }
  }

  removeDelegatee(index: number): void {
    const arrayControls = this.DelegationData.get('ProxyData') as FormArray;
    const isActive = arrayControls.at(index).get('Active').value;
    arrayControls.removeAt(index);
    this.proxyCounter--;
    this.delegateeList = new Array();
    arrayControls.controls.forEach((element, index) => {
      this.ManageNameControl(index);
    });
    if (isActive) {
      arrayControls.at(0).get('Active').setValue(true);
    }
  }


  prepareRequestData() {
    this.markFormGroupTouched(this.DelegationData);
    if (this.DelegationData.valid) {
      const obj = this.DelegationData.value;
      const arrayControl = this.DelegationData.get('ProxyData') as FormArray;
      const delegatee = arrayControl.value.find(element => {
        return element.Active;
      });
      const finalRequest: DelegationRequest = new DelegationRequest;
      finalRequest.userID = obj.Delegator.KuafID;
      finalRequest.delegation_start_date = this.DateToString(obj.StartDate, obj.StartTime);
      finalRequest.delegation_end_date = this.DateToString(obj.EndDate, obj.EndTime);
      finalRequest.delegatees = arrayControl.value.map(element => {
        return element.Delegatee.KuafID;
      });
      finalRequest.active_delegatee = delegatee.Delegatee.KuafID;
      const checkResult = this.checkFunction(finalRequest);
      if (!checkResult.error) {
        if (checkResult.activate) {
          this.userConfirmation(finalRequest);
        } else {
          this.createDelegationRequest(finalRequest);
        }
      }
    }
  }

  checkFunction(finalRequest: DelegationRequest) {
    const currentDateTime = new Date();
    const currentDate = this.setZeroTime(new Date());

    const endDate = this.DelegationData.get('EndDate').value;
    endDate.setHours(this.DelegationData.get('EndTime').value.getHours());
    endDate.setMinutes(this.DelegationData.get('EndTime').value.getMinutes());
    const startDate = this.DelegationData.get('StartDate').value;
    startDate.setHours(this.DelegationData.get('StartTime').value.getHours());
    startDate.setMinutes(this.DelegationData.get('StartTime').value.getMinutes());

    // Destination check
    if (finalRequest.userID === finalRequest.active_delegatee) {
      this.showNotification('error', 'gbl_err_users_have_to_be_different');
      return { error: true, activate: false };
    }
    // Dates check
    if (endDate <= currentDateTime) {
      this.showNotification('error', 'gbl_err_end_date_should_be_grater_than_today');
      return { error: true, activate: false };
    }
    if (startDate < currentDate) {
      this.showNotification('error', 'gbl_err_start_date_should_be_today_or_grater');
      return { error: true, activate: false };
    }
    if (startDate >= endDate) {
      this.showNotification('error', 'gbl_err_end_date_should_be_grater_than_start_date');
      return { error: true, activate: false };
    }
    if (startDate >= currentDate && startDate <= currentDateTime) {
      return { error: false, activate: true };
    }
    return { error: false, activate: false };
  }

  showNotification(type: string, msg: string): void {
    console.log(msg);
    this.notificationmessage[type](
      this.translator.transform('delegation_form_message'),
      this.translator.transform(msg), 2500);
  }

  createDelegationRequest(finalRequest: DelegationRequest, activate: boolean = false) {
    this.isLoading = true;
    this._delegationService.createDelegationRequest(finalRequest)
      .subscribe(
        response => {
          if (response.error) {
            this.showNotification('error', response.error);
          } else if (response.CSGroupID && activate) {
            this.activateDelegation();
          } else if (response.CSGroupID && !activate) {
            this.showNotification('success', 'gbl_msg_delegation_created');
            this.resetForm();
          }
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        },
        () => {
          this.isLoading = false;
        });
  }

  activateDelegation() {
    this._delegationService.activateDelegation()
      .subscribe(
        response => {
          this.showNotification('success', 'gbl_msg_delegation_activated_and_created');
          this.resetForm();
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }


  userConfirmation(finalRequest: DelegationRequest): void {
    const dialogRef = this.dialogU.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'dialog-box-wrapper',
      maxWidth: '30vw',
      data: {
        message: 'msg_delegation_activation'
      }
    }).afterClosed().subscribe(
      response => {
        if (response) {
          this.createDelegationRequest(finalRequest, true);
        }
      });
  }

  setZeroTime(date) {
    if (date instanceof Date) {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  }

  DateToString(mDate, mTime): string {
    function pad(n) { return n < 10 ? '0' + n : n; }
    if (mDate instanceof Date && mTime instanceof Date) {
      return 'D' + '/'
        + mDate.getFullYear() + '/'
        + pad(mDate.getMonth() + 1) + '/'
        + pad(mDate.getDate()) + ':'
        + pad(mTime.getHours()) + ':'
        + pad(mTime.getMinutes()) + ':'
        + pad(mDate.getSeconds());
    } else {
      return '';
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    /*     (<any>Object).values(formGroup.controls).forEach(control => {
          control.markAsTouched();
          
          if (control.controls) {
            this.markFormGroupTouched(control);
          }
        }); */
    Object.keys(formGroup.controls).map(x => formGroup.controls[x]).forEach(control => {
      control.markAsTouched();
      if (control['controls']) {
        control['controls'].forEach(element => {
          this.markFormGroupTouched(element);
        });
      }
    });
  }

  MakeDelegateeActive(index) {
    const arrayControl = this.DelegationData.get('ProxyData') as FormArray;
    for (let i = 0; i < arrayControl.length; i++) {
      if (i !== index) {
        arrayControl.at(i).get('Active').setValue(false);
      }
    }
    arrayControl.at(index).get('Active').setValue(false);
  }

  resetForm() {
    const arrayControl = this.DelegationData.get('ProxyData') as FormArray;
    if (arrayControl.length > 1) {
      do {
        this.removeDelegatee(1);
      } while (arrayControl.length > 1);
    }
    this.DelegationData.reset(this.formDefaultState);
  }

  DelegationUsersValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const empl = control.value && control.value.KuafID;
    return empl ? null : { 'emptyOrg': true };
  }

}
