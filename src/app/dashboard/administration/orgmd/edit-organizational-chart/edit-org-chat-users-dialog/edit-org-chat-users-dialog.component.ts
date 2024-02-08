import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { UserRolesModel } from 'src/app/dashboard/administration/administration.model';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-edit-org-chat-users-dialog',
  templateUrl: './edit-org-chat-users-dialog.component.html',
  styleUrls: ['./edit-org-chat-users-dialog.component.scss']
})
export class EditOrgChatUsersDialogComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  UserData: FormGroup;
  RolesForm: FormGroup;
  additionalRoles: FormArray;
  filteredRoles: Observable<any[]>;
  rolesList: Observable<any[]>[] = [];

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Login', 'inputLength': '255', 'type': 'text' },
    { 'name': 'code', 'controlName': 'Code', 'inputLength': '', 'type': 'number' },
    { 'name': 'parent', 'controlName': 'Parent', 'inputLength': '255', 'type': 'text' },
    { 'name': 'first_name', 'controlName': 'FirstName_EN', 'inputLength': '64', 'type': 'text' },
    { 'name': 'first_name_ar', 'controlName': 'FirstName_AR', 'inputLength': '64', 'type': 'text' },
    { 'name': 'mid_name', 'controlName': 'MiddleName_EN', 'inputLength': '32', 'type': 'text' },
    { 'name': 'mid_name_ar', 'controlName': 'MiddleName_AR', 'inputLength': '32', 'type': 'text' },
    { 'name': 'last_name', 'controlName': 'LastName_EN', 'inputLength': '64', 'type': 'text' },
    { 'name': 'last_name_ar', 'controlName': 'LastName_AR', 'inputLength': '64', 'type': 'text' },
    { 'name': 'title', 'controlName': 'Title_EN', 'inputLength': '64', 'type': 'text' },
    { 'name': 'title_ar', 'controlName': 'Title_AR', 'inputLength': '64', 'type': 'text' },
    { 'name': 'email', 'controlName': 'MailAddress', 'inputLength': '64', 'type': 'text' },
    { 'name': 'personal_email', 'controlName': 'PersonalEmail', 'inputLength': '255', 'type': 'email' },
    { 'name': 'main_role', 'controlName': 'Role', 'inputLength': '255', 'type': 'text' },
    { 'name': 'additional_roles', 'controlName': '', 'inputLength': '255', 'type': 'text' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private _administration: AdministrationService,
    private translator: multiLanguageTranslatorPipe
  ) { }

  ngOnInit() {
    this.UserData = this.formBuilder.group({
      Code: this.data.employee.Code,
      EID: this.data.employee.EID,
      EName_AR: this.data.employee.EName_AR,
      FirstName_AR: this.data.employee.FirstName_AR,
      FirstName_EN: new FormControl({ value: this.data.employee.FirstName_EN, disabled: true }),
      LastName_AR: this.data.employee.LastName_AR,
      LastName_EN: new FormControl({ value: this.data.employee.LastName_EN, disabled: true }),
      Login: new FormControl({ value: this.data.employee.Login, disabled: true }),
      MailAddress: new FormControl({ value: this.data.employee.MailAddress, disabled: true }),
      MiddleName_AR: this.data.employee.MiddleName_AR,
      MiddleName_EN: new FormControl({ value: this.data.employee.MiddleName_EN, disabled: true }),
      Parent: new FormControl({
        value: this.translator.transform(this.data.employee.ParentName_EN, this.data.employee.ParentName_AR),
        disabled: true
      }),
      PersonalEmail: [this.data.employee.PersonalEmail, Validators.email],
      PersonalEmail2: [this.data.employee.PersonalEmail2, Validators.email],
      PersonalEmail3: [this.data.employee.PersonalEmail3, Validators.email],
      PersonalEmail4: [this.data.employee.PersonalEmail4, Validators.email],
      PersonalEmail5: [this.data.employee.PersonalEmail5, Validators.email],
      Role: [{ RID: this.data.employee.RoleID, Name_AR: this.data.employee.RoleName_AR, Name_EN: this.data.employee.RoleName_EN }],
      Title_AR: this.data.employee.Title_AR,
      Title_EN: new FormControl({ value: this.data.employee.Title_EN, disabled: true }),
      additionalRoles: this.formBuilder.array([])
    });

    this.data.employeeRoles.forEach(element => {
      this.addRole(element);
    });

    this.filteredRoles = this.UserData.get('Role').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value =>
          this._administration.orgChartRolesAutoCmpl(value, this.data.parentsList)
        )
      );
  }

  addRole(role: UserRolesModel): void {
    const controls = this.UserData.get('additionalRoles') as FormArray;
    controls.push(this.createNewRole(role));
    this.ManageNameControl(controls.length - 1);
  }

  createNewRole(role: UserRolesModel): FormGroup {
    return this.formBuilder.group({
      RoleDetails: [role, [Validators.required, this.RolesValidator]]
    });
  }

  ManageNameControl(index: number): void {
    const controls = this.UserData.get('additionalRoles') as FormArray;
    this.rolesList[index] = controls.at(index).get('RoleDetails').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._administration.orgChartRolesAutoCmpl(value, this.data.parentsList))
      );
  }

  removeRole(index: number): void {
    const additionalRoles = this.UserData.get('additionalRoles') as FormArray;
    additionalRoles.removeAt(index);
    this.rolesList = new Array();
    additionalRoles.controls.forEach((element, index) => {
      this.ManageNameControl(index);
    });

  }

  displayFieldValue(fieldValue: UserRolesModel) {
    if (fieldValue) { return this.translator.transform(fieldValue.Name_EN, fieldValue.Name_AR); }
  }

  save() {
    const controls = this.UserData.get('additionalRoles') as FormArray;
    for (let i = 0; i < controls.length; i++) {
      controls.at(i).get('RoleDetails').markAsTouched();
    }
    if (this.UserData.valid) {
      this._dialogRef.close(this.UserData.value);
    }
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  RolesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    return control.value && control.value.RID ? null : { 'emptyRole': true };
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

}
