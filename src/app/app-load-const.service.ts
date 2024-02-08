import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { FCTSDashBoard } from '../environments/environment';

@Injectable()
export class AppLoadConstService {
  private _CSConstants: any;
  private _CSUrl: string = CSConfig.CSUrl;

    getConstants() {
      return this._CSConstants;
    }

    constructor( 
      private _httpServices: HttpClient) {
      
    }

    Init() {
      return new Promise<void>((resolve, reject) => {
        this.loadGlobalConstants()
        .subscribe(
          response => {
            this._CSConstants = response;
            this._CSConstants.FCTS_Dashboard.UserGroupsArray = this._CSConstants.FCTS_Dashboard.UserGroups.split(',');
            resolve();
          },
          error => {
            alert(`An error with loading global constants. `+ '\n' +
                    `Error Text - ` + error.statusText + '.\n' +
                    `Error - ` + error.error.error );
          }
        );
      });
    }

    loadGlobalConstants(): Observable<any> {
      const url = this._CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetGlobalConst}?Format=webreport`;
      const params = new HttpParams();
        return this._httpServices.get<any>( url, { headers: { OTCSTICKET: CSConfig.AuthToken }, params: params } );
      }

    setProxy(ProxyUserID: string) {
      this._CSConstants.general.ProxyUserID = ProxyUserID;
      this._CSConstants.general.ProxyUserID === this._CSConstants.general.UserID ? this._CSConstants.general.showMR = true : this._CSConstants.general.showMR = false;
    }

    setUserNameProxy(UserName: string) {
      this._CSConstants.general.UserName = UserName;
    }

    setUserGroupArray(userGroups: string) {
      this._CSConstants.FCTS_Dashboard.UserGroupsArray = userGroups.split(',');      
    }

}
