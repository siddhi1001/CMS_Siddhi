import { Injectable } from '@angular/core';
import { Observable, throwError, EMPTY, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FCTSDashBoard } from 'src/environments/environment';
import { AppLoadConstService } from 'src/app/app-load-const.service';
import { UsersAutocompleteModel, CurrentDelegationModel,DelegationReportRequest, DelegationsReportModel,OrgNameAutoFillModelSimpleUser } from '../models/delegation.model';

@Injectable({
  providedIn: 'root'
})
export class DelegationService {
  private CSUrl: string = CSConfig.CSUrl;
  private _globalConstants = this.appLoadConstService.getConstants();

  constructor(
    private httpServices: HttpClient,
    public appLoadConstService: AppLoadConstService) { }

  delegationUsersAutoCmpl(value: string): Observable<UsersAutocompleteModel[]> {
    if (value && value.length >= 3) {
      const params = new HttpParams()
        .set('NameVal', value);
      return this.httpServices.get<UsersAutocompleteModel[]>(
        this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminDelegationUsers}?Format=webreport`,
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
    return EMPTY;
  }

  createDelegationRequest(finalRequest: any): Observable<any> {
    const params = new HttpParams()
      .set('recCreatorID', this._globalConstants.general.UserID)
      .set('recUserID', finalRequest.userID)

      .set('recDelegatee', finalRequest.active_delegatee)
      .set('recAllUsers', finalRequest.delegatees)

      .set('recStartDateTime', finalRequest.delegation_start_date)
      .set('recEndDateTime', finalRequest.delegation_end_date);

    return this.httpServices
      .get(this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminAddDelegationGroup}?Format=webreport`,
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

  activateDelegation(): Observable<any> {
    const params = new HttpParams()
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminSectDelegationsActivator}`,
      params, options);
  }

  getCurrentDelegations(): Observable<CurrentDelegationModel[]> {
    const params = new HttpParams()
      .set('recUserID', this._globalConstants.general.UserID)
      .set('singleProxy', 'true');
    return this.httpServices.get<CurrentDelegationModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminCurrentDelegations}?Format=webreport`,
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

  searchFieldForAutoFill(searchText: string, searchField: string, ParentVal: any): Observable<OrgNameAutoFillModelSimpleUser[]> {
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

  deleteDelegation(id: number): Observable<any> {
    const params = new HttpParams()
      .set('recDelegationID', id.toString())
      .set('select', 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminSingleDelegationsInactivator}`,
      params, options);
  }


  // DelegationsReport(obj): Observable<DelegationsReportModel[]> {
  //   const params = new HttpParams()
  //     .set('recUserID', obj.delegator)
  //     .set('checkDeledator', obj.delegator ? 'true' : '')
  //     .set('proxyUser', obj.proxy)
  //     .set('checkProxy', obj.proxy ? 'true' : '')
  //     .set('startData', obj.startDate)
  //     .set('checkStartDate', obj.startDate ? 'true' : '')
  //     .set('endDate', obj.endDate)
  //     .set('checkEndDate', obj.endDate ? 'true' : '');
  //   return this.httpServices.get<DelegationsReportModel[]>(
  //     this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminDelegationsReport}?Format=webreport`,
  //     {
  //       headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
  //     }
  //   ).pipe(
  //     map(data => {
  //       return data;
  //     }),
  //     catchError(error => {
  //       return throwError(error);
  //     })
  //   );
  // }

  getDelegationReport(finalRequest: DelegationReportRequest): Observable<any> {
    const params = new HttpParams()

    .set( 'recUserID', finalRequest.recUserID )
    .set('checkDeledator', finalRequest.recUserID ? 'true':'false')
    .set('proxyUser', finalRequest.proxyUser)
    .set('checkProxy', finalRequest.proxyUser ? 'true' : 'false')
    .set('startDate', finalRequest.startDate)
    .set('checkStartDate', finalRequest.startDate ? 'true' : 'false')
    .set( 'endDate' , finalRequest.endDate)
    .set( 'checkEndDate' , finalRequest.endDate ? 'true' : 'false');

    return this.httpServices
      .get(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminDelegationsReport}?Format=webreport`,
        { headers:
          { OTCSTICKET: CSConfig.AuthToken },
          params: params
        }
      )
      .pipe (
        map (data => {
          console.log(data);
          return data;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

}
