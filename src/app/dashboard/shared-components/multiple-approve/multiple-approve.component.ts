import { Component, OnInit, ViewChild, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { CodegenComponentFactoryResolver } from '@angular/core/src/linker/component_factory_resolver';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { FCTSDashBoard } from 'src/environments/environment';
import { OrgNameAutoFillModelSimpleUser } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SidebarInfoService } from 'src/app/dashboard/side-navigation/sidebar-info.service';
import { MatDialog, MatCheckboxChange, MatOptionSelectionChange } from '@angular/material';
import { AddApproverDialogComponent } from 'src/app/dashboard/dialog-boxes/add-approver-dialog/add-approver-dialog.component';
import { containsElement } from '@angular/animations/browser/src/render/shared';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';

export interface MultipleApproveInputData {
  CorrID: string;
  VolumeID: string;
  TeamID: number;
  UserID: number;
  fChangeTeam: boolean;
  fGetStructure: boolean;
  fGetTeamStructure: boolean;
  fInitStep: boolean;
  mainLanguage: string;
  taskID: string;
  selectApproverStep: string;
  selectFinalApproverStep: string;
  approveStep: string;
  approveAndSignStep: string;
}

export interface ApproversData {
  ApproveLevel: number;
  Approver: ApproverDetails[];
  ApproverGroup: ApproverDetails[];
  CorrID: string;
  HSS_multi: ApproverDetails[];
  HS_multi: ApproverDetails[];
  IsActive: number;
  IsDone: number;
  LevelName_AR: string;
  LevelName_EN: string;
  SecretaryGroup: ApproverDetails[];
  SkipSecretary: boolean;
  isMandatory: number;
}

export interface ApproverDetails {
  ID?: number;
  Approver_EN?: string;
  Approver_AR?: string;
}

export interface ApproversFormData {
  ApproveLevel: number;
  ApproverID: any;
  IsActive: number;
  IsDone: number;
  LevelName_AR: string;
  LevelName_EN: string;
  SecretaryGroupID: number;
  SkipSecretary: boolean;
  isMandatory: number;
}

export interface CurrentApprovers {
  minLevel: ApproversFormData;
  maxLevel: ApproversFormData;
}

@Component({
  selector: 'app-multiple-approve',
  templateUrl: './multiple-approve.component.html',
  styleUrls: ['./multiple-approve.component.scss']
})
export class MultipleApproveComponent implements OnInit {
  approversData: ApproversData[];
  approverDetailsForm: FormGroup;
  approverDetails: FormArray;
  basehref: String = FCTSDashBoard.BaseHref;
  filteredNames: Observable<ApproverDetails[]>[] = [];
  firstLoadSpinner = true;
  formBuilded = false;
  ApproverList: any[];
  isSelectApproverStep: boolean;
  isApproveStep: boolean;
  currentLevel: ApproversData;
  approverSelected: number;



  constructor(
    public correspondenceDetailsService: CorrespondenceDetailsService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    private formBuilder: FormBuilder,
    public dialogU: MatDialog,
    private notificationmessage: NotificationService,
    private translator: multiLanguageTranslatorPipe
  ) { }

  @Input() approve: MultipleApproveInputData;
  @Input() sectionDisabled: boolean;
  @Output() orgChart = new EventEmitter<any>();
  @Output() senderReload = new EventEmitter<number>();

  @Input() confidential: boolean;

