import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { FCTSDashBoard } from 'src/environments/environment';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { ISimpleDataModel, IPurposeModel, IPriorityModel, IMDFilingPlanModel, IRejectReasons } from '../models/metadata.model';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  constructor(
    private httpServices: HttpClient,
    public appLoadConstService: AppLoadConstService
  ) { }
  private CSUrl: string = CSConfig.CSUrl;
  private _globalConstants = this.appLoadConstService.getConstants();

  canChange(obj): Observable<any> {
    const params = new HttpParams()
      .set('ObjectID', obj.objectID)
      .set('FIELD1', obj.field1)
      .set('FIELD2', obj.field2)
      .set('FIELD3', obj.field3)
      .set('FIELD4', obj.field4)
      .set('csvIDS', obj.csvIDS)
      .set(obj.templateName, 'true');
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ObjectInUse}?Format=webreport`,
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

  getBaseTypes(): Observable<ISimpleDataModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<ISimpleDataModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDBaseTypes}?Format=webreport`,
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

  saveBaseType(element: ISimpleDataModel, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID.toString())
      .set('recBaseType', element.Name_EN)
      .set('recBaseTypeArabic', element.Name_AR)
      .set('reportType', 'BaseType')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getCorrTypes(): Observable<ISimpleDataModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<ISimpleDataModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDCorrespondenceTypes}?Format=webreport`,
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

  saveCorrType(element: ISimpleDataModel, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID.toString())
      .set('recCorrespondenceType', element.Name_EN)
      .set('recCorrespondenceTypeArabic', element.Name_AR)
      .set('reportType', 'CorrespondenceType')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getDocumentTypes(): Observable<ISimpleDataModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<ISimpleDataModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDDocumentTypes}?Format=webreport`,
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

  saveDocumentType(element: ISimpleDataModel, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID.toString())
      .set('recDocumentType', element.Name_EN)
      .set('recDocumentTypeArabic', element.Name_AR)
      .set('reportType', 'DocumentType')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getDispatchMethods(): Observable<ISimpleDataModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<ISimpleDataModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDDispatchMethods}?Format=webreport`,
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

  saveDispatchMethod(element: ISimpleDataModel, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID.toString())
      .set('recDispatchMethod', element.Name_EN)
      .set('recDispatchMethodArabic', element.Name_AR)
      .set('reportType', 'DispatchMethod')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getPurposes(): Observable<IPurposeModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<IPurposeModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDPurposes}?Format=webreport`,
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

  getPhaseList(): Observable<any> {
    const params = new HttpParams();
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDPhaseList}?Format=webreport`,
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

  savePurpose(element: IPurposeModel, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.PurposeID.toString())
      .set('recPurpose', element.Purpose_EN)
      .set('recPurposeArabic', element.Purpose_AR)
      .set('recPhaseID', element.PhaseID.toString())
      .set('reportType', 'Purpose')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getPriority(): Observable<IPriorityModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<IPriorityModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDPriority}?Format=webreport`,
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

  savePriority(element: IPriorityModel, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.PriorityID.toString())
      .set('recPriority', element.Priority_EN)
      .set('recPriorityArabic', element.Priority_AR)
      .set('recNumberOfDays', element.NumberOfDays.toString())
      .set('reportType', 'Priority')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getReasons(): Observable<IRejectReasons[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<IRejectReasons[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDRejectReasons}?Format=webreport`,
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

  saveReason(element: IRejectReasons, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.RejectReasonID.toString())
      .set('recRejectReason', element.RejectReason_EN)
      .set('recRejectReasonArabic', element.RejectReason_AR)
      .set('recPhaseID', element.PhaseID.toString())
      .set('reportType', 'RejectReasons')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getYear(): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDYear}?Format=webreport`,
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

  setYear(element, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID)
      .set('recYear', element.Name_EN)
      .set('recYearArabic', element.Name_AR)
      .set('recYearIsFull', element.IsFull)
      .set('reportType', 'Year')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getYearList(id: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams();
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDYearList}?Format=webreport`,
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

  getLocationList(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recYearID', ID);
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDPhysicalLocationList}?Format=webreport`,
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

  getLocation(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recYearID', ID)
      .set('select', 'true');
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDPhysicalLocation}?Format=webreport`,
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

  setLocation(element, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID)
      .set('recPhysicalLocation', element.Name_EN)
      .set('recPhysicalLocationArabic', element.Name_AR)
      .set('recPhysicalLocationIsFull', element.IsFull)
      .set('recYearID', element.ParentID || '')
      .set('reportType', 'PhysicalLocation')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getCabinetList(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recPhysicalLocationID', ID);
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDCabinetList}?Format=webreport`,
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

  getCabinet(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recPhysicalLocationID', ID)
      .set('select', 'true');
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDCabinet}?Format=webreport`,
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

  setCabinet(element, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID)
      .set('recCabinet', element.Name_EN)
      .set('recCabinetArabic', element.Name_AR)
      .set('recCabinetIsFull', element.IsFull)
      .set('recPhysicalLocationID', element.ParentID || '')
      .set('reportType', 'Cabinet')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getRowList(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recCabinetID', ID);
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDRowList}?Format=webreport`,
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

  getRow(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recCabinetID', ID)
      .set('select', 'true');
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDRowList}?Format=webreport`,
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

  setRow(element, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID)
      .set('recRow', element.Name_EN)
      .set('recRowArabic', element.Name_AR)
      .set('recRowIsFull', element.IsFull)
      .set('recCabinetID', element.ParentID || '')
      .set('reportType', 'Row')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getShelfList(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recRowID', ID);
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDShelfList}?Format=webreport`,
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

  getShelf(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recRowID', ID)
      .set('select', 'true');
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDShelf}?Format=webreport`,
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

  setShelf(element, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID)
      .set('recShelf', element.Name_EN)
      .set('recShelfArabic', element.Name_AR)
      .set('recShelfIsFull', element.IsFull)
      .set('recRowID', element.ParentID || '')
      .set('reportType', 'Shelf')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }

  getFile(ID: string): Observable<IMDFilingPlanModel[]> {
    const params = new HttpParams()
      .set('recShelfID', ID)
      .set('select', 'true');
    return this.httpServices.get<IMDFilingPlanModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDFile}?Format=webreport`,
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

  setFile(element, action: string): Observable<any> {
    const params = new HttpParams()
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('OUTID', element.ID)
      .set('recFile', element.Name_EN)
      .set('recFileArabic', element.Name_AR)
      .set('recFileIsFull', element.IsFull)
      .set('recShelfID', element.ParentID || '')
      .set('reportType', 'File')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.MDActions}`,
      params, options);
  }
}
