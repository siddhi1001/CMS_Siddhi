import { Component, OnInit, Input, Output, EventEmitter, ViewChild, NgZone } from '@angular/core';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { FCTSDashBoard } from 'src/environments/environment';
import { Subscription, Subject } from 'rxjs';
import { NgScrollbar } from 'ngx-scrollbar';
import { map } from 'rxjs/operators';


export interface FolderProperties {
  folderHierarchy: FolderHierarchy[];
  folderFiles: FolderFiles[];
}

export interface FolderHierarchy {
  DataID: string;
  ParentID: string;
  Name: string;
  Level: string;
}

export interface FolderFiles {
  position: number;
  DataID: number;
  Name: string;
  VersionNum: string;
  ModifyDate: string;
  CreateDate: string;
  Size: string;
  MimeType: string;
  Type: string;
}

@Component({
  selector: 'app-files-select',
  templateUrl: './files-select.component.html',
  styleUrls: ['./files-select.component.scss']
})
export class FilesSelectComponent implements OnInit {

  public folderHierarchy: FolderHierarchy;
  public hierarchy: FormControl;
  public folderParent: string;
  public activeSearchSpinner = false;
  public dataSource;
  public dataSourceBuffer;
  public basehref: String = FCTSDashBoard.BaseHref;
  public currentReferenceID: string;
  public searchStr: string;
  public StartRow = 1;
  public loadStep = 20;
  public LazyLoad;
  public searchValue: string;
  public currentFolderSelected = false;
  public fDestination = 'false';
  @Input() DataID: string;
  @Input() multiple: boolean;
  @Input() getParentStructure: boolean;
  @Input() outputActionIdent: string;
  @Output() backtodoc = new EventEmitter<number>();
  @Output() outputAction = new EventEmitter<any>();
  @ViewChild(NgScrollbar) scrollbarRef: NgScrollbar;
  unsubscriber$ = Subscription.EMPTY;

  // types that can be a destination
  public folderTypes = ['0', '1'];
  // table fields
  FilesDisplayedColumns: string[] = ['Select', 'Type', 'Name', 'Size'];
  // objects for tables loop
  FilesTableStructure = [
    { 'columnDef': 'Select', 'columnName': '', 'width': '5' },
    { 'columnDef': 'Type', 'columnName': 'Type', 'width': '5' },
    { 'columnDef': 'Name', 'columnName': 'Name', 'width': '75' },
    { 'columnDef': 'Size', 'columnName': 'Size', 'width': '15' }
  ];

  constructor(
    public correspondenceShareService: CorrespondenceShareService,
    public errorHandlerFctsService: ErrorHandlerFctsService) { }
  selection = new SelectionModel<FolderFiles>(true, []);

  ngOnInit() {
    this.currentReferenceID = this.DataID;
    this.getFolderProperties(this.currentReferenceID, this.getParentStructure);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    this.unsubscriber$.unsubscribe();
  }

  onlySelectable(event) {
    event.checked ? this.fDestination = 'true' : this.fDestination = 'false';
    this.searchFunction();
  }

  scrollSubscriberFunction(searchStr: string) {
    this.unsubscriber$ = this.scrollbarRef.scrollable.elementScrolled().pipe(
      map((e: any) => {
        this.onTableScroll(e.target.offsetHeight, e.target.scrollHeight, e.target.scrollTop, searchStr);
      })
    ).subscribe();
    this.scrollbarRef.scrollable.getElementRef().nativeElement.onwheel = () => { };
  }

  scrollUnubscriberFunction() {
    this.unsubscriber$.unsubscribe();
  }

  onTableScroll(offsetHeight, scrollHeight, scrollTop, searchStr?: string) {
    const buffer = 200;
    const limit = scrollHeight - offsetHeight - buffer;
    if (scrollTop > limit && !this.LazyLoad.loadInProcess) {
      this.LazyLoad.LazyLoadFunction(searchStr);
    }
  }

