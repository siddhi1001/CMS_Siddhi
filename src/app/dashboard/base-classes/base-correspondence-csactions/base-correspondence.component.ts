import { Component, OnInit } from '@angular/core';
import { CSDocumentUploadService } from '../../services/CSDocumentUpload.service';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { CorrResponse } from '../../services/correspondence-response.model';
import { CorrespondenceFolderModel, TemplateModel } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { FCTSDashBoard } from 'src/environments/environment';
import { Observable,forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { catchError, concatMap,tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

@Component({
    selector: 'app-base-correspondence',
    templateUrl: './base-correspondence.component.html'
})

export class BaseCorrespondenceComponent implements OnInit {

    constructor(
        public csdocumentupload: CSDocumentUploadService,
        public correspondenceDetailsService: CorrespondenceDetailsService
    ) { }
    CoverLetterData: CorrResponse[];
    AttachmentFolderData: CorrResponse[];
    // corrFolderData: CorrespondenceFolderModel;
    corrFolderData: CorrespondenceFolderModel = new CorrespondenceFolderModel();
    coverID: string;
    userInfo: CorrResponse[];
    templatesDocList: any[];
    public files: NgxFileDropEntry[] = [];
    progress = 0;
    workspaceTemplateID:number;
    workspaceFolderID:number;
    CSUrl: String = FCTSDashBoard.CSUrl;
    version:string;

    ngOnInit() {

    }

    uploadCSDocument(files: File[], parentID: number, sectionName: any) {
        // pick from one of the 4 styles of file uploads below
        this.csdocumentupload.uploadDocument(files, '' + parentID).subscribe(
            () => '',
            () => '',
            () => {
                if (sectionName === 'COVER') {
                    this.getCoverSection();
                } else if (sectionName === 'ATTACHMENT') {
                    this.getAttachmentSection();
                } else if (sectionName === 'MISC') {
                }
            }
        );
    }

    public dropped(files: NgxFileDropEntry[], parentID: string, section: string) {
        const uploadSession: UploadSession = new UploadSession(files);
        for (const droppedFile of files) {
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {
                    this.csdocumentupload.dragandDropUpload(file, parentID).subscribe(
                        event => {
                            if (event.type === HttpEventType.UploadProgress) {
                                this.calcProgressPercent(event, file, uploadSession);
                            }
                        },
                        () => {
                            this.progress = 0;
                        },
                        () => {
                            this.progress = 0;
                            if (section === 'COVER') {
                                this.getCoverSection();
                            } else if (section === 'ATTACHMENT') {
                                this.getAttachmentSection();
                            } else if (section === 'MISC') {
                            }
                        }
                    );
                });
            } else {
                const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
            }
        }
    }

    calcProgressPercent(event: HttpProgressEvent, file: File, uploadSession: UploadSession) {
        uploadSession.updateProgress(file, event.loaded);
        let progressTemp = Math.round(100 * uploadSession.getTotalLoaded() / uploadSession.getTotalSize());
        // on practice file.size is less than event.total. This prevents to problems of % calculation
        (progressTemp > 100) ? this.progress = 100 : this.progress = progressTemp;
    }

    public fileOver(event) {
    }

    public fileLeave(event) {
    }

    deleteDocument(documentDataid: string, section: string) {
        this.csdocumentupload.deleteDocument(documentDataid).subscribe(
            () => { },
            () => { },
            () => {
                if (section === 'COVER') {
                    this.coverID = undefined;
                    this.getCoverSection();
                } else if (section === 'ATTACHMENT') {
                    this.getAttachmentSection();
                } else if (section === 'MISC') {
                    // this.GetMiscSection();
                }
            }
        );
    }

    addDocumentVersion(files: File[], documentDataid: number, sectionName: any) {
        this.csdocumentupload.uploadDocumentVersion(files, '' + documentDataid).subscribe(
            () => '',
            () => '',
            () => {
                if (sectionName === 'COVER') {
                    this.getCoverSection();
                } else if (sectionName === 'ATTACHMENT') {
                    this.getAttachmentSection();
                } else if (sectionName === 'MISC') {
                }
            }
        );
    }

    getUserInfo() {
        this.correspondenceDetailsService
            .GetUserInformation()
            .subscribe(userInfoVal =>
                this.userInfo = userInfoVal
            );
    }

    // getTempFolderAttachments(corrflowType: string): void {
    //     this.correspondenceDetailsService.createTempAttachments(corrflowType).subscribe(
    //         tempAttachment => {
    //             this.corrFolderData = tempAttachment;
    //         }
    //     );
    // }
    getWorkspaceDetails(workspaceTemplateID:number,workspaceFolderID:number): void {
        //debugger;
        this.correspondenceDetailsService.createWorkspace(workspaceTemplateID,workspaceFolderID).pipe(
          switchMap((workspaceID: number) => {
            return this.correspondenceDetailsService.getWorkspaceSubFolderID(workspaceID);
          })
        ).subscribe(
          (response:any) => {
            // Initialize variables
            this.corrFolderData.AttachCorrID = response.AttachCorrID;
            const idAndNameArray = response.idAndNameArray;
     
            // Extract and assign the id values from the idAndNameArray
            if (idAndNameArray && idAndNameArray.length === 3) {
              this.corrFolderData.AttachCorrCoverID = idAndNameArray[0].id;
              this.corrFolderData.AttachCorrAttachmentsID = idAndNameArray[1].id;
              this.corrFolderData.AttachCorrMiscID = idAndNameArray[2].id;
            } else {
              console.error('Invalid');
            }
          },
          (error) => {
            // Handle any errors here
            console.error('Error', error);
          }
        );
      }
      

    getCoverSection() {
        this.correspondenceDetailsService.getCoverFolderDetails(this.corrFolderData.AttachCorrCoverID).subscribe(
            coverFolderdetails => {
                this.CoverLetterData = coverFolderdetails;
                this.coverID = coverFolderdetails[0].myRows[0].Dataid;

            }
        );
    }

    getAttachmentSection() {
        this.correspondenceDetailsService.getAttachmentFolderDetails(this.corrFolderData.AttachCorrAttachmentsID).subscribe(
            attachmentFolderdetails => this.AttachmentFolderData = attachmentFolderdetails
        );
    }

    openBrowseDocument(event: any, elementID: string) {
        event.preventDefault();
        const element: HTMLElement = document.getElementById(elementID) as HTMLElement;
        element.click();
    }

    convertUndefindedOrNulltoemptyString(obj: any) {
        if (typeof obj == undefined || obj == null) {
            return '';
        } else { return obj; }
    }

    getTemplatesSectionData(corrFlowType: string, templateType: string = 'Default', onBehalfOf: string = '') {
        this.correspondenceDetailsService.getTemplatesList(corrFlowType, templateType, onBehalfOf).subscribe(
            listoftemplates => {
                this.templatesDocList = listoftemplates;
            }
        );
    }

    editFile(nodeID: number, sectionName: string): void {
        const closeMe = '&uiType=2&nextURL=http%3A%2F%2F' + FCTSDashBoard.CSUrlShort + FCTSDashBoard.CloseMe;
        const url = this.CSUrl + '?func=Edit.Edit&nodeid=' + nodeID + closeMe;
        const EditDocWindow: any = window.open(url, '_blank');
        let iterations = 0;
        const interval = setInterval(() => {
            iterations++;
            if (EditDocWindow.closed) {
                if (sectionName === 'COVER') {
                    this.getCoverSection();
                } else if (sectionName === 'ATTACHMENT') {
                    this.getAttachmentSection();
                } else if (sectionName === 'MISC') {
                }
                clearInterval(interval);
            }
            if (iterations > 10) {
                clearInterval(interval);
            }
        }, 1000);
    }

    /* printFile(nodeid) {
        const closeMe = '&uiType=2&nextURL=http%3A%2F%2Fmv2cdmsadp02%2Fimg%2Fcsui%2Fpages%2Fclose.html';
        let url = this.CSUrl + '?func=multifile.printmulti&nodeID_list=' + nodeid + closeMe;
        let EditDocWindow: any = window.open(url, '_blank');
    } */

    /*  selectTeamDialogBox(): void {
         const dialogRef = this.dialog.open(SelectTeamDialogComponent, {
             width: '100%',
             panelClass: 'select-team-dialog',
             maxWidth: '30vw',
         }).afterClosed().subscribe(result => {
             this.reloadSenderSection(result);
 
         });
     } */
}

export class UploadSession {
    loaded: number[] = new Array();
    totalSize = 0;
    filesArray: File[] = new Array();

    constructor(files: NgxFileDropEntry[]) {
        for (const droppedFile of files) {
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {
                    this.totalSize += file.size;
                });
            }
        }

    }

    getTotalSize() {
        return this.totalSize;
    }

    updateProgress(file: File, loaded: number) {
        if (this.filesArray.indexOf(file) === -1) {
            this.filesArray.push(file);
        }
        this.loaded[this.filesArray.indexOf(file)] = loaded;
    }

    getTotalLoaded(): number {
        let totalLoaded = 0;
        for (const loaded of this.loaded) {
            totalLoaded = totalLoaded + loaded;
        }
        return totalLoaded;
    }
}
