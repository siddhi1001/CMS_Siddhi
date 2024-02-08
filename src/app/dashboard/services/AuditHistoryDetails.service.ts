import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CorrResponse } from './correspondence-response.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FCTSDashBoard } from '../../../environments/environment';
import { Correspondence } from '../services/correspondence.model';

@Injectable({
    providedIn: 'root'
})
export class AuditHistoryDetailsService {
    private CSUrl: string = CSConfig.CSUrl;
    constructor(private httpServices: HttpClient) { }

    getTransferHistory(corrData: Correspondence): Observable<CorrResponse[]> {
        const params = new HttpParams()
            .set('volumeID', '' + corrData.VolumeID);
        return this.httpServices.get<CorrResponse[]>(
            this.CSUrl +
            `${FCTSDashBoard.WRApiV1}${
            FCTSDashBoard.TransferAuditReport
            }?Format=webreport`,
            {
                headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
            }
        );
    }
    getWorkflowAudit(corrData: Correspondence): Observable<CorrResponse[]> {
        const params = new HttpParams()
            .set('volumeid', '' + corrData.VolumeID);
        return this.httpServices.get<CorrResponse[]>(
            this.CSUrl +
            `${FCTSDashBoard.WRApiV1}${
            FCTSDashBoard.WfAuditReport
            }?Format=webreport`,
            {
                headers: { OTCSTICKET: CSConfig.AuthToken }, params: params
            }
        );
    }

}
