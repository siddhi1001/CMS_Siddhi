import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

import { FCTSDashBoard } from '../../../environments/environment';
import { TransferRecallDialogData, RecallTransferInfo } from '../dialog-boxes/transfer-recall-dialog/transfer-recall-dialog.model';
import { AppLoadConstService } from '../../app-load-const.service';

@Injectable({
  providedIn: 'root'
})

export class TransferRecallService {
  private CSUrl: string = CSConfig.CSUrl;
  private _globalConstants = this.appLoadConstService.getConstants();

  constructor(
    private _httpServices: HttpClient,
    private appLoadConstService: AppLoadConstService
  ) { }

  getTransRecallData(recallTransferInfo: RecallTransferInfo): Observable<TransferRecallDialogData[]> {
    const url = this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.GetTransRecallData}?Format=webreport`;
    const params = new HttpParams()
      .set( 'VolumeID', recallTransferInfo.correspondData.VolumeID.toString() )
      .set( 'TransferUserID', this._globalConstants.general.ProxyUserID )
      .set( 'PowerGroupID', this._globalConstants.FCTS_Dashboard.PowerGroupID )
      .set( 'ASAGroupID', this._globalConstants.FCTS_Dashboard.FCTS_ASA )
      .set( 'f' + recallTransferInfo.recallType, 'true' );

    const headers = new HttpHeaders()
      .set( 'OTCSTICKET', CSConfig.AuthToken );

    return this._httpServices
      .get<TransferRecallDialogData[]>( url, { headers: headers, params: params } )
      .pipe (
        map (response => {
          return this._transformRecallList(response);
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  runRecallTransfer(recallTransferInfo: RecallTransferInfo): Observable<any> {
    const url = this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.RunTransferRecall}?Format=webreport`;
    const params = new HttpParams()
      .set( 'VolumeID', recallTransferInfo.correspondData.VolumeID.toString() )
      .set( 'IDs', recallTransferInfo.selectedIDs )
      .set( 'f' + recallTransferInfo.recallType, 'true' );

    const headers = new HttpHeaders()
      .set( 'OTCSTICKET', CSConfig.AuthToken );

    return this._httpServices
      .get<TransferRecallDialogData[]>( url, { headers: headers, params: params } )
      .pipe (
        map (response => {
          return response;
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

  private _transformRecallList(recallList: TransferRecallDialogData[]): TransferRecallDialogData[] {
    for ( let i = 0; i < recallList.length; i++) {
      recallList[i].WasOpened === 1 && recallList[i].Status === 0 ? recallList[i].ShowOpened = true : recallList[i].ShowOpened = false;
      if ( recallList[i].Status === 0 && ( recallList[i].WasOpened === 0 || recallList[i].isPowerUser === 1 ) ) {
        recallList[i].ShowChb = true;
       // } else if ( recallList.isMemberMRRecall && recallList[i].Status < 2 ) {  /* && lvl2 == 'navEIMRAc' */
       // recallList[i].ShowChb = true;
       } else {
        recallList[i].ShowChb = false;
       }
    }
    return recallList;
  }

}
