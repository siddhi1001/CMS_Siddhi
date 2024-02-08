import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DashboardFilter, DashboardFilterResponse } from '../models/DashboardFilter';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';
@Component({
  selector: 'app-searchfilter',
  templateUrl: './searchfilter.component.html'
})
export class SearchfilterComponent implements OnInit {
  constructor(
    private correspondenceService: CorrespondenceService
    , public translator: multiLanguageTranslatorPipe
  ) { }

  @Input()
  set searchExtOrgFieldShow(searchExtOrgFieldShow: boolean) {
    this._showExtFld = searchExtOrgFieldShow;
  }
  @Input()
  set searchSenderDeptFieldShow(searchSenderDeptFieldShow: boolean) {
    this._showSenderDeptFld = searchSenderDeptFieldShow;
  }
  @Input()
  set searchRecipientDeptFieldShow(searchRecipientDeptFieldShow: boolean) {
    this._showRecipientDeptFld = searchRecipientDeptFieldShow;
  }
  @Input()
  set isFullSearch(isFullSearch: boolean) {
    this._isFullSearch = isFullSearch;
  }


  // SearchFilterData: SearchFilters;
  SearchFilterData = {
    ReferenceCode: '',
    DocumentNumber: '',
    MyAssignments: false,
    DispatchDateFrom: '',
    DispatchDateTo: '',
    Subject: '',
    CorrespondencType: { ID: '', EN: '', AR: '' },
    ExternalOrganization: { ID: '', EN: '', AR: '' },
    ExternalDepartment: '',
    RecipientDepartment: { ID: '', EN: '', AR: '' },
    SenderDepartment: { ID: '', EN: '', AR: '' },
    Priority: { ID: '', EN: '', AR: '' },
    BaseType: { ID: '', EN: '', AR: '' },
    IDNumber: '',
    Personalname: '',
    Transferpurpose: '',
    Contract: '',
    Tender: '',
    Mailroom: '',
    Budget: '',
    Project: '',
    Staffnumber: ''
  };
  myControl = new FormControl();
  ExteranlOrgnizationControl = new FormControl();
  DashboardFilters: any[];
  AdvancedSearch = false;
  filteredExtOrgNames: Observable<DashboardFilterResponse>;

  _showExtFld: boolean;
  _showRecipientDeptFld: boolean;
  _showSenderDeptFld: boolean;
  _isFullSearch: boolean;


  @Output()
  searchDashboardButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  AdvancedSearchButton() {
    this.AdvancedSearch = !this.AdvancedSearch;
  }


  ngOnInit() {
    this.getDashboardFilters();
    this.filteredExtOrgNames = this.ExteranlOrgnizationControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.correspondenceService.searchExtOrgName(value))
      );
    if (this._isFullSearch) {
      this.AdvancedSearchButton();
    }
  }

  getDashboardFilters(): void {
    this.correspondenceService
      .getDashboardFilters()
      .subscribe(
        DashboardFilters => (this.DashboardFilters = DashboardFilters)
      );
  }

  searchDasboardButtonAction() {
    this.searchDashboardButtonClicked.emit(this.SearchFilterData);
  }

  displayFn(attribute?: any): string | undefined {
    return attribute ? this.translator.transform(attribute.EN, attribute.AR) : undefined;
  }
  displayExtOrgName(extOrgValue: DashboardFilter) {
    if (extOrgValue) { return extOrgValue.Name; }
  }

}
