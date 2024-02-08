import { Injectable, } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { FCTSDashBoard } from '../../../environments/environment';
import { map, catchError } from 'rxjs/operators'; /* added 24/06/2019 */

@Injectable({
    providedIn: 'root'
})
export class CSDocumentUploadService {


    private CSUrl: string = CSConfig.CSUrl;
    constructor(
        private httpServices: HttpClient
    ) { }



    uploadDocument(files: File[], parentID: string): Observable<any> {        
        var formData = new FormData();
        Array.from(files).forEach(f => {
            var inputBody = new UploadParameterModel();
            inputBody.name = f.name;
            inputBody.type = "144";
            inputBody.parent_id = parentID;
            formData.append('file', f);
            formData.append('body', JSON.stringify(inputBody))
        })
        return this.httpServices.post(this.CSUrl + `${FCTSDashBoard.WFApiV2}nodes`,
            formData, { reportProgress: true, observe: 'events', headers: { OTCSTICKET: CSConfig.AuthToken } });
    }

    dragandDropUpload(file: File, parentID: string): Observable<any> {
        var formData = new FormData();

        var inputBody = new UploadParameterModel();
        inputBody.name = file.name;
        inputBody.type = "144";
        inputBody.parent_id = parentID;
        formData.append('file', file);
        formData.append('body', JSON.stringify(inputBody))
        return this.httpServices.post(this.CSUrl + `${FCTSDashBoard.WFApiV2}nodes`,
            formData, { reportProgress: true, observe: 'events', headers: { OTCSTICKET: CSConfig.AuthToken } });
    }


    deleteDocument(documentDataid: string): any {
        var formData = new FormData();
        return this.httpServices.delete(this.CSUrl + `${FCTSDashBoard.WFApiV2}nodes` + '/' + documentDataid,
            { headers: { OTCSTICKET: CSConfig.AuthToken } })
            .pipe(
                map(data => {
                    return data;
                }),
                catchError(error => {
                    return throwError(error);
                })
            );
    }

    copyDocToCoverFolder(sourceDocumentDataid: string, destinationDataID: number, newFileName: string): Observable<any> {

        const body = new HttpParams()
      .set('body', `{"original_id":${sourceDocumentDataid},"parent_id":${destinationDataID.toString()},"name":"${newFileName}","roles":{"categories":{}}}`);
    return this.httpServices.post<any>(this.CSUrl + `${FCTSDashBoard.WFApiV1}nodes`,
      body, {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }).pipe(
      map(data => {
        return data;
      }),
      catchError(error => {
        return throwError(error);
      })
    );            
    }

    uploadDocumentVersion(files: File[], documentID: string): Observable<any> {
        var formData = new FormData();
        Array.from(files).forEach(f => {    
            formData.append('file', f);
        });
        return this.httpServices.post(this.CSUrl + `${FCTSDashBoard.WFApiV2}nodes/` + documentID + `/versions`,
            formData, { headers: { OTCSTICKET: CSConfig.AuthToken } });

    }
}
export class UploadParameterModel {
    name: string;
    type: string;
    parent_id: string;
    id: string;
}