import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource } from '@angular/material';
import { CorrespondenceShareService } from 'src/app/dashboard/services/correspondence-share.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FCTSDashBoard } from 'src/environments/environment';
import { NotificationService } from '../../services/notification.service';
import { CorrespondenceService } from 'src/app/dashboard/services/correspondence.service';
import { multiLanguageTranslatorPipe } from 'src/assets/translator/index';


export interface FileProperties {
  Position: string;
  ParentID: string;
  ParentName: string;
  DataID: string;
  Name: string;
  SubType: string;
  DocType: string;
  Link: string;
  Size: string;
  ModifyDate: string;
}

export interface DownloadAttachmentsData {
  CoverLetter: FileProperties[];
  AttachmentFiles: FileProperties[];
}

@Component({
  selector: 'app-download-attachtments-dialog',
  templateUrl: './download-attachtments-dialog.component.html',
  styleUrls: ['./download-attachtments-dialog.component.scss']
})
export class DownloadAttachtmentsDialogComponent implements OnInit {
  public currentDataID: string;
  public currentName: string;
  public coverLetter/* : FileProperties[] */;
  public attachmentsFiles/* : FileProperties[] */;

  public CSUrl: String = FCTSDashBoard.CSUrl;
  public saveOptions = false;
  public tabIndex = 0;
  public selectedSave = false;
  public spinner = false;
  private dataID: string;
  private name: string;
  selectionCover = new SelectionModel<FileProperties>(true, []);
  selectionAttachment = new SelectionModel<FileProperties>(true, []);
  EnterpriseWorkspace = '2000';
  filesAction = 'copyToFolder';
  displayedColumns: string[] = ['Select', 'DocType', 'Name', 'Parent', 'Size', 'ModifyDate', 'DownloadURL'];

