import { Component, OnInit, ElementRef, ViewChild, HostListener, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FCTSDashBoard } from 'src/environments/environment';

interface SearchOptions {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-full-search',
  templateUrl: './full-search.component.html',
  styleUrls: ['./full-search.component.scss']
})
export class FullSearchComponent implements OnInit {
  public fullSearchForm: FormGroup;
  public basehref: String = FCTSDashBoard.BaseHref;
  public searchOptions = false;
  public searchObject = [];
  public isActive = true;
  SearchFilterData = {
    ReferenceCode: '',
    DocumentNumber: '',
    MyAssignments: false,
    DispatchDateFrom: '',
    DispatchDateTo: '',
    Subject: '',
    CorrespondencType: { ID: '', EN: '', AR: '' },
    ExternalOrganization: '',
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

  Options: SearchOptions[] = [
    { value: 'ReferenceCode', viewValue: 'Reference' },
    { value: 'DocumentNumber', viewValue: 'Document' },
    { value: 'Subject', viewValue: 'Subject' },
    { value: 'Budget', viewValue: 'Budget' },
    { value: 'Project', viewValue: 'Project' },
    { value: 'Tender', viewValue: 'Tender' },
    { value: 'Contract', viewValue: 'Contract' }
  ];
  @ViewChild('elementRef') elementRef: ElementRef;
  @Output() runFullSearch = new EventEmitter<Object>();
  @Output() showSearchComponent = new EventEmitter<boolean>();
  // listen to a click from the outside of an element
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event): void {
    if (!this.elementRef.nativeElement.contains(event.target) && !event.target.classList.contains('mat-option-text')
      && !event.target.classList.contains('mat-option')) {
      this.searchOptions = false;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.fullSearchForm = this.formBuilder.group({
      searchString: ['', Validators.required],
      searchParameter: ['ReferenceCode', Validators.required]
    });
  }

  openSearchoptions(): void {
    this.searchOptions = !this.searchOptions;
  }

  fullSearchSubmit(): void {
    this.clearDataValues();
    this.SearchFilterData[this.fullSearchForm.value.searchParameter] = this.fullSearchForm.value.searchString;
    this.runFullSearch.emit(this.SearchFilterData);
  }

  clearFunction(): void {
    this.clearFilters();
    //this.clearDataValues();
    this.fullSearchSubmit();
    this.showSearchComponent.emit(false);
  }

  clearDataValues(): void {
    this.Options.forEach(element => {
      this.SearchFilterData[element.value] = '';
    });
  }

  clearFilters(): void {
    this.fullSearchForm.patchValue({
      searchString: '',
      searchParameter: 'ReferenceCode'
    });
  }

  searchFunction(): boolean {
    this.fullSearchSubmit();
    return false;
  }

  showAdvancedSearch(condition): void {
    this.clearFunction();
    this.isActive = false;
    this.openSearchoptions();
    this.showSearchComponent.emit(condition);
  }

  makeCurrentSearchActive(): void {
    if (!this.isActive) {
      this.isActive = true;
      this.fullSearchSubmit();
      this.showSearchComponent.emit(false);
    }
  }
}
