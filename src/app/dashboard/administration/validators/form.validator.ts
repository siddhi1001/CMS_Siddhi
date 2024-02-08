import { AbstractControl, ValidatorFn } from '@angular/forms';

export function DelegationUsers(control: AbstractControl): { [key: string]: boolean } | null {
    const empl = control.value && control.value.KuafID;
    return empl ? null : { 'emptyOrg': true };
}

export class NumberValidators {
    static range(min: number, max: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            if (control.value && (isNaN(control.value) || control.value < min || control.value > max)) {
                return { 'range': true };
            }
            return null;
        };
    }

    static onlyNumbers(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            if (control.value && /\D/.test(control.value)) {
                return { 'notNumber': true };
            }
            return null;
        };
    }
}
