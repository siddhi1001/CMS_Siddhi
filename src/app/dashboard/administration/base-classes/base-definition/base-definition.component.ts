import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import { FormGroup } from '@angular/forms';
import { multiLanguageTranslator } from 'src/assets/translator/index';
import { FCTSDashBoard } from 'src/environments/environment';

@Component({
  selector: 'app-base-definition',
  templateUrl: './base-definition.component.html',
  styleUrls: ['./base-definition.component.scss']
})
export class BaseDefinitionComponent implements OnInit {
  basehref = FCTSDashBoard.BaseHref;
  filtersForm: FormGroup;
  dataSource: MatTableDataSource<any>;
  runSpinner = false;

  advanceSearch = false;
  searchValue = '';

  detailState = 'out';
  sideInfoHeader: string;
  sideInfoName: string;

  possibleAction = 'add';
  lang: string = this.translatorService.lang.toUpperCase();

  tableStructure: any[] = [
    { columnName: 'definition', columnDef: 'Name_' + this.lang, className: '' },
    { columnName: 'description', columnDef: 'Description_' + this.lang, className: '' },
    { columnName: '', columnDef: 'actionButtons', className: 'action-button-cell' }
  ];

  sideNavItemStructure = [
    { 'name': 'name', 'value': 'Name_EN' },
    { 'name': 'name_ar', 'value': 'Name_AR' },
    { 'name': 'description', 'value': 'Description_EN' },
    { 'name': 'description_ar', 'value': 'Description_AR' }
  ];

  constructor(
    public dialog: MatDialog,
    public translatorService: multiLanguageTranslator
  ) { }

  ngOnInit() {
  }

  setFullSearch() {
    this.advanceSearch = false;
    this.dataSource.filter = this.searchValue;
    this.closeDetails();
  }

  setAdvanceSearchFilter() {
    const searchValue = this.filtersForm.value;
    this.dataSource.filter = searchValue.Definition + ';' + searchValue.Description;
  }

  switchAdvanceSearch() {
    this.advanceSearch = !this.advanceSearch;
    this.filtersForm.reset();
    this.searchValue = '';
    this.dataSource.filter = '';
  }

  closeFilter() {
    this.advanceSearch = false;
    this.filtersForm.reset();
    this.dataSource.filter = '';
  }

  setFilterPredicate() {
    const component = this;
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      if (component.advanceSearch) {
        const searchValue = component.filtersForm.value;
        if (searchValue.Definition == null) { searchValue.Definition = ''; }
        if (searchValue.Description == null) { searchValue.Description = ''; }
        return (data.Name_EN.toLowerCase().includes(searchValue.Definition.toLowerCase()) &&
          data.Description_EN.toLowerCase().includes(searchValue.Description.toLowerCase())) ||
          (data.Name_AR.toLowerCase().includes(searchValue.Definition.toLowerCase()) &&
            data.Description_AR.toLowerCase().includes(searchValue.Description.toLowerCase()));
      } else {
        return data.Name_EN.toLowerCase().includes(component.searchValue.toLowerCase()) ||
          data.Description_EN.toLowerCase().includes(component.searchValue.toLowerCase()) ||
          data.Name_AR.toLowerCase().includes(component.searchValue.toLowerCase()) ||
          data.Description_AR.toLowerCase().includes(component.searchValue.toLowerCase());
      }
    };
  }

  closeDetails() {
    this.detailState = 'out';
  }

}
