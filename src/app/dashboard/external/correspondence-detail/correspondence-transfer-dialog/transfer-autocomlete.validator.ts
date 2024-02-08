import { AbstractControl } from '@angular/forms';

export function OrgStructureValidator(control: AbstractControl): { [key: string]: boolean } | null  {
    const department = control.get('Department');
    const employe = control.get('To');
    return employe.value.RecipientUserID || department.value.RecipientUserID ? null : { 'emptyOrg': true};
}
