import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { multiLanguageTranslator,multiLanguageTranslatorPipe } from 'src/assets/translator/index';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html'
})

export class ConfirmationDialogComponent implements OnInit {
  
  private _message: string;

  public get message(): string {
    return this._message;
  }
  public set message(value: string) {
    this._message = value;
  }

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    public translatorService: multiLanguageTranslator,
    public translator: multiLanguageTranslatorPipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  private _chooseMessage(): void {
    // choose confirmation message
    switch (this.data.message) {
      case 'assignTransfer': {
        this._message = this.translator.transform('msg_assignment_acceptance');
        break;
      }
      case 'assignWF': {
        this._message = this.translator.transform('msg_assignment_acceptance');
        break;
      }
      case 'activateDelegation': {
        this._message = this.translator.transform('msg_delegation_activation');
        break;
      }
      case 'deleteDelegation': {
        this._message = this.translator.transform('msg_delegation_deletion');
        break;
      }
      case 'deleteConnection': {
        this.message = this.translator.transform('msg_remove_connection');
        break;
      }
      case 'changeTeam': {
        this.message = this.translator.transform('msg_overwrite_approvers_list');
        break;
      }
      default: {
        this._message = this.translator.transform('msg_case_unknown');
        break;
      }
    }
  }

  closeDialog(): void {
    this.dialogRef.close('close');
  }

  ngOnInit() {
    this._chooseMessage();
  }

}
