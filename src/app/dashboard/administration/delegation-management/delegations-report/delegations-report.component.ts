import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import {
  OrgNameAutoFillModelSimpleUser,
  DelegationReportRequest,
} from "../../models/delegation.model";
import { DelegationService } from "../../services/delegation.service";
import { debounceTime, switchMap, map } from "rxjs/operators";
import { merge } from "rxjs";
import { AppLoadConstService } from "src/app/app-load-const.service";
import { ErrorHandlerFctsService } from "src/app/dashboard/services/error-handler-fcts.service";
import { multiLanguageTranslator } from "src/assets/translator/index";
import { MatTableDataSource, MatAccordion } from "@angular/material";
import { FCTSDashBoard } from "../../../../../environments/environment";

@Component({
  selector: "app-delegations-report-new",
  templateUrl: "./delegations-report.component.html",
  styleUrls: ["./delegations-report.component.scss"],
})
export class DelegationsReportComponent implements OnInit {
  basehref: String = FCTSDashBoard.BaseHref;
  CSUrl: String = FCTSDashBoard.CSUrl;
  progbar:false;
  public globalConstants = this.appLoadConstService.getConstants();
  formDefaultState: any;
  delegationReportForm: FormGroup;
  delegationRepotrProgbar: false;
  filteredDelNames: Observable<OrgNameAutoFillModelSimpleUser[]>;
  dataSource: any;
  filterState = false;
  proxyFilter = new FormControl();
  userFilter = new FormControl();
  startDateFilter = new FormControl();
  endDateFilter = new FormControl();
  userStartDateFilter = new FormControl();
  userFinishDateFilter = new FormControl();
  filteredValues = {
    UserName_EN: "",
    ProxyName_EN: "",
    StartDate: "",
    EndDate: "",
    UserStartDate: "",
    UserFinishDate: "",
  };
  reportvalues;
  section = "userSection";
  delegationResponse: any[] = [];
  @ViewChild("searchString") searchString: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private delegationService: DelegationService,
    private appLoadConstService: AppLoadConstService,
    private _errorHandlerFctsService: ErrorHandlerFctsService,
    public translator: multiLanguageTranslator
  ) {}

  ngOnInit() {
    this.delegationReportForm = this.formBuilder.group({
      Delegator: "",
      Delegatee: "",
      startDate: { disabled: true, value: "" },
      endDate: { disabled: true, value: "" },
    });

    // Combine value changes for 'Delegatee' and 'Delegator' fields
    const delegateeValueChanges$ = this.delegationReportForm
      .get("Delegatee")
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((value) =>
          this.delegationService.searchFieldForAutoFill(
            value,
            "IntNameSimple",
            ""
          )
        )
      );

    const delegatorValueChanges$ = this.delegationReportForm
      .get("Delegator")
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((value) =>
          this.delegationService.searchFieldForAutoFill(
            value,
            "IntNameSimple",
            ""
          )
        )
      );

    // Combine both observables
    this.filteredDelNames = merge(
      delegateeValueChanges$,
      delegatorValueChanges$
    );
  }

  displayFieldValue(fieldValue: OrgNameAutoFillModelSimpleUser) {
    if (fieldValue) {
      return fieldValue.Val_En;
    }
  }

  getSearchObject() {
    const finalRequest: DelegationReportRequest = new DelegationReportRequest();
    finalRequest.recUserID = this.delegationReportForm.get("Delegator").value
      .RecipientUserID
      ? this.delegationReportForm.get("Delegator").value.RecipientUserID
      : 0;
    finalRequest.proxyUser = this.delegationReportForm.get("Delegatee").value
      .RecipientUserID
      ? this.delegationReportForm.get("Delegatee").value.RecipientUserID
      : 0;
    finalRequest.startDate = this.DateToString(
      this.delegationReportForm.get("startDate").value
    );
    finalRequest.endDate = this.DateToString(
      this.delegationReportForm.get("endDate").value
    );
    this.getDelegationReport(finalRequest);
  }

  getDelegationReport(finalRequest) {
    this.delegationService.getDelegationReport(finalRequest).subscribe(
      (response) => {
        this.delegationResponse = response;
      },
      (responseError) => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
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

  filterValues = {
    fullSearch: "",
    delegatorUser: "",
    proxyUser: "",
    startDate: "",
    endDate: "",
    active: "",
    filterState: false,
  };
  fullSearch = new FormControl("");

  clearFilter() {
    this.delegationResponse = [];
    this.delegationReportForm.reset({
      Delegator: "",
      Delegatee: "",
      startDate: "",
      endDate: "",
    });
  }
}
