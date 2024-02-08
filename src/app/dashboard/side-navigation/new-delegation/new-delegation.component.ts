import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CorrespondenceDetailsService } from '../../services/correspondence-details.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SidebarInfoService } from '../sidebar-info.service';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { NotificationService } from '../../services/notification.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { DelegationRequest } from 'src/app/dashboard/side-navigation/sidebar-info.model';
import { OrgNameAutoFillModelSimpleUser } from '../../models/CorrespondenenceDetails.model';
import { OrgStructureValidator } from './delegation-autocomlete.validator';
import { ConfirmationDialogComponent } from 'src/app/dashboard/dialog-boxes/confirmation-dialog/confirmation-dialog.component';
import { FCTSDashBoard } from '../../../../environments/environment';
import { multiLanguageTranslator, multiLanguageTranslatorPipe } from 'src/assets/translator/index';

@Component({
  selector: 'app-new-delegation',
  templateUrl: './new-delegation.component.html',
  styleUrls: ['./new-delegation.component.scss']
})

export class NewDelegationComponent implements OnInit {

  public globalConstants = this.appLoadConstService.getConstants();
  basehref: String = FCTSDashBoard.BaseHref;
  delegationForm: FormGroup;
  filteredDelNames: Observable<OrgNameAutoFillModelSimpleUser[]>[] = [];
  cStartTime = new Date;
  cEndTime = new Date;
  clicked = false;
  rowsCount = 1;

  constructor(
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogRef: MatDialogRef<NewDelegationComponent>,
    public appLoadConstService: AppLoadConstService,
    public dialogU: MatDialog,
    public translatorService: multiLanguageTranslator,
    public translator: multiLanguageTranslatorPipe,
    private notificationmessage: NotificationService,
    private sidebarInfoService: SidebarInfoService,
    private delegation_data: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.cStartTime.setHours(0);
    this.cStartTime.setMinutes(0);
    this.cEndTime.setHours(0);
    this.cEndTime.setMinutes(0);
    this.MakeDelegateeActive(0);
  }

