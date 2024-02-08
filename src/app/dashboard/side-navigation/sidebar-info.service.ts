import { Injectable } from '@angular/core';
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { FCTSDashBoard } from '../../../environments/environment';
import { OrgNameAutoFillModel, OrgNameAutoFillModelSimpleUser } from '../models/CorrespondenenceDetails.model';
import { DelegationReportRequest } from 'src/app/dashboard/side-navigation/sidebar-info.model';


@Injectable({
  providedIn: 'root'
})
export class SidebarInfoService {
  private CSUrl: string = CSConfig.CSUrl;
  constructor(private httpServices: HttpClient) { }


  getUsersInfo(): Observable<any> {
    const params = new HttpParams();
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ProxyInfo}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  getUserInfo(id: number): Observable<any> {
    const params = new HttpParams();
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WFApiV2}members/${id}`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  getUserGroups(ID: number, SpecGroupType: string): Observable<any> {
    const params = new HttpParams()
    .set('KuafID', ID.toString())
    .set('SpecGroupType', SpecGroupType);
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.UserGroups}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  getUserImg(id: number): Observable<any> {
    const params = new HttpParams();
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WFApiV1}members/${id}/photo`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params,
          responseType: 'blob'
        },
      ).pipe (
        map (data => {
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  createDelegationRequest(finalRequest: any, section: string): Observable<any> {
    const params = new HttpParams()
    .set('recCreatorID', finalRequest.creatorID)
    .set('recUserID', finalRequest.userID)

    .set('recDelegatee', finalRequest.active_delegatee)
    .set('recAllUsers', finalRequest.delegatees)

    .set('recStartDateTime', finalRequest.delegation_start_date)
    .set('recEndDateTime', finalRequest.delegation_end_date)

    .set(section , 'true');

    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AddDelegation}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  activateDelegation(): Observable<any> {
    const params = new HttpParams();
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.DelegationsActivator}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  searchFieldForAutoFill(searchText: string, searchField: string, ParentVal: any): Observable<OrgNameAutoFillModelSimpleUser[]> {
    // let searchResults: Observable<OrgNameAutoFillModel[]>;
    if (searchText.length >= 3) {
      const params = new HttpParams()
        .set('NameVal',  searchText + '%')
        .set(searchField, 'true');
      return this.httpServices.get<OrgNameAutoFillModelSimpleUser[]>(
        this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.searchFieldautoFill}?Format=webreport`,
        {
          headers: { OTCSTICKET: CSConfig.AuthToken },
          params: params
        }
      );

    }
    return EMPTY;
  }

  getUserDelegationInfo(ID: string, section: string): Observable<any> {
    const params = new HttpParams()
    .set('recUserID', ID)
    .set('singleProxy', 'true')
    .set( section , 'true');
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.CurrentDelegations}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  deleteDelegation(ID: string): Observable<any> {
    const params = new HttpParams()
    .set('select', 'true')
    .set('recDelegationID', ID);
    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.DelegationsInactivator}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }

  getDelegationReport(finalRequest: DelegationReportRequest, section: string): Observable<any> {
    const params = new HttpParams()
    .set( 'recUserID', finalRequest.recUserID )
    .set( section , 'true')
    .set('proxyUser', finalRequest.proxyUser)
    .set('checkProxy', finalRequest.proxyUser ? 'true' : 'false')
    .set('startData', finalRequest.startDate)
    .set('checkStartDate', finalRequest.startDate ? 'true' : 'false')
    .set( 'endDate' , finalRequest.endDate)
    .set( 'checkEndDate' , finalRequest.endDate ? 'true' : 'false');

    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.DelegationsReport}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
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
  }
}