  tableStructure = [
    { 'columnDef': 'DocType', 'columnName': 'Type', 'width': '5' },
    { 'columnDef': 'Name', 'columnName': 'Name', 'width': '35' },
    { 'columnDef': 'Parent', 'columnName': 'Folder', 'width': '30' },
    { 'columnDef': 'Size', 'columnName': 'Size', 'width': '5' },
    { 'columnDef': 'ModifyDate', 'columnName': 'Modified', 'width': '15' },
    { 'columnDef': 'DownloadURL', 'columnName': '', 'width': '5' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public correspondenceShareService: CorrespondenceShareService,
    public errorHandlerFctsService: ErrorHandlerFctsService,
    public dialogRef: MatDialogRef<DownloadAttachtmentsDialogComponent>,
    private notificationmessage: NotificationService,
    public correspondenceService: CorrespondenceService,
    private translator: multiLanguageTranslatorPipe,
  ) { }

  ngOnInit() {
    this.dataID = this.data.correspondData.DataID.toString();
    this.name = this.data.correspondData.Name;
    this.setAttachmentsDownloadPermissions(this.dataID);
  }

  getAttachmentsData(CorrespondenceID: string) {
    this.correspondenceShareService.getAttachmentsData(CorrespondenceID).subscribe(
      response => {
        this.coverLetter = new MatTableDataSource<FileProperties>(response.CoverLetter);
        this.attachmentsFiles = new MatTableDataSource<FileProperties>(response.AttachmentFiles);
        this.spinner = false;
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.spinner = false;
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  isAllSelectedCover() {
    const numSelected = this.selectionCover.selected.length;
    const numRows = this.coverLetter.data.length;
    return numSelected === numRows;
  }

  masterToggleCover() {
    this.isAllSelectedCover() ?
      this.selectionCover.clear() :
      this.coverLetter.data.forEach(row => this.selectionCover.select(row));
  }

  checkboxLabelCover(row?: FileProperties): string {
    if (!row) {
      return `${this.isAllSelectedCover() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionCover.isSelected(row) ? 'deselect' : 'select'} row ${row.Position + 1}`;
  }
  /************************** */
  isAllSelectedAttachment() {
    const numSelected = this.selectionAttachment.selected.length;
    const numRows = this.attachmentsFiles.data.length;
    return numSelected === numRows;
  }

  masterToggleAttachment() {
    this.isAllSelectedAttachment() ?
      this.selectionAttachment.clear() :
      this.attachmentsFiles.data.forEach(row => this.selectionAttachment.select(row));
  }

  checkboxLabelAttachment(row?: FileProperties): string {
    if (!row) {
      return `${this.isAllSelectedAttachment() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionAttachment.isSelected(row) ? 'deselect' : 'select'} row ${row.Position + 1}`;
  }

  openSaveOptions(condition: boolean): void {
    this.saveOptions = condition;
  }

  zipAndDownloadAll(): void {
    this.spinner = true;
    this.correspondenceShareService.makeZipFunc(this.dataID)
      .subscribe(
        response => {
          this.getZip(response.results.data.jobs.id);
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
          this.spinner = false;
        }
      );
  }

  zipAndDownloadSelected() {
    this.spinner = true;
    this.correspondenceShareService.makeZipFunc(this.getSelectedFiles())
      .subscribe(
        response => {
          this.getZip(response.results.data.jobs.id);
          this.spinner = false;
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
          this.spinner = false;
        }
      );
  }

  getSelectedFiles() {
    let filesArray = [];
    this.selectionCover.selected.forEach(element => {
      filesArray.push(element.DataID);
    });
    this.selectionAttachment.selected.forEach(element => {
      filesArray.push(element.DataID);
    });
    return filesArray.join();
  }

  getZip(zipID: number) {
    this.correspondenceShareService.getZip(zipID)
      .subscribe(
        response => {
          if (!response.results.data.jobs.complete) {
            setTimeout(() => { this.getZip(response.results.data.jobs.id); }, 500);
          } else {
            this.spinner = false;
            window.location.href = `${this.CSUrl}${response.results.data.jobs.link}`;
          }
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
          this.spinner = false;
        }
      );
  }

  changeTab(tab) {
    this.tabIndex = tab;
  }

  getCopyDestination(forSelected) {
    this.changeTab(1);
    this.selectedSave = forSelected;
  }

  copyFiles(DestinationID) {
    this.selectedSave ? this.CopySelectedFiles(DestinationID) : this.copyAllFiles(DestinationID);
  }

  copyAllFiles(destinationID: number[]): void {
    this.changeTab(0);
    this.spinner = true;
    destinationID.forEach(element => {
      this.correspondenceShareService.copyFiles(element, this.dataID, this.name)
        .subscribe(
          response => {
            this.spinner = false;
            this.notificationmessage.success('Files saved',  this.translator.transform('files_saved_to_selected_dest'), 3000);
          },
          responseError => {
            this.notificationmessage.error('error', responseError.error.error, 3000);
            this.spinner = false;
          }
        );
    });
  }


  CopySelectedFiles(destinationID: number[]): void {
    this.spinner = true;
    destinationID.forEach(element => {
      this.correspondenceShareService.CopySelectedFiles(this.dataID, this.getSelectedFiles().toString(), element)
        .subscribe(
          response => {
            this.spinner = false;
            this.notificationmessage.success('Files are saved', this.translator.transform('files_saved_to_selected_dest'), 3000);
          },
          responseError => {
            this.errorHandlerFctsService.handleError(responseError).subscribe();
            /* this.notificationmessage.error('error', responseError.error.error, 3000); */
            this.spinner = false;
          }
        );
    });
  }

  setAttachmentsDownloadPermissions(dataID: string): void {
    this.spinner = true;
    this.correspondenceShareService.setAttachmentsDownloadPermissions(dataID).subscribe(
      response => {
        this.getAttachmentsData(this.dataID);
      },
      responseError => {
        this.errorHandlerFctsService.handleError(responseError).subscribe();
        this.spinner = false;
      }
    );
  }

}