  ngOnInit() {
    this.isSelectApproverStep = this.approve.taskID === this.approve.selectApproverStep
      || this.approve.taskID === this.approve.selectFinalApproverStep;
    this.isApproveStep = this.approve.taskID === this.approve.approveStep
      || this.approve.taskID === this.approve.approveAndSignStep;
    this.approverDetailsForm = this.formBuilder.group({
      approverDetails: this.formBuilder.array([])
    });
    this.getApproversData();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName) && !changes[propName].firstChange) {
        switch (propName) {
          case 'approve': {
            this.firstLoadSpinner = true;
            this.removeAll();
            this.getApproversData();
          }
            break;
          case 'confidential': this.setConfidential();
            break;
          default: console.log('Error in Approve component');
        }
      }
    }

  }

  getOrgChart() {
    this.orgChart.next();
  }

  senderReloadAction(level: number) {
    this.senderReload.next(level);
  }

  getApproversData() {
    this.correspondenceDetailsService.getApproversData(this.approve).subscribe(
      response => {
        this.approversData = response;
        let newArr = this.approversData.filter(element => {
          return element.IsActive === 1 && element.IsDone === 0;
        });
        this.currentLevel = newArr[0];
        this.getApprovers();
        this.approversData.forEach(element => {
          if (element.IsActive > 0) {
            this.addApprover(element);
          }
        });
        this.firstLoadSpinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.firstLoadSpinner = false;
      }
    );
  }


  formRebuild(levelsArr: number[]) {
    this.removeAll();
    this.approversData.forEach(element => {
      if (levelsArr.indexOf(element.ApproveLevel) > -1) {
        this.addApprover(element);
      }
    });
  }

  addApprover(approver: ApproversData): void {
    this.approverDetails = this.approverDetailsForm.get('approverDetails') as FormArray;
    this.approverDetails.push(this.createNewApprover(approver));
    if (approver.ApproveLevel === 1) {
      this.ManageNameControl(0, approver.Approver);
    }
  }

  createNewApprover(approver: ApproversData): FormGroup {
    return this.formBuilder.group({
      isMandatory: new FormControl({ value: approver.isMandatory, disabled: this.sectionDisabled }),
      ApproveLevel: new FormControl({ value: approver.ApproveLevel, disabled: this.sectionDisabled }),
      LevelName_EN: new FormControl({ value: approver.LevelName_EN, disabled: this.sectionDisabled }),
      LevelName_AR: new FormControl({ value: approver.LevelName_AR, disabled: this.sectionDisabled }),
      SkipSecretary: new FormControl({
        value: this.confidential ? true : approver.SkipSecretary,
        disabled: this.sectionDisabled
      }),
      IsDone: new FormControl({ value: approver.IsDone, disabled: this.sectionDisabled }),
      IsActive: new FormControl({ value: approver.IsActive, disabled: this.sectionDisabled }),
      SecretaryGroupID: new FormControl({
        value: approver.SecretaryGroup.length > 0 ? approver.SecretaryGroup[0].ID : '',
        disabled: this.sectionDisabled
      }),
      ApproverID: new FormControl({ value: approver.Approver.length > 0 ? approver.Approver[0].ID : '', disabled: this.sectionDisabled }),
    });
  }

  removeApprover(index: number) {
    this.approverDetails = this.approverDetailsForm.get('approverDetails') as FormArray;
    const activeLevels = this.getLevels(true);
    const currentLevel = this.approverDetails.at(index).get('ApproveLevel').value;
    if (currentLevel === Math.max.apply(null, activeLevels)) {
      const newMaxLevel = activeLevels[activeLevels.indexOf(currentLevel) - 1];
      this.senderReloadAction(newMaxLevel);
    }
    this.approverDetails.removeAt(index);
  }

  getLevel(level: number) {
    let approvers: any;
    let newArr = this.approversData.filter((approver) => {
      return approver.ApproveLevel === level;
    });
    if (newArr[0].HSS_multi.length > 0 || newArr[0].HS_multi.length > 0) {
      return approvers = {
        SecretaryGroup: newArr[0].HSS_multi,
        ApproverGroup: newArr[0].HS_multi
      };
    } else {
      return approvers = {
        SecretaryGroup: newArr[0].SecretaryGroup,
        ApproverGroup: newArr[0].ApproverGroup
      };
    }
  }

  displayFieldValue(fieldValue: ApproverDetails) {
    if (fieldValue) { return this.translator.transform(fieldValue.Approver_EN, fieldValue.Approver_AR); }
  }

  ManageNameControl(index: number, approverData: ApproverDetails[]) {
    const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
    this.filteredNames[index] = arrayControl.at(index).get('ApproverID').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.correspondenceDetailsService.MultiAppAutoFill(value, 'IntNameSimple', ''))
      );
    if (approverData.length) {
      arrayControl.at(index).get('ApproverID').setValue(approverData[0]);
    }
  }

  addApproverLevel() {
    let activeLevels = this.getLevels(true);
    const dialogRef = this.dialogU.open(AddApproverDialogComponent, {
      width: '100%',
      panelClass: 'add-approver-dialog',
      maxWidth: '30vw',
      data: {
        unActiveApprovers: this.getLevels(false),
      }
    }).afterClosed().subscribe(
      response => {
        if (response && response.length > 0) {
          if (Math.max.apply(null, response) > Math.max.apply(null, activeLevels)) {
            this.senderReloadAction(Math.max.apply(null, response));
          }
          this.formRebuild(activeLevels.concat(response));
        }
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      });
  }

  getLevels(active: boolean) {
    const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
    let levelsArr = [];
    arrayControl.value.forEach(elem => {
      levelsArr.push(elem.ApproveLevel);
    });
    if (active) {
      return levelsArr;
    } else {
      return this.approversData.filter((approver) => {
        return levelsArr.indexOf(approver.ApproveLevel) === -1;
      });
    }
  }

  removeAll() {
    this.approverDetails = this.approverDetailsForm.get('approverDetails') as FormArray;
    for (let i = 0; i < 5; i++) {
      this.approverDetails.removeAt(0);
    }
  }
  // functions for data save
  getCurrentApprovers(step?: string): CurrentApprovers {
    const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
    const newArr = arrayControl.value.filter((approver) => {
      return approver.IsDone === 0;
    });
    if (step === 'step1') {
      const currentApprovers: CurrentApprovers = {
        minLevel: arrayControl.value.length > 1 ? arrayControl.value[0] : null,
        maxLevel: arrayControl.value.length >= 0 ? arrayControl.value[arrayControl.length - 1] : null
      };
      return currentApprovers;
    } else if (step === 'step3') {
      const currentApprovers: CurrentApprovers = {
        minLevel: newArr.length > 2 ? newArr[1] : null,
        maxLevel: newArr.length > 0 ? newArr[newArr.length - 1] : null
      };
      return currentApprovers;
    } else {
      const currentApprovers = {
        minLevel: newArr.length > 1 ? newArr[0] : null,
        maxLevel: newArr.length > 0 ? newArr[newArr.length - 1] : null
      };
      return currentApprovers;
    }
  }

  setMultiApprovers() {
    const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
    this.correspondenceDetailsService.setMultiApprovers(arrayControl.value, this.getLevels(true).join(), this.approve).subscribe(
      response => {
        // console.log('approvers are saved');
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  setIsDone(step: string): void {
    let approverData;
    if (step === 'step3') {
      approverData = this.getCurrentApprovers().minLevel;
    } else if (step === 'step5') {
      approverData = this.getCurrentApprovers().maxLevel;
    }
    this.correspondenceDetailsService.setIsDone(this.approve.CorrID, approverData).subscribe(
      response => {
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  setApprover(step: string, approver: number) {
    let level;
    if (step === 'step2') {
      level = this.getCurrentApprovers().minLevel.ApproveLevel;
    } else if (step === 'step4') {
      level = this.getCurrentApprovers().maxLevel.ApproveLevel;
    }
    this.correspondenceDetailsService.setApprover(this.approve.CorrID, level, approver).subscribe(
      response => {
        // console.log('Approver is saved');
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  approversValidation() {
    const approvers = this.getCurrentApprovers('step1');
    if (!approvers.maxLevel || approvers.maxLevel.ApproveLevel === 1) {
      this.notificationmessage.warning('Approver is missing', this.translator.transform('you_have_to_choose_at_least_one_approve_level'), 2500);
      return false;
    }
    const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
    let isValid = true;
    for (let i = 0; i < arrayControl.value.length; i++) {
      const ApproverID = arrayControl.value[i].ApproveLevel === 1 ? arrayControl.value[i].ApproverID.ID : arrayControl.value[i].ApproverID;
      if (arrayControl.value[i].SkipSecretary && !ApproverID) {
        this.notificationmessage.warning('Approver is missing',this.translator.transform('if_you_skip_secretary_you_have_to_choose_approver'), 2500);
        isValid = false;
        break;
      } else if (!arrayControl.value[i].SkipSecretary && !arrayControl.value[i].SecretaryGroupID) {
        this.notificationmessage.warning('Secretary group is missing', this.translator.transform('please_select_secretary_group'), 2500);
        isValid = false;
        break;
      }
    }
    return isValid;
  }

  setPMData(obj: any) {
    if (obj.hasOwnProperty('EID')) {
      const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
      arrayControl.at(0).get('ApproverID').setValue({
        ID: obj.KuafID, Approver_EN: obj.Coev_Firstname + ' ' + obj.Coev_LastName,
        Approver_AR: obj.Coev_FirstName_AR + ' ' + obj.Coev_LastName_AR
      });
    } else {
      this.notificationmessage.warning('Please chose a user.', this.translator.transform('please_choose_a_user'), 2500);
    }
  }

  setConfidential(): void {
    if (!this.firstLoadSpinner) {
      this.formRebuild(this.getLevels(true));
    }
  }

  skipChange(e: MatCheckboxChange, i: number) {
    if (this.confidential && !e.checked) {
      this.notificationmessage.warning('Please deselect confidential mode.',this.translator.transform('option_can_not_be_changed_in_confidential_mode') , 2500);
      const arrayControl = this.approverDetailsForm.get('approverDetails') as FormArray;
      arrayControl.at(i).get('SkipSecretary').setValue(true);
    }
  }

  getApprovers() {    
    if (this.isSelectApproverStep) {
      let ApproverType: string;
      switch (this.approve.taskID) {
        case this.approve.selectApproverStep:
          ApproverType = 'qApprover_2_33';
          break;
        case this.approve.selectFinalApproverStep:
          ApproverType = 'qApprover_2_37';
          break;
      }
      this.correspondenceDetailsService
        .getApproverListRunningWF(ApproverType, this.approve.VolumeID)
        .subscribe(
          response => {          
            this.ApproverList = response;
            if (this.currentLevel.Approver.length > 0) {
              this.approverSelected = this.currentLevel.Approver[0].ID;
            }
          }
        ),
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
        };
    }
  }
}
