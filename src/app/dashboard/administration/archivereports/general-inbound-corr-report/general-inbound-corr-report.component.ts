import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { ErrorHandlerFctsService } from "src/app/dashboard/services/error-handler-fcts.service";
import { MatTableDataSource } from "@angular/material";
import {
  multiLanguageTranslator,
  multiLanguageTranslatorPipe,
} from "src/assets/translator/index";
import { Observable } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import { UsersAutocompleteModel } from "../../models/delegation.model";
import { DelegationService } from "../../services/delegation.service";

export class SearchObject {
  fromdate: string;
  endDate: string;
  archiveuser: number;
}

@Component({
  selector: "app-general-inbound-corr",
  templateUrl: "./general-inbound-corr-report.component.html",
  styleUrls: ["./general-inbound-corr-report.component.scss"],
})
export class GeneralInboundCorrReport implements OnInit {
  generalInboundCorrForm: FormGroup;
  mailroomUserAutocmpl: Observable<UsersAutocompleteModel[]>;
  dataSource = new MatTableDataSource();
  lang: string = this.translatorService.lang.toUpperCase();
  isLoading = false;

  displayedColumns: string[] = [
    "ReferenceCode",
    "RegistryDate",
    "DocumentRef",
    "DocumentDate",
    "Subject",
    "Sender",
    "Recipient",
    "RecievedDate",
    "Step",
    "FilingPlan",
  ];
  tableStructure = [
    {
      columnDef: "ReferenceCode",
      columnName: 'PWAReference',
      className: "",
    },
    {
      columnDef: "RegistryDate",
      columnName: 'registrydate',
      className: "",
    },

    {
      columnDef: "DocumentRef",
      columnName: 'documentref',
      className: "",
    },
    {
      columnDef: "DocumentDate",
      columnName: 'documentdate',
      className: "",
    },

    {
      columnDef: "Subject",
      columnName: 'subject',
      className: "",
    },

    {
      columnDef: "Sender",
      columnName: 'sender',
      className: "",
    },
    {
      columnDef: "Recipient",
      columnName: 'recipient',
      className: "",
    },

    {
      columnDef: "RecievedDate",
      columnName: 'recieved_date',
      className: "",
    },
    {
      columnDef: "Step",
      columnName: 'step',
      className: "",
    },
    {
      columnDef: "FilingPlan",
      columnName: 'filingplan',
      className: "",
    },
  ];

  constructor(
    public formBuilder: FormBuilder,
    private _delegationService: DelegationService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public translator: multiLanguageTranslatorPipe,
    public translatorService: multiLanguageTranslator
  ) {}

  ngOnInit() {
    this.generalInboundCorrForm = this.formBuilder.group({
      StartDate: [""],
      EndDate: [""],
      MailRoomUser: [""],
    });
    this.mailroomUserAutocmpl = this.generalInboundCorrForm
      .get("MailRoomUser")
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((value) =>
          //TODO: Update the service ot only get the Mail Room users
          this._delegationService.delegationUsersAutoCmpl(value)
        )
      );
  }
  displayFieldValue(fieldValue: any) {
    if (fieldValue) {
      return this.translator.transform(fieldValue.Name_EN, fieldValue.Name_AR);
    }
  }

  runReport() {
    this.isLoading = true;
    const obj = new SearchObject();
    const startdate = this.DateToString(
      this.generalInboundCorrForm.get("StartDate").value
    );
    const enddate = this.DateToString(
      this.generalInboundCorrForm.get("EndDate").value
    );
    const archiveuser = this.generalInboundCorrForm.get("MailRoomUser").value;
    obj.fromdate=startdate;
    obj.endDate=enddate;
    obj.archiveuser=archiveuser.hasOwnProperty('KuafID')? archiveuser.KuafID : '';
    


    //     const proxy = this.filtersForm.get('ProxyUser').value;
    //     obj.delegator = delegator.hasOwnProperty('KuafID') ? delegator.KuafID : '';
    //     obj.proxy = proxy.hasOwnProperty('KuafID') ? proxy.KuafID : '';
    //     obj.startDate = this.DateToString(this.filtersForm.get('StartDate').value);
    //     obj.endDate = this.DateToString(this.filtersForm.get('EndDate').value);
    //     this._delegationService.DelegationsReport(obj).subscribe(
    //       response => {
    //         this.dataSource.data = response;
    //       },
    //       responseError => {
    //         this._errorHandlerFctsService.handleError(responseError).subscribe();
    //       },
    //       () => {
    //         this.isLoading = false;
    //       }
    //     );
  }

  DateToString(mDate): string {
    function pad(n) {
      return n < 10 ? "0" + n : n;
    }
    if (mDate instanceof Date) {
      return (
        "D" +
        "/" +
        mDate.getFullYear() +
        "/" +
        pad(mDate.getMonth() + 1) +
        "/" +
        pad(mDate.getDate()) +
        ":" +
        pad(mDate.getHours()) +
        ":" +
        pad(mDate.getMinutes()) +
        ":" +
        pad(mDate.getSeconds())
      );
    } else {
      return "";
    }
  }
}

