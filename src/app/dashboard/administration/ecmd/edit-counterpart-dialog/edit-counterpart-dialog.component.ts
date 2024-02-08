import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatOptionSelectionChange, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { EcmdService } from 'src/app/dashboard/administration/services/ecmd.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { NodeListModel, StatesModel } from '../ecmd-classes.model';

@Component({
  selector: 'app-edit-counterpart-dialog',
  templateUrl: './edit-counterpart-dialog.component.html',
  styleUrls: ['./edit-counterpart-dialog.component.scss']
})
export class EditCounterpartDialogComponent implements OnInit {
  NodeData: FormGroup;
  actionType: string;
  nodeList: NodeListModel[];
  statesList: StatesModel[] = new Array;

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'value': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'value': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'short_name', 'controlName': 'ShortName_EN', 'value': 'ShortName_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'short_name_ar', 'controlName': 'ShortName_AR', 'value': 'ShortName_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'parent', 'controlName': 'NODEID', 'value': 'NODEID', 'inputLength': '', 'type': '' },
    { 'name': 'vat_code', 'controlName': 'VatCode', 'value': 'VatCode', 'inputLength': '255', 'type': 'text' },
    { 'name': 'adress', 'controlName': 'Address', 'value': 'Address', 'inputLength': '255', 'type': 'text' },
    { 'name': 'adress_ar', 'controlName': 'Address_AR', 'value': 'Address_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'city', 'controlName': 'City', 'value': 'City', 'inputLength': '255', 'type': 'text' },
    { 'name': 'city_ar', 'controlName': 'City_AR', 'value': 'City_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'postal', 'controlName': 'PostalCode', 'value': 'PostalCode', 'inputLength': '32', 'type': 'text' },
    { 'name': 'country', 'controlName': 'CountryID', 'value': 'Country_EN', 'inputLength': '', 'type': '' },
    { 'name': 'state_province', 'controlName': 'SPID', 'value': 'State_EN', 'inputLength': '', 'type': '' },
    { 'name': 'phone', 'controlName': 'Phone', 'value': 'Phone', 'inputLength': '64', 'type': 'text' },
    { 'name': 'fax', 'controlName': 'Fax', 'value': 'Fax', 'inputLength': '64', 'type': 'text' },
    { 'name': 'email', 'controlName': 'Email', 'value': 'Email', 'inputLength': '255', 'type': 'email' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<any>,
    private formBuilder: FormBuilder,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    private notificationmessage: NotificationService,
    private translator: multiLanguageTranslatorPipe,
    private _ecmdService: EcmdService
  ) { }

  ngOnInit() {
    this.NodeData = this.formBuilder.group({
      CPID: '',
      Name_EN: ['', Validators.required],
      Name_AR: ['', Validators.required],
      ShortName_EN: '',
      ShortName_AR: '',
      NODEID: ['', Validators.required],
      VatCode: '',
      Address: '',
      Address_AR: '',
      City: '',
      City_AR: '',
      PostalCode: '',
      CountryID: '',
      SPID: '',
      Phone: '',
      Fax: '',
      Email: ['', Validators.email]
    });

    if (this.data.action === 'updateLvl2') {
      this.fillForm();
      this.actionType = 'edit_counterpart';
    } else if (this.data.action === 'insertLvl2') {
      this.NodeData.get('NODEID').setValue(this.data.node.NODEID);
      this.actionType = 'add_counterpart';
    }

    this.nodeListSubscription();
  }

  nodeListSubscription() {
    let destroyer = new Subject();
    let nodeListEvent: Subscription = this._ecmdService.currentNodesList
      .pipe(takeUntil(destroyer))
      .subscribe(nodeList => {
        if (nodeList.length > 0) {
          this.nodeList = nodeList;
        } else {
          this.getNodeList();
        }
        destroyer.next();
      });
  }

  closeDialog(): void {
    this._dialogRef.close();
  }

  fillForm() {
    this.NodeData.get('CPID').setValue(this.data.node.CPID);
    this.NodeData.get('Name_EN').setValue(this.data.node.Name_EN);
    this.NodeData.get('Name_AR').setValue(this.data.node.Name_AR);
    this.NodeData.get('ShortName_EN').setValue(this.data.node.ShortName_EN);
    this.NodeData.get('ShortName_AR').setValue(this.data.node.ShortName_AR);
    this.NodeData.get('NODEID').setValue(this.data.node.NODEID);
    this.NodeData.get('VatCode').setValue(this.data.node.VatCode);
    this.NodeData.get('Address').setValue(this.data.node.Address);
    this.NodeData.get('Address_AR').setValue(this.data.node.Address_AR);
    this.NodeData.get('City').setValue(this.data.node.City);
    this.NodeData.get('City_AR').setValue(this.data.node.City_AR);
    this.NodeData.get('PostalCode').setValue(this.data.node.PostalCode);
    this.NodeData.get('CountryID').setValue(this.data.node.CountryID);
    this.NodeData.get('SPID').setValue(this.data.node.SPID);
    this.NodeData.get('Phone').setValue(this.data.node.Phone);
    this.NodeData.get('Fax').setValue(this.data.node.Fax);
    this.NodeData.get('Email').setValue(this.data.node.Email);
  }

  getNodeList() {
    this._ecmdService.getNodeList().subscribe(
      response => {
        this._ecmdService.changeNodeList(response);
        this.nodeList = response;
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  save() {
    this.fieldTouch();
    if (this.NodeData.valid) {
      const obj = {
        templateName: 'VAT_CODE',
        objectID: this.NodeData.get('CPID').value,
        field1: this.NodeData.get('VatCode').value,
        field2: '',
        field3: '',
        field4: '',
        csvIDS: '',
      };
      this._ecmdService.canChange(obj).subscribe(
        response => {
          if (response[0].Counter === 0) {
            this._dialogRef.close(this.NodeData.value);
          } else {
            this.notificationmessage.error(
              'Vat Code name coincidence', this.translator.transform('gbl_err_vat_code_coincidence'),
              2500);
          }
        },
        responseError => {
          this._errorHandlerFctsService.handleError(responseError).subscribe();
        }
      );
    }
  }

  fieldTouch() {
    this.interactionStructure.forEach(element => {
      this.NodeData.get(element.controlName).markAsTouched();
    });
  }

  formStatesList(event: MatOptionSelectionChange) {
    if (event instanceof MatOptionSelectionChange && event.isUserInput) {
      this.statesList = this.data.statesList.filter(element => {
        return element.CountryID === event.source.value;
      });
      const state = this.statesList.find(element => {
        return element.SPID === this.NodeData.get('SPID').value;
      });
      if (!state) {
        this.NodeData.get('SPID').setValue('');
      }
    }
  }

}
