import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { FCTSDashBoard } from 'src/environments/environment';
import { CorrResponse } from '../../../services/correspondence-response.model';
import { DashboardFilterResponse, TransferAttributes } from '../../../models/DashboardFilter';

import { CorrespondenceDetailsService } from '../../../services/correspondence-details.service';
import { UserValueResponse, TransferRequestFinal } from './correspondence-transfer-dialog.model';
import { OrgStructureValidator } from './transfer-autocomlete.validator';
import { CorrespondenceShareService } from '../../../services/correspondence-share.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';

@Component({
  selector: 'correspondence-transfer-dialog',
  templateUrl: './correspondence-transfer-dialog.component.html'
})

export class TransferDialogBox implements OnInit {
  isReady = false;
  basehref: String = FCTSDashBoard.BaseHref;
  filteredEmpNames: Observable<DashboardFilterResponse[]>[] = [];
  filteredDepNames: Observable<DashboardFilterResponse[]>[] = [];
  TransferFormControlEmpName = new FormControl();
  TransferFormControlDepName = new FormControl();
  transfer_form: FormGroup;
  transferPurpose: any;
  transferPriority: any;
  index: string;
  transferRequestForm: FormGroup;
  transferAttribute: TransferAttributes;
  transferResponse: CorrResponse[];
  VolumeID: string;
  CoverID: string;
  CorrespondencType: string;
  locationid: string;
  validationError: Boolean = false;
  transfertry: Boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TransferDialogBox>,
    private _correspondenceDetailsService: CorrespondenceDetailsService,
    private _correspondenceShareService: CorrespondenceShareService,
    private transfer_data: FormBuilder,
    private route: ActivatedRoute,
    private translator: multiLanguageTranslatorPipe) {
    this.createForm();
  }

  createForm() {
    this.transferRequestForm = this.transfer_data.group({
      date: [{ value: '', disabled: true }, [Validators.required]],
      transfer_list: this.initItems()
    });
    this.ManageNameControl(0);
    this.isReady = true;
  }

  initItems() {
    const formArray = this.transfer_data.array([]);

    for (let i = 0; i < 1; i++) {
      formArray.push(this.transfer_data.group({
        Department: [''],
        Purpose: ['', Validators.required],
        To: [''],
        Role: [{ value: '', disabled: true }],
        Priority: ['', Validators.required],
        Comments: [''],
        DueDate: ['', Validators.required]
      }, { validator: OrgStructureValidator }));
    }
    return formArray;
  }

  ngOnInit() {
    this.VolumeID = this.route.snapshot.queryParamMap.get('VolumeID');
    this.CoverID = this.route.snapshot.queryParamMap.get('CoverID');
    this.CorrespondencType = this.route.snapshot.queryParamMap.get('CorrType');
    this.locationid = this.route.snapshot.queryParamMap.get('locationid');
    this.getTransferPurposeAndPriority();

  }

  ManageNameControl(index: number) {

    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    this.filteredDepNames[index] = arrayControl.at(index).get('Department').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._correspondenceDetailsService.searchTransferFieldName(value, 'DEP'))
      );

    this.filteredEmpNames[index] = arrayControl.at(index).get('To').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._correspondenceDetailsService.searchTransferFieldName(value, 'EMP'))
      );
  }

  get transferLists() {
    return this.transferRequestForm.get('transfer_list') as FormArray;
  }

  addTransferRow() {
    const controls = <FormArray>this.transferRequestForm.controls['transfer_list'];
    this.transferLists.push(this.transfer_data.group({
      Department: [''],
      Purpose: ['', Validators.required],
      To: [''],
      Role: [{ value: '', disabled: true }],
      Priority: ['', Validators.required],
      Comments: [''],
      DueDate: ['', Validators.required]
    }, { validator: OrgStructureValidator }));
    this.ManageNameControl(controls.length - 1);
    this.changePriority(controls.length - 1);
    this.transfertry = false;
  }

  deleteTransferRow(index) {
    this.transferLists.removeAt(index);
  }

  transferDielogBoxClose(action: string): void {
    this.dialogRef.close(action);
  }

  purposeChange() {
    this.transferPurpose = this.transferPurpose;
  }

  priorityChange() {
    this.transferPriority = this.transferPriority;
  }

  getTransferPurposeAndPriority() {
    this._correspondenceDetailsService.getTransferPurposeAndPriority()
      .subscribe(transferAttribute => {
        this.transferAttribute = transferAttribute;
        this.changePriority(0);
      });
  }

  displayFieldValue(fieldValue: UserValueResponse) {
    if (fieldValue) { return this.translator.transform(fieldValue.Val_En, fieldValue.Val_Ar) }
  }

  onEmployeeCheck(OrgName, pointIndex): void {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    arrayControl.at(pointIndex).get('Department').setValue({
      Val_En: OrgName.DepName_En + (OrgName.SecName_En ? ', ' + OrgName.SecName_En : ''),
      Val_Ar: OrgName.DepName_Ar + (OrgName.SecName_Ar ? ', ' + OrgName.SecName_Ar : '')
    });
    arrayControl.at(pointIndex).get('Role').setValue(this.translator.transform(OrgName.RoleName_En, OrgName.RoleName_Ar));
  }

  onDepartmentCheck(OrgName, pointIndex): void {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    arrayControl.at(pointIndex).get('Role').setValue(this.translator.transform(OrgName.RoleName_En, OrgName.RoleName_Ar));
    arrayControl.at(pointIndex).get('To').setValue({});
  }

  checkRecord(index): void {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    const employee = arrayControl.at(index).get('To').value;
    const department = arrayControl.at(index).get('Department').value;
    if (employee.RecipientUserID) {
      arrayControl.at(index).get('Department').setValue({
        Val_En: employee.DepName_En + (employee.SecName_En ? ', ' + employee.SecName_En : ''),
        Val_Ar: employee.DepName_Ar + (employee.SecName_Ar ? ', ' + employee.SecName_Ar : '')
      });
    } else if (department.RecipientUserID) {
      arrayControl.at(index).get('To').setValue({});
    } else {
      arrayControl.at(index).get('To').setValue({});
      arrayControl.at(index).get('Department').setValue({});
      arrayControl.at(index).get('Role').setValue('');
    }
  }

  postTransferToRequest(myForm: any): void {
    this.fieldTouch();
    if (this.transferRequestForm.valid) {
      const finalRequest: TransferRequestFinal[] = [];
      const CorArray = this.transferRequestForm.value;
      for (let i = 0; i < CorArray.transfer_list.length; i++) {
        const TList: TransferRequestFinal = new TransferRequestFinal;

        TList.Department = CorArray.transfer_list[i].Department.RecipientUserID;
        TList.To = CorArray.transfer_list[i].To.RecipientUserID;
        TList.Purpose = CorArray.transfer_list[i].Purpose;
        TList.Priority = CorArray.transfer_list[i].Priority;
        TList.Comments = CorArray.transfer_list[i].Comments;
        TList.DueDate = this._correspondenceShareService.DateToISOStringAbs(CorArray.transfer_list[i].DueDate);
        finalRequest.push(TList);
      }
      this._correspondenceDetailsService.createTransferRequest(finalRequest, this.data)
        .subscribe(transferResponse => {
          this.transferResponse = transferResponse;
          this.dialogRef.close('transfered');
        });
    } else {
      this.transfertry = true;
    }
  }

  fieldTouch() {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    for (let i = 0; i < arrayControl.length; i++) {
      arrayControl.at(i).get('Department').markAsTouched();
      arrayControl.at(i).get('To').markAsTouched();
      arrayControl.at(i).get('Purpose').markAsTouched();
    }
  }

  addGroup() {
    const val = this.transfer_data.group({
      Department: [''],
      Purpose: ['', Validators.required],
      To: [''],
      Role: [{ value: '', disabled: true }],
      Priority: ['', Validators.required],
      Comments: [''],
      DueDate: ['', Validators.required]
    }, { validator: OrgStructureValidator });
    this.newMethod(val);
  }

  private newMethod(val: FormGroup) {
    const transfer_form = this.transfer_form.get('times') as FormArray;
    transfer_form.push(val);
    this.index = ' ';
  }

  removeGroup(index: number) {
    const transfer_form = this.transfer_form.get('times') as FormArray;
    transfer_form.removeAt(index);
  }
  trackByFn(index: number, item: any) {
    return index;
  }

  groupChangePriority() {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    for (let i = 0; i < arrayControl.length; i++) {
      arrayControl.at(i).get('Priority').setValue(this.transferPriority);
      this.changeDueDate(i);
    }
  }

  groupChangePurpose() {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    for (let i = 0; i < arrayControl.length; i++) {
      arrayControl.at(i).get('Purpose').setValue(this.transferPurpose);
    }
  }

  changePriority(i: number) {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    const toSelect = this.transferAttribute.Priority.find(c => c.Priority_EN === 'Normal');
    arrayControl.at(i).get('Priority').setValue(toSelect.ID);
    this.changeDueDate(i);
  }

  changeDueDate(i: number): void {
    const arrayControl = this.transferRequestForm.get('transfer_list') as FormArray;
    const date = new Date();
    const toSelect = this.transferAttribute.Priority.find(c => c.ID === arrayControl.at(i).get('Priority').value);
    date.setDate(date.getDate() + toSelect.NumberOfDays);
    arrayControl.at(i).get('DueDate').setValue(date);
  }

  emptyAction() {
    return false;
  }

}
