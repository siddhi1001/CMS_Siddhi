import { AbstractControl } from '@angular/forms';

export function OrgStructureValidator(control: AbstractControl): { [key: string]: boolean } | null  {
    const employe = control.value.RecipientUserID;
    return employe ? null : { 'emptyOrg': true};
}
