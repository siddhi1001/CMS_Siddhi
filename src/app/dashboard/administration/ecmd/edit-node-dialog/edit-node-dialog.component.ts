import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { NotificationService } from 'src/app/dashboard/services/notification.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
import { EcmdService } from 'src/app/dashboard/administration/services/ecmd.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { NodeListModel } from '../ecmd-classes.model';


@Component({
  selector: 'app-edit-node-dialog',
  templateUrl: './edit-node-dialog.component.html',
  styleUrls: ['./edit-node-dialog.component.scss']
})
export class EditNodeDialogComponent implements OnInit {
  NodeData: FormGroup;
  actionType: string;
  nodeList: NodeListModel[];

  interactionStructure = [
    { 'name': 'name', 'controlName': 'Name_EN', 'value': 'Name_EN', 'inputLength': '255', 'type': 'text' },
    { 'name': 'name_ar', 'controlName': 'Name_AR', 'value': 'Name_AR', 'inputLength': '255', 'type': 'text' },
    { 'name': 'short_name', 'controlName': 'ShortName_EN', 'value': 'ShortName_EN', 'inputLength': '10', 'type': 'text' },
    { 'name': 'short_name_ar', 'controlName': 'ShortName_AR', 'value': 'ShortName_AR', 'inputLength': '10', 'type': 'text' },
    { 'name': 'parent', 'controlName': 'ParentID', 'value': 'ParentID', 'inputLength': '', 'type': '' },
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
      NODEID: '',
      Name_EN: ['', Validators.required],
      Name_AR: ['', Validators.required],
      ShortName_EN: '',
      ShortName_AR: '',
      ParentID: ['', Validators.required]
    });

    if (this.data.action === 'updateLvl1') {
      this.fillForm();
      this.actionType = 'edit_node';
    } else if (this.data.action === 'insertLvl1') {
      this.NodeData.get('ParentID').setValue(this.data.node.getID);
      this.actionType = 'add_node';
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
    this.NodeData.get('NODEID').setValue(this.data.node.NODEID);
    this.NodeData.get('Name_EN').setValue(this.data.node.Name_EN);
    this.NodeData.get('Name_AR').setValue(this.data.node.Name_AR);
    this.NodeData.get('ShortName_EN').setValue(this.data.node.ShortName_EN);
    this.NodeData.get('ShortName_AR').setValue(this.data.node.ShortName_AR);
    this.NodeData.get('ParentID').setValue(this.data.node.ParentID);
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
        templateName: 'EcmdNodeEdit',
        objectID: this.NodeData.get('NODEID').value,
        field1: this.NodeData.get('Name_EN').value,
        field2: this.NodeData.get('Name_AR').value,
        field3: this.NodeData.get('ParentID').value,
        field4: '',
        csvIDS: '',
      };
      this._ecmdService.canChange(obj).subscribe(
        response => {
          if (response[0].Counter === 0) {
            this._ecmdService.changeNodeList([]);
            this._dialogRef.close(this.NodeData.value);
          } else {
            this.notificationmessage.error('Item name coincidence', this.translator.transform('gbl_err_name_coincidence'), 2500);
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
}
