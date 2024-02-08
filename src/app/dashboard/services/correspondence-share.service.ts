import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { StatusRequest, SetStatusRow } from '../models/Shared.model';
import { FCTSDashBoard } from '../../../environments/environment';
import { Correspondence } from './correspondence.model';
import { CorrResponse, CommentsNode } from './correspondence-response.model';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { FolderFiles } from 'src/app/dashboard/shared-components/files-select/files-select.component';

@Injectable({
  providedIn: 'root'
})

export class CorrespondenceShareService {
  private CSUrl: string = CSConfig.CSUrl;
  private _globalConstants = this._appLoadConstService.getConstants();
  private sidebarStateSource = new BehaviorSubject(true);
  currentSidebarAction = this.sidebarStateSource.asObservable();

  private proxyChangeEvent = new BehaviorSubject('');
  recoutForProxyChange = this.proxyChangeEvent.asObservable();

  private countDataFromSidebar = new BehaviorSubject([]);
  mrCountReady = this.countDataFromSidebar.asObservable();


  constructor(
    private httpServices: HttpClient
    , private _appLoadConstService: AppLoadConstService
  ) { }

  onProxyChange() {
    this.proxyChangeEvent.next('response');
  }

  setTransferToStatus(setStatusRequest: StatusRequest): Observable<any> {
    const rowsJSON = JSON.stringify({ setStatusRequest });
    const params = new HttpParams()
      .set('statusJson', rowsJSON)
      .set('rowsLength', setStatusRequest.SetStatusRow.length.toString());

    return this.httpServices
      .get<any>(
        this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${
        FCTSDashBoard.SetStatuses
        }?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
        }
      )
      .pipe(
        map(responseData => {
          return responseData;
        }),
        catchError(error => {
          // console.log('set Status ERROR => ' + error.message || 'some error with transfer');
          return error;
        })
      );
  }

  ToggleTransStatus(transID, status): Observable<any> {
    const params = new HttpParams()
      .set('transID', transID.toString())
      .set(status, 'true')
      .set('prompting', 'done');

    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.SetTransStatus}?Format=webreport`,
        {
          headers:
            { OTCSTICKET: CSConfig.AuthToken },
          params: params
        }
      )
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          console.log('set status ERROR => ' + error.message || 'some error with set status');
          return error;
        })
      );
  }

  getTransferUser(user_id: string): Observable<any> {
    const params = new HttpParams()
      .set('EIDs', '')
      .set('OUIDs', '')
      .set('UserIDs', user_id)
      .set('prompting', 'done');
    return this.httpServices
      .get<CorrResponse>(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetTransferUsers}?Format=webreport`,
        {
          headers:
            { OTCSTICKET: CSConfig.AuthToken },
          params: params
        }
      )
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  createTransferReply(transferJson, commonData: StatusRequest): Observable<any> {
    const transferVal = JSON.stringify({ transferJson });
    const params = new HttpParams()
      .set('transferJson', transferVal)
      .set('volumeid', commonData.SetStatusRow[0].subworkid.toString())
      .set('taskid', '32')
      .set('isReplay', '1')
      .set('CorrFlowType', 'Incoming')
      .set('locationid', commonData.SetStatusRow[0].dataid.toString())
      .set('rows_count', transferJson.length)
      .set('parentID', commonData.SetStatusRow[0].transID.toString())
      .set('onBehalfUserID', CSConfig.globaluserid);

    return this.httpServices
      .get<any>(
        this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${
        FCTSDashBoard.createTransfer
        }?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
        }
      )
      .pipe(
        map(data => {
          this.prepSetTransferStatus(data, commonData, 1, '');
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  createTransferRequestDash(transferJson, correspondData: Correspondence, callplace: string): Observable<any> {
    const transferVal = JSON.stringify({ transferJson });
    const url = this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.createTransfer}?Format=webreport`;
    const params = new HttpParams()
      .set('transferJson', transferVal)
      .set('volumeid', correspondData.VolumeID.toString())
      .set('taskid', '32') /* needed to change for diff. CoorFlowType */
      .set('CorrFlowType', correspondData.CorrFlowType)
      .set('locationid', correspondData.DataID.toString())
      .set('rows_count', transferJson.length);

    return this.httpServices.get<any>(url, { headers: { OTCSTICKET: CSConfig.AuthToken }, params: params })
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          return error;
        })
      );
  }

  prepSetTransferStatus(transfered: any, commonData: StatusRequest, status: Number, NotesComplete: string): void {
    const rowsArray: SetStatusRow[] = [];
    const statusRow: SetStatusRow = new SetStatusRow;
    const setStatusRequest: StatusRequest = new StatusRequest;
    setStatusRequest.status = status.toString();
    statusRow.subworkid = commonData.SetStatusRow[0].subworkid.toString();
    statusRow.dataid = commonData.SetStatusRow[0].dataid.toString();
    statusRow.isCC = commonData.SetStatusRow[0].isCC.toString();
    statusRow.transID = commonData.SetStatusRow[0].transID.toString();
    statusRow.NotesComplete = NotesComplete;
    statusRow.currentStatus = commonData.SetStatusRow[0].currentStatus.toString();
    statusRow.userid = CSConfig.globaluserid;
    rowsArray.push(statusRow);
    setStatusRequest.SetStatusRow = rowsArray;
    this.setTransferToStatus(setStatusRequest).subscribe();
  }

  // set status i.e. Archived/Complete etc.
  buildObject(element: any, status: string, callplace: string, comment?: string): StatusRequest {
    const setStatusObj: StatusRequest = new StatusRequest;
    const statusRowsArray: SetStatusRow[] = [];
    setStatusObj.status = status;
    const CList: SetStatusRow = new SetStatusRow;
    switch (callplace) {
      case 'Multiselect':
        for (let i = 0; i < element.length; i++) {
          const mCList: SetStatusRow = new SetStatusRow;
          mCList.subworkid = element[i].SubWork_SubWorkID.toString();
          mCList.dataid = element[i].DataID.toString();
          mCList.transID = element[i].transID.toString();
          mCList.isCC = element[i].transIsCC.toString();
          mCList.userid = this._globalConstants.general.ProxyUserID;
          mCList.currentStatus = element[i].Status.toString();
          mCList.NotesComplete = '';
          statusRowsArray.push(mCList);
        }
        break;
      case 'SingleDashboard':
        CList.subworkid = element.SubWork_SubWorkID.toString();
        CList.dataid = element.DataID.toString();
        CList.transID = element.transID.toString();
        CList.isCC = element.transIsCC.toString();
        CList.userid = this._globalConstants.general.ProxyUserID;
        CList.currentStatus = element.Status.toString();
        CList.NotesComplete = comment;
        statusRowsArray.push(CList);
        break;
      case 'CorrDetails':
        CList.subworkid = element.SubWorkID;
        CList.dataid = element.AttachCorrID;
        CList.transID = element.ID;
        CList.isCC = element.isCC;
        CList.userid = this._globalConstants.general.ProxyUserID;
        CList.currentStatus = element.Status;
        CList.NotesComplete = comment;
        statusRowsArray.push(CList);
        break;
      case 'ReturnToAS':
        let currStatus = '0';
        switch (element.Status.toString()) {
          case 'Acknowledged':
            currStatus = '1';
            break;
          case 'Archived':
            currStatus = '2';
            break;
        }
        CList.subworkid = element.VolumeID.toString();
        CList.dataid = element.DataID.toString();
        CList.transID = element.transID.toString();
        CList.isCC = element.transIsCC.toString();
        CList.userid = this._globalConstants.general.ProxyUserID;
        CList.currentStatus = currStatus;
        CList.NotesComplete = comment;
        statusRowsArray.push(CList);
    }
    setStatusObj.SetStatusRow = statusRowsArray;
    return setStatusObj;
  }

  setComment(commentParams: CommentsNode, task_id: string): Observable<any> {
    const params = new HttpParams()
      .set('ReplyTo', commentParams.ReplyTo)
      .set('CommentText', commentParams.CommentText)
      .set('ReferenceID', commentParams.ReferenceID)
      .set('ReferenceType', commentParams.ReferenceType)
      .set('Private', commentParams.Private)
      .set('TaskID', task_id);
    const options = {
      headers: new HttpHeaders()
        // .set('Content-Type', 'application/json; charset=UTF-8')
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.InsertNewComment}`,
      params, options)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  getCommentsData(volumeID: string): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set('ReferenceID', volumeID);
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
      `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.WorkflowCommentsList
      }?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    )
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  deleteComment(commentParams: CommentsNode): Observable<any> {
    const params = new HttpParams()
      .set('CommentID', commentParams.ID)
      .set('ReferenceID', commentParams.ReferenceID)
      .set('ReferenceType', commentParams.ReferenceType);
    return this.httpServices.get<any>(
      this.CSUrl +
      `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.DeleteComment
      }?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    )
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  DateToISOStringAbs(mDate): string {
    function pad(n) { return n < 10 ? '0' + n : n; }
    if (mDate instanceof Date) {
      return mDate.getFullYear() + '-'
        + pad(mDate.getMonth() + 1) + '-'
        + pad(mDate.getDate()) + 'T'
        + pad(mDate.getHours()) + ':'
        + pad(mDate.getMinutes()) + ':'
        + pad(mDate.getSeconds()) + 'Z';
    } else {
      return '';
    }
  }

  DateToLRString(mDate): string {
    function pad(n) { return n < 10 ? '0' + n : n; }
    if (mDate instanceof Date) {
      return 'D' + '/'
        + mDate.getFullYear() + '/'
        + pad(mDate.getMonth() + 1) + '/'
        + pad(mDate.getDate()) + ':'
        + pad(mDate.getHours()) + ':'
        + pad(mDate.getMinutes()) + ':'
        + pad(mDate.getSeconds());
    } else {
      return '';
    }
  }

  changeSidebarAction(menuAction: boolean) {
    this.sidebarStateSource.next(menuAction);
  }

  sendCountToDashboard(mailroomCount: any) {
    this.countDataFromSidebar.next(mailroomCount);
  }

  /*   getCommentsData(volumeID: string): Observable<CorrResponse[]> {
      const params = new HttpParams()
        .set('ReferenceID', volumeID);
      return this.httpServices.get<CorrResponse[]>(
        this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${
        FCTSDashBoard.WorkflowCommentsList
        }?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
        }
      )
      .pipe (
        map (data => {
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
    } */

  getPerformerUserInfo(kuafID): Observable<any> {
    const params = new HttpParams()
      .set('KuafID', kuafID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.PerformerInfo}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getCorrConnected(ReferenceID: string): Observable<any> {
    const params = new HttpParams()
      .set('ReferenceID', ReferenceID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.CorrespondenceRelated}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getCorrConnectedDet(ReferenceID: string): Observable<any> {
    const params = new HttpParams()
      .set('ReferenceID', ReferenceID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.CorrespondenceRelatedShort}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  deleteConnectedCorr(ConnectionID: string) {
    const params = new HttpParams()
      .set('ConnectionID', ConnectionID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.DeleteConnection}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getDocumentsRelated(ReferenceID: string): Observable<any> {
    const params = new HttpParams()
      .set('ReferenceID', ReferenceID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.DocumentsRelated}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getThreadedView(ReferenceID: string): Observable<any> {
    const params = new HttpParams()
      .set('ReferenceID', ReferenceID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.ConnectionsParentChild}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getFolderProperties(folder_id: string, StartRow: number, EndRow: number, IsParent: boolean, fDestination: string): Observable<any> {
    const params = new HttpParams()
      .set(IsParent ? 'childID' : 'folderID', folder_id)
      .set('StartRow', StartRow.toString())
      .set('EndRow', EndRow.toString())
      .set('fDestination', fDestination);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${IsParent ? FCTSDashBoard.GetParentData : FCTSDashBoard.FilesSerch}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getOnlyFolderContent(folder_id: string, StartRow: number, EndRow: number, fDestination: string, searchStr?: string): Observable<any> {
    const params = new HttpParams()
      .set('folderID', folder_id)
      .set('StartRow', StartRow.toString())
      .set('EndRow', EndRow.toString())
      .set('searchStr', searchStr)
      .set('fSearch', searchStr ? 'true' : 'false')
      .set('fDestination', fDestination);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.FolderFiles}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  insertDocConnection(ReferenceID: string, Selected, constants) {
    const params = new HttpParams()
      .set('ReferenceID', ReferenceID)
      .set('Selected', Selected)
      .set('ConnectedType', constants.ConnectedType)
      .set('ReferenceType', constants.ReferenceType)
      .set('ConnectionType', constants.ConnectionType)
      .set('Deleted', constants.Deleted);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.InsertMultipleConnections}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }


  getLinkedSearchCorr(ReferenceID, startRow, endRow, queryFilters) {
    const params = new HttpParams()
      .set('relatedCorr', ReferenceID)
      .set('startRow', startRow)
      .set('endRow', endRow)
      .set('CorrespondenceCode', queryFilters.ReferenceCode ? queryFilters.ReferenceCode : '')
      .set('ExternalOrganization', queryFilters.ExternalOrganization.ID ? queryFilters.ExternalOrganization.ID : '')
      .set('Priority', queryFilters.Priority.ID ? queryFilters.Priority.ID : '')
      .set('ReceivedDateFrom', queryFilters.DispatchDateFrom ? this.DateToLRString(queryFilters.DispatchDateFrom) : '')
      .set('ReceivedDateTo', queryFilters.DispatchDateTo ? this.DateToLRString(queryFilters.DispatchDateTo) : '')
      .set('FromDep', queryFilters.SenderDepartment.ID ? queryFilters.SenderDepartment.ID : '')
      .set('ToDep', queryFilters.RecipientDepartment.ID ? queryFilters.RecipientDepartment.ID : '')
      .set('BaseType', queryFilters.BaseType.ID ? queryFilters.BaseType.ID : '')
      .set('Subject', queryFilters.Subject ? queryFilters.Subject : '')
      .set('MyAssignments', queryFilters.MyAssignments ? queryFilters.MyAssignments : '')
      .set('DocumentNumber', queryFilters.DocumentNumber ? queryFilters.DocumentNumber : '')
      .set('fRelatedCorr', 'true');
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.ConnectionsSearch}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getAttachmentsData(CorrespondenceID: string): Observable<any> {
    const params = new HttpParams()
      .set('CorrespondenceID', CorrespondenceID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.DownloadAttachmentsBox}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  makeZipFunc(IDs: string): Observable<any> {
    const body = new HttpParams()
      .set('body', `{"id_list":[${IDs}],"type":"ZipAndDownload"}`);
    return this.httpServices.post<any>(this.CSUrl + `${FCTSDashBoard.WFApiV2}zipanddownload`,
      body, {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getZip(ID: number) {
    const params = new HttpParams();
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WFApiV2}zipanddownload/${ID}`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  copyFiles(parent_id: number, original_id: string, name: string) {
    const body = new HttpParams()
      .set('body', `{"original_id":${original_id},"parent_id":${parent_id},"name":"${name}","roles":{"categories":{}}}`);
    return this.httpServices.post<any>(this.CSUrl + `${FCTSDashBoard.WFApiV1}nodes`,
      body, {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  CopySelectedFiles(LocationID: string, ObjectIDs: string, DestinationID: number): Observable<any> {
    const params = new HttpParams()
      .set('LocationID', LocationID)
      .set('ObjectIDs', ObjectIDs)
      .set('DestinationID', DestinationID.toString());
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.CopySelectedFiles}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  setAttachmentsDownloadPermissions(dataID: string): Observable<any> {
    const params = new HttpParams()
      .set('locationid', dataID)
      .set('UserID', this._globalConstants.general.UserID)
      .set('prompting', 'done');
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${
      FCTSDashBoard.SetAttDownloadPermissions}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
      }
    ).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

}