// export class DelegationsReportComponent implements OnInit {
//   filtersForm: FormGroup;
//   dataSource = new MatTableDataSource();
//   lang: string = this.translatorService.lang.toUpperCase();
//   delegatorUsersAutocmpl: Observable<UsersAutocompleteModel[]>;
//   proxyUsersAutocmpl: Observable<UsersAutocompleteModel[]>;
//   isLoading = false;

//   displayedColumns: string[] = ['UserName_' + this.lang, 'ProxyName_' + this.lang, 'StartDate', 'EndDate', 'UserStartDate', 'UserFinishDate'];
//   tableStructure = [
//     { 'columnDef': 'UserName_' + this.lang, 'columnName': 'delegator_user', 'className': '' },
//     { 'columnDef': 'ProxyName_' + this.lang, 'columnName': 'proxy_user', 'className': '' },
//     { 'columnDef': 'StartDate', 'columnName': 'start_date', 'className': '' },
//     { 'columnDef': 'EndDate', 'columnName': 'end_date', 'className': '' },
//     { 'columnDef': 'UserStartDate', 'columnName': 'user_start_date', 'className': '' },
//     { 'columnDef': 'UserFinishDate', 'columnName': 'user_finish_date', 'className': '' }
//   ];

//   constructor(
//     public formBuilder: FormBuilder,
//     private _delegationService: DelegationService,
//     private _errorHandlerFctsService: ErrorHandlerFctsService,
//     public translator: multiLanguageTranslatorPipe,
//     public translatorService: multiLanguageTranslator,
//   ) { }

//   ngOnInit() {
//     this.filtersForm = this.formBuilder.group({
//       DelegatorUser: [''],
//       ProxyUser: [''],
//       StartDate: [''],
//       EndDate: ['']
//     });

//     this.delegatorUsersAutocmpl = this.filtersForm.get('DelegatorUser').valueChanges
//       .ebounceTime(300),
//         switchMap(value =>
//           this._delegationService.delegationUsersAutoCmpl(value)
//         )
//       );pipe(
//         d
//     this.proxyUsersAutocmpl = this.filtersForm.get('ProxyUser').valueChanges
//       .pipe(
//         debounceTime(300),
//         switchMap(value =>
//           this._delegationService.delegationUsersAutoCmpl(value)
//         )
//       );
//   }

//   runReport() {
//     this.isLoading = true;
//     const obj = new SearchObject();
//     const delegator = this.filtersForm.get('DelegatorUser').value;
//     const proxy = this.filtersForm.get('ProxyUser').value;
//     obj.delegator = delegator.hasOwnProperty('KuafID') ? delegator.KuafID : '';
//     obj.proxy = proxy.hasOwnProperty('KuafID') ? proxy.KuafID : '';
//     obj.startDate = this.DateToString(this.filtersForm.get('StartDate').value);
//     obj.endDate = this.DateToString(this.filtersForm.get('EndDate').value);
//     this._delegationService.DelegationsReport(obj).subscribe(
//       response => {
//         this.dataSource.data = response;
//       },
//       responseError => {
//         this._errorHandlerFctsService.handleError(responseError).subscribe();
//       },
//       () => {
//         this.isLoading = false;
//       }
//     );
//   }

//   displayFieldValue(fieldValue: any) {
//     if (fieldValue) { return this.translator.transform(fieldValue.Name_EN, fieldValue.Name_AR); }
//   }

//   DateToString(mDate): string {
//     function pad(n) { return n < 10 ? '0' + n : n; }
//     if (mDate instanceof Date) {
//       return 'D' + '/'
//         + mDate.getFullYear() + '/'
//         + pad(mDate.getMonth() + 1) + '/'
//         + pad(mDate.getDate()) + ':'
//         + pad(mDate.getHours()) + ':'
//         + pad(mDate.getMinutes()) + ':'
//         + pad(mDate.getSeconds());
//     } else {
//       return '';
//     }
//   }

//}