  getFolderProperties(folder_id: string, IsParent) {
    this.searchValue = '';
    this.currentFolderSelected = false;
    this.selection.clear();
    this.scrollUnubscriberFunction();
    this.activeSearchSpinner = true;
    this.correspondenceShareService.getFolderProperties(folder_id, this.StartRow, this.loadStep, IsParent, this.fDestination).subscribe(
      response => {
        if (response.hasOwnProperty('FolderHierarchy') && response.FolderHierarchy.length > 0) {
          this.folderHierarchy = response.FolderHierarchy;
          this.hierarchy = new FormControl(response.FolderHierarchy[response.FolderHierarchy.length - 1].DataID);
          this.currentReferenceID = response.FolderHierarchy[response.FolderHierarchy.length - 1].DataID;
          this.folderParent = response.FolderHierarchy[response.FolderHierarchy.length - 1].ParentID;
          if (response.hasOwnProperty('FolderFiles') && response.FolderFiles.length > 0) {
            this.dataSourceBuffer = response.FolderFiles;
            this.dataSource = new MatTableDataSource<FolderFiles>(this.dataSourceBuffer);
            if (response.FolderFiles.length === this.loadStep) {
              this.LazyLoad = new LazyLoad(this.currentReferenceID, this.correspondenceShareService, this.errorHandlerFctsService, this);
              this.scrollSubscriberFunction(this.searchValue);
            }
          } else {
            this.dataSource = null;
          }
        }
        this.activeSearchSpinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.activeSearchSpinner = false;
      }
    );
  }

  searchFunction(): boolean {
    this.fileSearch(this.searchValue);
    return false;
  }

  fileSearch(searchValue) {
    this.activeSearchSpinner = true;
    this.selection.clear();
    this.scrollUnubscriberFunction();
    this.correspondenceShareService.getOnlyFolderContent(this.currentReferenceID, this.StartRow, this.loadStep, this.fDestination, searchValue).subscribe(
      response => {
        this.dataSourceBuffer = response;
        this.dataSource = new MatTableDataSource<FolderFiles>(this.dataSourceBuffer);
        if (response.length === this.loadStep) {
          this.LazyLoad = new LazyLoad(this.currentReferenceID, this.correspondenceShareService, this.errorHandlerFctsService, this);
          this.scrollSubscriberFunction(searchValue);
        }
        this.activeSearchSpinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.activeSearchSpinner = false;
      }
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: FolderFiles): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  changeCheckbox(event, row: FolderFiles): void {
    if (this.multiple) {
      if (event) {
        this.selection.toggle(row);
      }
    } else {
      this.selection.clear();
      this.currentFolderSelected = false;
      if (event.checked) {
        this.selection.toggle(row);
      }
    }
  }

  BackToDocList(): void {
    this.backtodoc.next(0);
  }

  outputActionTrigger(): void {
    let arr = new Array;
    this.selection.selected.forEach(element => {
      arr.push(element.DataID);
    });
    if (this.currentFolderSelected) {
      arr.push(this.currentReferenceID);
    }
    this.outputAction.next(arr);
    this.BackToDocList();
    this.selection.clear();
  }

  threadedMoving(DataID) {
    this.currentReferenceID = DataID;
    this.getFolderProperties(this.currentReferenceID, true);
  }

  currentFolderSelect() {
    this.selection.clear();
    this.currentFolderSelected = true;
  }

  isCheckedrow(row: FolderFiles): boolean {
    let isChecked = false;
    this.selection.selected.forEach(element => {
      if (element.position === row.position) {
        isChecked = true;
      }
    });
    return isChecked;
  }
}


export class LazyLoad {
  StartRow: number;
  EndRow: number;
  folderID: String;
  loadInProcess = false;


  constructor(folderID: String,
    public correspondenceShareService: CorrespondenceShareService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public filesSelectComponent: FilesSelectComponent) {
    this.folderID = folderID;
    this.StartRow = this.filesSelectComponent.StartRow;
    this.EndRow = this.filesSelectComponent.loadStep;
  }



  LazyLoadFunction(searchStr: string) {
    this.loadInProcess = true;
    this.StartRow += this.filesSelectComponent.loadStep;
    this.EndRow += this.filesSelectComponent.loadStep;
    this.correspondenceShareService.getOnlyFolderContent(this.filesSelectComponent.currentReferenceID, this.StartRow, this.EndRow, this.filesSelectComponent.fDestination, searchStr).subscribe(
      response => {
        this.filesSelectComponent.dataSourceBuffer = this.filesSelectComponent.dataSourceBuffer.concat(response);
        this.filesSelectComponent.dataSource = new MatTableDataSource<FolderFiles>(this.filesSelectComponent.dataSourceBuffer);
        this.loadInProcess = false;
        response.length < 20 ? this.filesSelectComponent.scrollUnubscriberFunction() : null;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }
}
