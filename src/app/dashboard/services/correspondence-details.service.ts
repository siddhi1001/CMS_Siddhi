import { Injectable } from "@angular/core";
import { Observable,of, throwError } from "rxjs";
import { CorrResponse } from "./correspondence-response.model";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { FCTSDashBoard } from "../../../environments/environment";
import { DocumentPreview } from "../services/documentpreview.model";
import {
  DashboardFilterResponse,
  TransferAttributes,
} from "../models/DashboardFilter";
import {
  CorrespondenenceDetailsModel,
  OrgNameAutoFillModel,
  CorrespondenceFolderModel,
  CCUserSetModel,
  ColUserSetModel,
  SyncDocumentMetadataModel,
  TemplateModel
} from "../models/CorrespondenenceDetails.model";
import { StatusRequest, SetStatusRow } from "../models/Shared.model";
import { CorrespondenceShareService } from "../services/correspondence-share.service";
import { map, catchError } from "rxjs/operators"; /* added 24/06/2019 */
import { EMPTY } from "rxjs";
import { CorrespondenceWFFormModel } from "../models/CorrepondenceWFFormModel";
import { AppLoadConstService } from "src/app/app-load-const.service";
import { stringify } from "querystring";
import {
  MultipleApproveInputData,
  ApproversData,
  ApproverDetails,
  ApproversFormData,
} from "src/app/dashboard/shared-components/multiple-approve/multiple-approve.component";
import { DistributionDetailsParameters } from "src/app/dashboard/models/distribution.model";
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class CorrespondenceDetailsService {
  private _globalConstants = this.appLoadConstService.getConstants();
  private CSUrl: string = CSConfig.CSUrl;

  constructor(
    private httpServices: HttpClient,
    private _correspondenceShareService: CorrespondenceShareService,
    public appLoadConstService: AppLoadConstService,
    private http: HttpClient
  ) {}



  getCorrespondenceRecipientDetails(
    SubWorkID,
    CorrFlowType
  ): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("SubWorkID", SubWorkID)
      .set("CorrFlowType", CorrFlowType)
      .set("qLive", "false")
      .set("prompting", "done");
    return this.httpServices
      .get<CorrResponse[]>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.RecipientInfo}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          // console.log('correspondence ERROR => ' + error.message || 'some error with correspondence');
          return throwError(error);
        })
      );
  }

  getCorrespondenceSenderDetails(
    SubWorkID,
    CorrFlowType,
    qLive,
    UserID = "",
    maxApproveLevel?: number
  ): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("SubWorkID", SubWorkID)
      .set("CorrFlowType", CorrFlowType)
      .set("qLive", qLive)
      .set("prompting", "done")
      .set("UserID", UserID)
      .set("FinalAppLevel", maxApproveLevel.toString());
    return this.httpServices
      .get<CorrResponse[]>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.SenderInfo}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          // console.log('correspondence ERROR => ' + error.message || 'some error with correspondence');
          return throwError(error);
        })
      );
  }

  getCorrespondenceCCDetail(
    SubWorkID,
    CorrFlowType
  ): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("SubWorkID", SubWorkID)
      .set("CorrFlowType", CorrFlowType)
      .set("qLive", "false")
      .set("prompting", "done");
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.CCInfo}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCorrespondenceCoverDetail(SubWorkID): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("SubWorkID", SubWorkID)
      .set("qLive", "false")
      .set("prompting", "done");
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.CoverSectionInfo}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getDocumentURL(coverdocumentid): Observable<DocumentPreview[]> {
    const params = new HttpParams().set("coverdocumentid", coverdocumentid);
    return this.httpServices.get<DocumentPreview[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.BravaURL}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getPreviewTemplateURL(coverdocumentid,templateid): Observable<DocumentPreview[]> {
    const params = new HttpParams()
    .set("coverdocumentid", coverdocumentid)
    .set("templateid",templateid);
    return this.httpServices.get<DocumentPreview[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.TemplateURL}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getPreviewTemplateID(documentID: string, version: string): Observable<string> {
    const params = new HttpParams()
      .set("documentID", documentID)
      .set("version", version);
  
      return of("141623");
    // this.httpServices.get<string>(
    //   this.CSUrl +
    //     `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.TemplateURL}?Format=webreport`,
    //   {
    //     headers: { OTCSTICKET: CSConfig.AuthToken },
    //     params: params,
    //   }
    // );
  }
  

  getCorrespondenceAttachmentsDetail(
    SubWorkID,
    CorrFlowType
  ): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("SubWorkID", SubWorkID)
      .set("CorrFlowType", CorrFlowType)
      .set("qLive", "false")
      .set("prompting", "done");
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AttachmentSectionInfo}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getTransferPurposeAndPriority(): Observable<TransferAttributes> {
    return this.httpServices.get<TransferAttributes>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.TransferAttributes}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
      }
    );
  }

  searchTransferFieldName(name, Type) {
    if (name.length >= 3) {
      let requestType;
      if (Type === "EMP") {
        requestType = "IntName";
      } else {
        requestType = "IntDepartment";
      }
      const params = new HttpParams()
        .set(requestType, "true")
        .set("NameVal", name + "%");
      /*       if (name.length >= 3) { */
      return this.httpServices.get<DashboardFilterResponse[]>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetTransferFields}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      );
      /*       } */
    }
    return EMPTY;
  }

  getCorrespondenceMetadataDetail(
    SubWorkID,
    CorrFlowType
  ): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("volumeId", SubWorkID)
      .set("CorrFlowType", CorrFlowType);
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.getcorrespondenceinfoRO}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getTransferHistoryTab(volumeID): Observable<CorrResponse[]> {
    const params = new HttpParams().set("volumeID", volumeID);
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.TransferHistoryTab}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCorrRecord(locationid, transid, onbehalfuserid): Observable<any> {
    const params = new HttpParams()
      .set("FolderID", locationid)
      .set("transID", transid)
      .set("onBehalfUserID", onbehalfuserid);
    return this.httpServices
      .get<CorrespondenenceDetailsModel[]>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetCorrRecordData}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          let corrFlowType: string;
          switch (data[0].CorrespondenceFlowType) {
            case "1":
              corrFlowType = "Incoming";
              break;
            case "5":
              corrFlowType = "Outgoing";
              break;
            case "7":
              corrFlowType = "Internal";
              break;
          }
          data[0].CorrFlowType = corrFlowType;
          return data;
        }),
        catchError((error) => {
          return error;
        })
      );
  }

  getCorrespondenceFolderName(volumeID): Observable<any> {
    const params = new HttpParams().set("volumeID", volumeID);
    return this.httpServices.get(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetCorrFolderName}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCorrespondenceCollaborationInfoRO(
    SubWorkID,
    CorrFlowType
  ): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("SubWorkID", SubWorkID)
      .set("CorrFlowType", CorrFlowType)
      .set("ReadOnly", "Yes")
      .set("qLive", "false");
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.UserCollaborationRO}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCommentsData(volumeID): Observable<CorrResponse[]> {
    const params = new HttpParams().set("ReferenceID", volumeID);
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.WorkflowCommentsList}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCorrConnectionsData(locationid): Observable<CorrResponse[]> {
    const params = new HttpParams().set("ReferenceID", locationid);
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.CorrConnectionsList}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getDocumentPropertiesURL(docid): Observable<DocumentPreview[]> {
    const params = new HttpParams().set("docid", docid);
    return this.httpServices.get<DocumentPreview[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.PropertiesURL}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  /* Changed PSM: 04/10/2019 */
  createTransferRequest(
    transferJson,
    correspondenceData: CorrespondenenceDetailsModel
  ): Observable<any> {
    let taskID: string;
    correspondenceData.CorrespondenceFlowType === "1"
      ? (taskID = "32")
      : (taskID = "3"); // for permission purpose
    const transferVal = JSON.stringify({ transferJson });
    const params = new HttpParams()
      .set("transferJson", transferVal)
      .set("volumeid", correspondenceData.VolumeID)
      .set("taskid", taskID)
      .set("CorrFlowType", correspondenceData.CorrFlowType)
      .set("locationid", correspondenceData.AttachCorrID)
      .set("parentID", correspondenceData.ID)
      .set("rows_count", transferJson.length)
      .set("onBehalfUserID", this._globalConstants.general.ProxyUserID);

    return this.httpServices
      .get<any>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.createTransfer}?Format=webreport`,
        { headers: { OTCSTICKET: CSConfig.AuthToken }, params: params }
      )

      .pipe(
        map((data) => {
          this.prepSetTransferStatus(data, correspondenceData, 1, "");
          return data;
        }),
        catchError((error) => {
          // console.log('transfer ERROR => ' + error.message || 'some error with transfer');
          return error;
        })
      );
  }

  prepSetTransferStatus(
    transfered: any,
    correspondenceData: CorrespondenenceDetailsModel,
    status: Number,
    NotesComplete: string
  ): void {
    /* build object to set Status
    taskstatus -> status
      dataid -> correspondenceData.AttachCorrID
      transid -> correspondenceData.ID
      currentStatus -> correspondenceData.Status
      dataid -> correspondenceData.AttachCorrID
      subworkid -> AttachCorrID.SubWorkID
      isCC -> AttachCorrID.isCC
      NotesComplete -> ''
    */
    const rowsArray: SetStatusRow[] = [];
    const statusRow: SetStatusRow = new SetStatusRow();
    const setStatusRequest: StatusRequest = new StatusRequest();
    setStatusRequest.status = status.toString();
    statusRow.subworkid = correspondenceData.SubWorkID.toString();
    statusRow.dataid = correspondenceData.AttachCorrID.toString();
    statusRow.isCC = correspondenceData.isCC.toString();
    statusRow.transID = correspondenceData.ID.toString();
    statusRow.NotesComplete = NotesComplete;
    statusRow.currentStatus = correspondenceData.Status.toString();
    statusRow.userid = this._globalConstants.general.ProxyUserID.toString();
    rowsArray.push(statusRow);
    setStatusRequest.SetStatusRow = rowsArray;
    this._correspondenceShareService
      .setTransferToStatus(setStatusRequest)
      .subscribe();
  }

  GetUserInformation(): Observable<CorrResponse[]> {
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.UserInfo}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
      }
    );
  }

  searchFieldForAutoFill(
    searchText: string,
    searchField: string,
    ParentVal: any
  ): Observable<OrgNameAutoFillModel[]> {
    // let searchResults: Observable<OrgNameAutoFillModel[]>;
    if (searchText.length >= 3) {
      const params = new HttpParams()
        .set("NameVal", "%" + searchText + "%")
        .set(searchField, "true");
      return this.httpServices.get<OrgNameAutoFillModel[]>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.searchFieldautoFill}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      );
    }
    return EMPTY;
  }

  searchFieldForAutoFillOUID(
    orgID: string,
    searchField: string,
    parentOUID: string
  ): Observable<OrgNameAutoFillModel[]> {
    // let searchResults: Observable<OrgNameAutoFillModel[]>;
    const params = new HttpParams()
      .set("OrgID", orgID)
      .set(searchField, "true");
    return this.httpServices.get<OrgNameAutoFillModel[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.searchFieldautoFill}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCoverFolderDetails(FolderID: number): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("FolderID", "" + FolderID)
      .set("prompting", "done");
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.CoverFolderContents}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getAttachmentFolderDetails(FolderID: number): Observable<CorrResponse[]> {
    const params = new HttpParams()
      .set("FolderID", "" + FolderID)
      .set("prompting", "done");
    return this.httpServices.get<CorrResponse[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AttachmentFolderContents}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  createTempAttachments(
    CorrFlowType: string
  ): Observable<CorrespondenceFolderModel> {
    const params = new HttpParams().set("CorrFlowType", CorrFlowType);
    return this.httpServices.get<CorrespondenceFolderModel>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.createTempAttachments}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
  
  createWorkspace(workspaceTemplateID:number,workspaceFolderID:number): Observable<number> {
    const apiUrl = this.CSUrl+ `${FCTSDashBoard.WFApiV2}businessworkspaces`
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthNumber = currentDate.getMonth() + 1;
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const monthFormat = `${monthNumber}-${month}`;
    const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);
    const workspaceName = `${this._globalConstants.general.UserID}-${timestampInSeconds}`;
  
    // Create a FormData object
    const formData = new FormData();

        // Define the request headers
        const headers = new HttpHeaders({
           OTCSTICKET: CSConfig.AuthToken,
        });
  
    // Add each field to the FormData
    formData.append('body', JSON.stringify({
      template_id: workspaceTemplateID,
      name: 'Workspace name is generated automatically.',
      type: 848,
      parent_id: workspaceFolderID,
      description: '',
      external_source: '',
      external_identity: '',
      external_identity_type: '',
      order_new: -1,
      reference_type: '29',
      mime_type: 'Business Workspace',
      size: '',
      itemId: '',
      roles: {
        categories: {
          '674149': {
            '674149_2': false,
            '674149_3': '',
            '674149_4': workspaceName,
            '674149_5': currentYear,
            '674149_6': monthFormat,
            '674149_1': {
              upgradeable: '',
              version_number: 3,
            },
          },
        },
      },
      classifications: {
        create_id: [''],
        id: [],
      },
      source_parent_id: workspaceFolderID,
    }));

  // Return an observable that emits the workspaceID
  return this.http.post(apiUrl, formData,{ headers: headers }).pipe(
    switchMap((response: any) => {
      const workspaceID = response.results.id;
      return of(workspaceID);
    })
  );
}


  getWorkspaceSubFolderID(workspaceID:number):Observable<any> {
    //debugger;
  const apiUrl =  this.CSUrl+ `${FCTSDashBoard.WFApiV2}nodes/${workspaceID}/nodes`

          // Define the request headers
          const headers = new HttpHeaders({
            OTCSTICKET: CSConfig.AuthToken,
         });

         return this.http.get(apiUrl,{ headers: headers }).pipe(
          map((response: any) => {
            // Process the response and extract id and name values
            const results = response.results;
            const AttachCorrID = response.results[0].data.bwsinfo.id;
            const idAndNameArray = results.map((result: any) => {
              const properties = result.data.properties;
              const id = properties.id;
              const name = properties.name;
              return { id, name };
              
            });
            return { AttachCorrID,idAndNameArray };
          })
        );
//  // Make a GET request to fetch the subFolderID
//  return this.http.get(apiUrl,{ headers: headers }).pipe(
//   switchMap((response: any) => {
//     const subFolderID = response.results.sub_folder_id;
//     return of(subFolderID);
//   })
// );
}

  getCorredpondenceBarcode(
    corrAttachID: number,
    CorrFlowType: string,
    CorrespondenceYear: number
  ): Observable<any> {
    const params = new HttpParams()
      .set("CorrFlowType", CorrFlowType)
      .set("CorrespondenceYear", "" + CorrespondenceYear)
      .set("AttachID", "" + corrAttachID);
    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GenerateBarcode}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCCUserDetailsSet(
    OUIds: string,
    EmpIDs: string,
    corrFlowType: string
  ): Observable<CCUserSetModel[]> {
    const params = new HttpParams()
      .set("OUIDs", OUIds)
      .set("qLive", "true")
      .set("CorrFlowType", corrFlowType)
      .set("UserIDs", "")
      .set("EIDs", EmpIDs);

    return this.httpServices.get<CCUserSetModel[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetCCUserSet}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  /*****************************correspondence form-step-functions**************************************** */

  getFormStepInfo(
    WorkID: string,
    SubWorkID: string,
    TaskID: string
  ): Observable<any> {
    const params = new HttpParams()
      .set("process_id", WorkID)
      .set("subprocess_id", SubWorkID)
      .set("task_id", TaskID);
    return this.httpServices
      .get<any>(
        this.CSUrl + `${FCTSDashBoard.WFApiV1}forms/processes/tasks/update?`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          // console.log('correspondence ERROR => ' + error.message || 'some error with correspondence');
          return throwError(error);
        })
      );
  }

  submitCorrespondenceInfo(
    WorkID: string,
    TaskID: string,
    data: any
  ): Observable<any> {
    const url =
      this.CSUrl +
      `${FCTSDashBoard.WFApiV2}processes/${WorkID}/subprocesses/${WorkID}/tasks/${TaskID}`;
    const body = new HttpParams().set("body", JSON.stringify(data));
    return this.httpServices
      .put<any>(url, body, {
        headers: new HttpHeaders()
          .set("OTCSTICKET", CSConfig.AuthToken)
          .set("Content-Type", "application/x-www-form-urlencoded"),
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          // console.log('correspondence ERROR => ' + error.message || 'some error with correspondence');
          return throwError(error);
        })
      );
  }

  convertDocToPDFAPI(coverID: string): Observable<any> {
    const params = new HttpParams().set("docID", coverID);
    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ConvertDocToPDF}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  sendOnCorrespondence(WorkID: string, TaskID: string) {
    const url =
      this.CSUrl +
      `${FCTSDashBoard.WFApiV2}processes/${WorkID}/subprocesses/${WorkID}/tasks/${TaskID}`;
    const body = new HttpParams().set("action", "SendOn");
    return this.httpServices
      .put<any>(url, body, {
        headers: new HttpHeaders().set("OTCSTICKET", CSConfig.AuthToken),
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          // console.log('correspondence ERROR => ' + error.message || 'some error with correspondence');
          return throwError(error);
        })
      );
  }

  getCurrentUserMailroomPrivelage(): Observable<any> {
    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetUserMailroomPrivelage}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
      }
    );
  }

  getApproverList(ApproverType: string): Observable<any[]> {
    const params = new HttpParams()
      .set(ApproverType, "true")
      .set("mainLanguage", "EN")
      // TODO: check what should be used - ProxyUserID or UserID
      .set("filterField1", CSConfig.globaluserid);
    return this.httpServices.get<any[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetApproverList}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getApproverListRunningWF(
    ApproverType: string,
    volumeID: string
  ): Observable<any[]> {
    const params = new HttpParams()
      .set(ApproverType, "true")
      .set("mainLanguage", "EN")
      .set("filterField1", volumeID);
    return this.httpServices.get<any[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetApproverList}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getTemplatesList(
    corrFlowType: string,
    templateType: string = "Default",
    onBehalfOf: string = "false"
  ) {
    const params = new HttpParams()
      .set("correspondence_type", corrFlowType)
      .set("template_type", templateType)
      .set("onBehalfOf", onBehalfOf)
      .set("active", "1")
      .set(
        "catid",
        this._globalConstants.FCTS_StepConsole.TemplateCategory.toString()
      )
      .set("language", "")
      .set(
        "locationid",
        this._globalConstants.FCTS_StepConsole.TemplateFolder.toString()
      );
    return this.httpServices.get<any[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetCoverLettertemplates}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCollUserDetailsSet(
    EmpIDs: string,
    corrFlowType: string
  ): Observable<ColUserSetModel[]> {
    const params = new HttpParams()
      .set("qLive", "true")
      .set("CorrFlowType", corrFlowType)
      .set("UserIDs", "")
      .set("EIDs", EmpIDs)
      .set("SubWorkID", "")
      .set("UserIDs", "");

    return this.httpServices.get<ColUserSetModel[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetColUserSet}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
  syncDocumentMetadata(
    documentMetadataSync: SyncDocumentMetadataModel
  ): Observable<any> {
    const formData = new FormData();
    formData.append(
      "docFolderID",
      documentMetadataSync.docFolderID ? documentMetadataSync.docFolderID : ""
    );
    formData.append(
      "srcDocID",
      documentMetadataSync.srcDocID ? documentMetadataSync.srcDocID : ""
    );
    formData.append(
      "SenderOrganization",
      documentMetadataSync.SenderOrganization
        ? documentMetadataSync.SenderOrganization
        : ""
    );
    formData.append(
      "SenderDepartment",
      documentMetadataSync.SenderDepartment
        ? documentMetadataSync.SenderDepartment
        : ""
    );
    formData.append(
      "RecipientOrganization",
      documentMetadataSync.RecipientOrganization
        ? documentMetadataSync.RecipientOrganization
        : ""
    );
    formData.append(
      "RecipientDepartment",
      documentMetadataSync.RecipientDepartment
        ? documentMetadataSync.RecipientDepartment
        : ""
    );
    formData.append(
      "RecipientName",
      documentMetadataSync.RecipientName
        ? documentMetadataSync.RecipientName
        : ""
    );
    formData.append(
      "DATE",
      documentMetadataSync.DATE ? documentMetadataSync.DATE : ""
    );
    formData.append(
      "DocumentNumber",
      documentMetadataSync.DocumentNumber
        ? documentMetadataSync.DocumentNumber
        : ""
    );
    formData.append(
      "SUBJECT",
      documentMetadataSync.SUBJECT ? documentMetadataSync.SUBJECT : ""
    );
    formData.append(
      "CorrespondencePurpose",
      documentMetadataSync.CorrespondencePurpose
        ? documentMetadataSync.CorrespondencePurpose
        : ""
    );
    formData.append(
      "BaseType",
      documentMetadataSync.BaseType ? documentMetadataSync.BaseType : ""
    );
    formData.append(
      "ProjectCode",
      documentMetadataSync.ProjectCode ? documentMetadataSync.ProjectCode : ""
    );
    formData.append(
      "BudgetNumber",
      documentMetadataSync.BudgetNumber ? documentMetadataSync.BudgetNumber : ""
    );
    formData.append(
      "ContractNumber",
      documentMetadataSync.ContractNumber
        ? documentMetadataSync.ContractNumber
        : ""
    );
    formData.append(
      "CommitmentNumber",
      documentMetadataSync.CommitmentNumber
        ? documentMetadataSync.CommitmentNumber
        : ""
    );
    formData.append(
      "TenderNumber",
      documentMetadataSync.TenderNumber ? documentMetadataSync.TenderNumber : ""
    );
    formData.append(
      "Fax",
      documentMetadataSync.Fax ? documentMetadataSync.Fax : ""
    );

    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WFApiV1}${FCTSDashBoard.syncDoc}`,
      formData,
      { headers: { OTCSTICKET: CSConfig.AuthToken } }
    );
  }

  insertCorrNotes(notes: string): Observable<any> {
    const params = new HttpParams()
      .set("NoteText", notes)
      .set("prompting", "done");

    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.insertNotes}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getCorrWFTaskInfo(subworkId: string, taskId: string): Observable<any> {
    const params = new HttpParams()
      .set("subworkId", subworkId)
      .set("taskId", taskId);

    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.getWFTaskInfo}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getNotesText(notesID: string, volumeID: string): Observable<any> {
    const params = new HttpParams()
      .set("NotesID", notesID)
      .set("SubWorkID", volumeID);

    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.getNotes}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
  getRejectReasons(Condition: string): Observable<any> {
    const params = new HttpParams()
      .set("Condition", Condition)
      .set("fRejctReson", "true");

    return this.httpServices
      .get<any>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.SelectAttributes}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  setConnectionn(
    ConnectedID: string,
    ConnectionType: string,
    ReferenceType: string,
    ConnectedType: string,
    creatorID: string,
    Deleted: string
  ) {
    const params = new HttpParams()
      .set("ConnectedID", ConnectedID)
      .set("ConnectionType", ConnectionType)
      .set("ReferenceType", ReferenceType)
      .set("ConnectedType", ConnectedType)
      .set("creatorID", creatorID)
      .set("Deleted", Deleted);
    return this.httpServices
      .get<any>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.setConnection}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getCorrespondenceMetadataDetails(
    VolumeID: string
  ): Observable<CorrespondenceWFFormModel> {
    const params = new HttpParams().set("VolumeID", VolumeID);
    return this.httpServices
      .get<CorrespondenceWFFormModel>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.getCorrespondenceFormValues}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  setSubfolderPermission(corrDataDetail): Observable<any> {
    const params = new HttpParams()
      .set("locationid", corrDataDetail.locationid)
      .set("corrDataID", corrDataDetail.corrDataID)
      .set("CorrFlowType", corrDataDetail.CorrFlowType)
      .set("TaskID", corrDataDetail.TaskID)
      .set("UserID", CSConfig.globaluserid);

    return this.httpServices
      .get(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.setSubfolderPerm}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      )
      .pipe(
        map((data) => {
          // console.log('performer permission is set');
          return data;
        }),
        catchError((error) => {
          return error;
        })
      );
  }
  // For Demo
  getDocumentTranslateURL(docid): Observable<DocumentPreview[]> {
    const params = new HttpParams().set("coverdocumentid", docid);
    return this.httpServices.get<DocumentPreview[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.documentTranlsation}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
  getCopyFromContentServerURL(folderID): Observable<DocumentPreview[]> {
    const params = new HttpParams()
      .set("DestinationFolderID", folderID)
      .set("startFolderID", folderID);

    return this.httpServices.get<DocumentPreview[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.copyfromcsurl}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getFolderBrowse(folderID): Observable<any> {
    const params = new HttpParams().set("folderID", folderID);

    return this.httpServices.get<DocumentPreview[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.folderbrowserurl}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  LoadTemplateFilter(type: string): Observable<any> {
    const params = new HttpParams()
      .set("locationid", this._globalConstants.FCTS_StepConsole.TemplateFolder)
      .set("catid", this._globalConstants.FCTS_StepConsole.TemplateCategory)
      .set("attrname", type);
    return this.httpServices.get<TemplateModel[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FilterValuesSearch}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
  // TODO set model to get request

  getApproversData(
    approve: MultipleApproveInputData
  ): Observable<ApproversData[]> {
    const params = new HttpParams()
      .set("UserID", approve.UserID.toString())
      .set("CorrID", approve.CorrID)
      //.set('VolumeID', approve.VolumeID)
      .set("TeamID", approve.TeamID ? approve.TeamID.toString() : "")
      .set("mainLanguage", approve.mainLanguage)
      .set("fGetStructure", approve.fGetStructure.toString())
      .set("fGetTeamStructure", approve.fGetTeamStructure.toString())
      .set("fInitStep", approve.fInitStep.toString())
      .set("fChangeTeam", approve.fChangeTeam.toString());
    return this.httpServices.get<ApproversData[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ApproveData}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
  // TODO set model to get request
  MultiAppAutoFill(
    searchText: string,
    searchField: string,
    ParentVal: any
  ): Observable<ApproverDetails[]> {
    if (searchText.length >= 3) {
      const params = new HttpParams()
        .set("NameVal", searchText + "%")
        .set(searchField, "true");
      return this.httpServices.get<ApproverDetails[]>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MultiAppAutoFill}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params,
        }
      );
    }
    return EMPTY;
  }

  setMultiApprovers(
    approversArray: ApproversFormData[],
    LevelsList: string,
    approveData: MultipleApproveInputData
  ): Observable<any> {
    const isTeamStructure = approveData.TeamID > 0 ? true : false;
    let params = new HttpParams()
      .set("fSetApprovers", "true")
      .set("CorrID", approveData.CorrID)
      .set("UserID", approveData.UserID.toString())
      .set("Rows_count", approversArray.length.toString())
      .set("fTeamStructure", isTeamStructure.toString())
      .set("TeamID", approveData.TeamID ? approveData.TeamID.toString() : "")
      .set("LevelsList", LevelsList)
      .set("Format", "webreport");
    //params.append('ApproveLevel_', approversArray.length)
    for (let row = 0; row < approversArray.length; row++) {
      const element = approversArray[row];
      const keyObj = row + 1;
      let ApproverID;
      params = params.append(
        "ApproveLevel_" + keyObj,
        element.ApproveLevel.toString()
      );
      if (element.SkipSecretary || element.ApproveLevel === 1) {
        params = params.append("SkipSecretary_" + keyObj, "1");
      } else {
        params = params.append("SkipSecretary_" + keyObj, "0");
      }
      if (element.SkipSecretary) {
        ApproverID =
          element.ApproveLevel === 1
            ? element.ApproverID.ID
            : element.ApproverID;
      } else {
        ApproverID = null;
      }
      params = params.append("ApproverID_" + keyObj, ApproverID);
      params = params.append(
        "SecretaryGroupID_" + keyObj,
        element.SecretaryGroupID.toString()
      );
    }
    const options = {
      headers: new HttpHeaders().set("OTCSTICKET", CSConfig.AuthToken),
    };
    return this.httpServices
      .post<any>(
        this.CSUrl +
          `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.SetMultiApprovers}`,
        params,
        options
      )
      .pipe(
        map((data) => {
          return data;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  setApprover(
    CorrID: string,
    Level: number,
    ApproverID: number
  ): Observable<any> {
    const params = new HttpParams()
      .set("CorrID", CorrID)
      .set("ApproveLevel", Level.toString())
      .set("ApproverID", ApproverID.toString())
      .set("fChangeApprovers", "true");
    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.SetStatusMultiApprove}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  setIsDone(CorrID: string, approverData: ApproversFormData): Observable<any> {
    const params = new HttpParams()
      .set("CorrID", CorrID)
      //.set('VolumeID', approve.VolumeID)
      .set("ApproveLevel", approverData.ApproveLevel.toString())
      .set("fChangeStatus", "true");

    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.SetStatusMultiApprove}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getDistributionData(volumeID): Observable<any> {
    const params = new HttpParams()
      .set("volumeID", volumeID)
      .set("fDistrib", "true");
    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.DistributionSection}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  getDistributionUsers(
    DCID: string
  ): Observable<DistributionDetailsParameters[]> {
    const params = new HttpParams().set("DCID", DCID);
    return this.httpServices.get<DistributionDetailsParameters[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetDistributionUsers}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }

  createDistributionRequest(
    transferJson,
    correspondenceData: CorrespondenenceDetailsModel
  ): Observable<any> {
    let taskID: string;
    correspondenceData.CorrespondenceFlowType === "1"
      ? (taskID = "32")
      : (taskID = "3"); // for permission purpose
    const transferVal = JSON.stringify({ transferJson });
    const params = new HttpParams()
      .set("transferJson", transferVal)
      .set("volumeid", correspondenceData.VolumeID)
      .set("taskid", taskID)
      .set("CorrFlowType", correspondenceData.CorrFlowType)
      .set("locationid", correspondenceData.AttachCorrID)
      .set("parentID", correspondenceData.ID)
      .set("rows_count", transferJson.length)
      .set("onBehalfUserID", this._globalConstants.general.ProxyUserID);

    const options = {
      headers: new HttpHeaders().set("OTCSTICKET", CSConfig.AuthToken),
    };
    return this.httpServices.post<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.createTransfer}?Format=webreport`,
      params,
      options
    );
  }

  definePriorityToShow(width: number) {
    if (width < 480) {
      return 1;
    } else if (width < 600) {
      return 2;
    } else if (width < 768) {
      return 3;
    } else if (width < 900) {
      return 4;
    } else if (width < 1024) {
      return 5;
    } else {
      return 6;
    }
  }

  getTeams(VolumeID: string, qLive: boolean): Observable<any> {
    const params = new HttpParams()
      .set("VolumeID", VolumeID)
      .set("qLive", qLive.toString());
    return this.httpServices.get<any>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetTeams}?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken },
        params: params,
      }
    );
  }
}
