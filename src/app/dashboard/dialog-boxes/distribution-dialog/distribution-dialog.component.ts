import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { TransferAttributes } from 'src/app/dashboard/models/DashboardFilter';
import { DistributionDetailsParameters, DistributionSaveObj } from 'src/app/dashboard/models/distribution.model';
import { TableStructureParameters } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { ResizedEvent } from 'angular-resize-event';

@Component({
  selector: 'app-distribution-dialog',
  templateUrl: './distribution-dialog.component.html',
  styleUrls: ['./distribution-dialog.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DistributionDialogComponent implements OnInit {
  distributionForm: FormGroup;
  distributionUsers: FormArray;
  distributionDetails: DistributionDetailsParameters[];
  loadSpinner = true;
  distributionAttributes: TransferAttributes;

  @ViewChild('tableContainer') container: ElementRef;

  fullDistTableStructure: TableStructureParameters[] = [
    { 'columnDef': 'Icon', 'columnName': '', 'priority': 1 },
    { 'columnDef': 'Department', 'columnName': 'Department', 'priority': 7 },
    { 'columnDef': 'To', 'columnName': 'To', 'priority': 1 },
    { 'columnDef': 'RoleName', 'columnName': 'Role Name', 'priority': 7 },
    { 'columnDef': 'FlowSeq', 'columnName': 'FlowSeq', 'priority': 1 },
    { 'columnDef': 'Purpose', 'columnName': 'Purpose', 'priority': 5 },
    { 'columnDef': 'Priority', 'columnName': 'Priority', 'priority': 4 },
    { 'columnDef': 'Days', 'columnName': 'Days', 'priority': 1 },
    { 'columnDef': 'DueDate', 'columnName': 'Due Date', 'priority': 1 },
    { 'columnDef': 'Comments', 'columnName': 'Comments', 'priority': 6 }
  ];

  daysArr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  seqList: number[] = [];

  distTableStructure: TableStructureParameters[];
  distTableStructureDetails: TableStructureParameters[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DistributionDialogComponent>,
    private formBuilder: FormBuilder,
    private errorHandlerFctsService: ErrorHandlerFctsService,
    private correspondenceDetailsService: CorrespondenceDetailsService,
    private correspondenceShareService: CorrespondenceShareService,
  ) { }

  ngOnInit() {

    this.formTableStructure(this.container.nativeElement.clientWidth);
    this.distributionForm = this.formBuilder.group({
      distributionUsers: this.formBuilder.array([])
    });
    this.getDistributionUsers(this.data.DCID);
    this.getSelectParameters();
  }

  onResized(event: ResizedEvent) {
    this.formTableStructure(event.newWidth);
  }

  getSelectParameters() {
    this.correspondenceDetailsService.getTransferPurposeAndPriority()
      .subscribe(
        response => {
          this.distributionAttributes = response;
        },
        responseError => {
          this.loadSpinner = false;
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  formTableStructure(width: number): void {
    const priority = this.correspondenceDetailsService.definePriorityToShow(width);
    this.distTableStructure = this.fullDistTableStructure.filter((element) => {
      return element.priority <= priority;
    });
    this.distTableStructureDetails = this.fullDistTableStructure.filter((element) => {
      return element.priority > priority;
    });
  }

  getDistributionUsers(DCID: string): void {
    this.correspondenceDetailsService.getDistributionUsers(DCID)
      .subscribe(
        response => {
          this.distributionDetails = response;
          this.distributionDetails.forEach(element => {
            if (this.seqList.indexOf(Number(element.FlowSeq)) === -1) {
              this.seqList.push(Number(element.FlowSeq));
            }
            this.addUser(element);
            this.loadSpinner = false;
          });
        },
        responseError => {
          this.loadSpinner = false;
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }

  addUser(user: DistributionDetailsParameters): void {
    this.distributionUsers = this.distributionForm.get('distributionUsers') as FormArray;
    this.distributionUsers.push(this.createNewUser(user));
  }

  createNewUser(user: DistributionDetailsParameters): FormGroup {
    return this.formBuilder.group({
      DistCode: new FormControl({ value: user.DistCode, disabled: false }),
      DistCodeVer: new FormControl({ value: user.DistCodeVer, disabled: false }),
      InitStatus: new FormControl({ value: user.InitStatus, disabled: false }),
      Department_EN: new FormControl({ value: user.DepartmentName_EN, disabled: false }),
      Department_AR: new FormControl({ value: user.DepartmentName_AR, disabled: false }),
      To_ID: new FormControl({ value: user.trUserID, disabled: false }),
      To_EN: new FormControl({ value: user.Name_EN, disabled: false }),
      To_AR: new FormControl({ value: user.Name_AR, disabled: false }),
      Title_EN: new FormControl({ value: user.Role_EN, disabled: false }),
      Title_AR: new FormControl({ value: user.Role_AR, disabled: false }),
      RoleID: new FormControl({ value: user.DistRole, disabled: false }),
      RoleName_EN: new FormControl({ value: user.DistribRole_EN, disabled: false }),
      RoleName_AR: new FormControl({ value: user.DistribRole_AR, disabled: false }),
      FlowSeq: new FormControl({ value: Number(user.FlowSeq), disabled: false }),
      Purpose: new FormControl({ value: Number(user.PurposeCode), disabled: false }),
      Priority: new FormControl({ value: Number(user.PriorityCode), disabled: false }),
      Days: new FormControl({ value: Number(user.DueDays), disabled: false }),
      DueDate: new FormControl({ value: this.getDueDate(Number(user.FlowSeq), Number(user.DueDays)), disabled: false }),
      Comments: new FormControl({ value: user.Comments, disabled: false }),
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getDueDate(seq: number, dueDays: number): Date {
    const previousSeqIndex = this.seqList.indexOf(seq) - 1;
    if (previousSeqIndex >= 0) {
      return this.addDays(this.seqMaxDate(this.seqList[previousSeqIndex]), dueDays);
    } else {
      const date = new Date();
      return this.addDays(date, dueDays);
    }
  }

  addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  seqMaxDate(seq: number): Date {
    const distributionDetails = this.distributionForm.get('distributionUsers') as FormArray;
    let seqArr = distributionDetails.value.filter(element => {
      return element.FlowSeq === seq;
    });
    let newDate = seqArr[0].DueDate;
    seqArr.forEach(element => {
      if (element.DueDate > newDate) { newDate = element.DueDate; }
    });
    return newDate;
  }

  changeDueDate(index: number): void {
    const distributionDetails = this.distributionForm.get('distributionUsers') as FormArray;
    for (let i = index; i < distributionDetails.value.length; i++) {
      const seq = distributionDetails.at(i).get('FlowSeq').value;
      const dueDays = distributionDetails.at(i).get('Days').value;
      distributionDetails.at(i).get('DueDate').setValue(this.getDueDate(seq, dueDays));
    }
  }

  allParametersChange(parameter: string, event): void {
    const distributionDetails = this.distributionForm.get('distributionUsers') as FormArray;
    for (let i = 0; i < distributionDetails.value.length; i++) {
      distributionDetails.at(i).get(parameter).setValue(event.value);
    }
  }

  saveDistribution(): void {
    this.loadSpinner = true;
    const distributionDetails = this.distributionForm.get('distributionUsers') as FormArray;
    const finalRequest: DistributionSaveObj[] = [];
    const distArr = distributionDetails.value;
    for (let i = 0; i < distArr.length; i++) {
      const DList: DistributionSaveObj = new DistributionSaveObj;
      DList.DistCode = distArr[i].DistCode;
      DList.DistCodeVer = distArr[i].DistCodeVer;
      DList.InitStatus = distArr[i].InitStatus;
      DList.To = distArr[i].To_ID;
      DList.Purpose = distArr[i].Purpose;
      DList.Priority = distArr[i].Priority;
      DList.Comments = distArr[i].Comments;
      DList.DueDays = distArr[i].Days;
      DList.FlowSeq = distArr[i].FlowSeq;
      DList.DistRole = distArr[i].RoleID;
      DList.DueDate = this.correspondenceShareService.DateToISOStringAbs(distArr[i].DueDate);
      DList.TransDate = this.correspondenceShareService.DateToISOStringAbs(DList.FlowSeq - 1 > 0 ? this.seqMaxDate(DList.FlowSeq - 1) : new Date());
      finalRequest.push(DList);
    }
    this.correspondenceDetailsService.createDistributionRequest(finalRequest, this.data.correspondenceData)
      .subscribe(response => {
        //this.correspondenceDetailsService.prepSetTransferStatus(response, this.data.correspondenceData, 1, '');
        this.dialogRef.close('distributed');
      },
        responseError => {
          this.loadSpinner = false;
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        });
  }
}