  ManageNameControl(index: number) {
    const arrayControl = this.delegationForm.get('delegation_list') as FormArray;
    this.filteredDelNames[index] = arrayControl.at(index).get('Delegatee').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.sidebarInfoService.searchFieldForAutoFill(value, 'IntNameSimple', ''))
      );
  }

  get delegationLists() {
    return this.delegationForm.get('delegation_list') as FormArray;
  }

  createForm() {
    this.delegationForm = this.delegation_data.group({
      delegation_list: this.initItems(),
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required]
    });
    this.ManageNameControl(0);
  }

  initItems() {
    const formArray = this.delegation_data.array([]);
    for (let i = 0; i < 1; i++) {
      formArray.push(this.delegation_data.group({
        Delegatee: ['', [Validators.required, OrgStructureValidator]],
        Active: ['']
      }));
    }
    return formArray;
  }

  addDelegatee() {
    const controls = <FormArray>this.delegationForm.controls['delegation_list'];
    this.delegationLists.push(this.delegation_data.group({
      Delegatee: ['', [Validators.required, OrgStructureValidator]],
      Active: ['']
    }));
    this.ManageNameControl(controls.length - 1);
    this.rowsCount = controls.length;
  }

  displayFieldValue(fieldValue: OrgNameAutoFillModelSimpleUser) {
    if (fieldValue) { return fieldValue.Val_En; }
  }

  deleteDelegateeRow(index) {
    const arrayControl = this.delegationForm.get('delegation_list') as FormArray;
    const ifActive = arrayControl.at(index).get('Active').value;
    this.delegationLists.removeAt(index);
    this.rowsCount = arrayControl.length;
    for (let i = index; i < arrayControl.length; i++) {
      this.ManageNameControl(i);
    }
    if (ifActive === 'Active') {
      this.MakeDelegateeActive(0);
    }
  }

  MakeDelegateeActive(index) {
    const arrayControl = this.delegationForm.get('delegation_list') as FormArray;
    for (let i = 0; i < arrayControl.length; i++) {
      arrayControl.at(i).get('Active').setValue('Unactive');
    }
    arrayControl.at(index).get('Active').setValue('Active');
  }

  postTransferToRequest(): void {
    this.fieldTouch();

    if (this.delegationForm.valid) {
      const finalRequest: DelegationRequest = new DelegationRequest;
      const DArray = this.delegationForm.value;
      const EList: string[] = [];

      finalRequest.creatorID = this.globalConstants.general.UserID;
      finalRequest.userID = this.globalConstants.general.UserID;

      for (let i = 0; i < DArray.delegation_list.length; i++) {
        if (DArray.delegation_list[i].Active === 'Active') {
          finalRequest.active_delegatee = DArray.delegation_list[i].Delegatee.RecipientUserID.toString();
        }
        EList.push(DArray.delegation_list[i].Delegatee.RecipientUserID);
      }

      const checkForm = this.checkFunction(finalRequest, DArray);

      if (!checkForm.error) {
        finalRequest.delegation_start_date = this.DateToString(DArray.startDate, DArray.startTime);
        finalRequest.delegation_end_date = this.DateToString(DArray.endDate, DArray.endTime);
        finalRequest.delegatees = EList.toString();
        if (checkForm.activate) {
          this.userConfirmation('activateDelegation', finalRequest, checkForm.activate);
        } else {
          this.createDelegationRequest(finalRequest, checkForm.activate);
        }
      }
    } else {
      this.notificationmessage.error('Delegation form error',this.translator.transform('please_fill_the_highlighted_fields') , 2500);
    }
  }

  userConfirmation(mess: string, finalRequest: DelegationRequest, activate: number): void {
    const dialogRef = this.dialogU.open(ConfirmationDialogComponent, {
      width: '100%',
      panelClass: 'userConfirmation',
      maxWidth: '30vw',
      data: {
        message: mess
      }
    }).afterClosed().subscribe(
      response => {
        if (response) {
          this.createDelegationRequest(finalRequest, activate);
        }
      });
  }

  createDelegationRequest(finalRequest: DelegationRequest, activate: number) {
    this.clicked = true;
    this.sidebarInfoService.createDelegationRequest(finalRequest, this.data.section)
      .subscribe(delegationResponse => {
        if (delegationResponse.error) {
          this.notificationmessage.error('Delegation form error', delegationResponse.error, 2500);
        } else if (delegationResponse.CSGroupID && activate) {
          this.activateDelegation();
        } else if (delegationResponse.CSGroupID && !activate) {
          this.closeDialog();
          this.notificationmessage.success('Delegation Created Succesfully', this.translator.transform('gbl_msg_delegation_created'), 2500);
        }
      },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  activateDelegation() {
    this.sidebarInfoService.activateDelegation()
      .subscribe(
        response => {
          this.closeDialog();
          this.notificationmessage.success('Delegation Created Succesfully', this.translator.transform('gbl_msg_delegation_activated_and_created'), 2500);
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
  }

  checkFunction(finalRequest, DArray) {
    let error = false;
    let activate = 0;

    const currentDateTime = new Date;
    const currentDate = new Date;
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);


    const endDate = DArray.endDate;
    endDate.setHours(DArray.endTime.getHours());
    endDate.setMinutes(DArray.endTime.getMinutes());

    const startDate = DArray.startDate;
    startDate.setHours(DArray.startTime.getHours());
    startDate.setMinutes(DArray.startTime.getMinutes());

    // Destination check
    if (finalRequest.userID === finalRequest.active_delegatee) {
      this.notificationmessage.error('Delegation form error', this.translator.transform('gbl_err_users_have_to_be_different'), 2500);
      error = true;
    }
    // Dates check
    if (endDate <= currentDateTime) {
      this.notificationmessage.error('Delegation form error', this.translator.transform('gbl_err_end_date_should_be_greater_than_today'), 2500);
      error = true;
    }
    if (startDate < currentDate) {
      this.notificationmessage.error('Delegation form error',this.translator.transform('gbl_err_start_date_should_be_today_or_greater'), 2500);
      error = true;
    }
    if (startDate >= endDate) {
      this.notificationmessage.error('Delegation form error',this.translator.transform('gbl_err_end_date_should_be_greater_than_start_date'), 2500);
      error = true;
    }
    if (startDate >= currentDate && startDate <= currentDateTime) {
      activate = 1;
    }
    return { error: error, activate: activate };
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

  fieldTouch() {
    const arrayControl = this.delegationForm.get('delegation_list') as FormArray;
    for (let i = 0; i < arrayControl.length; i++) {
      arrayControl.at(i).get('Active').markAsTouched();
      arrayControl.at(i).get('Delegatee').markAsTouched();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setTimeDisabled() {
    setTimeout(function () {
      const inputs = document.getElementsByClassName('owl-dt-timer-input');
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute('disabled', '');
      }
    }, 100);
  }
}
