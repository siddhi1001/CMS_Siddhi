import { Injectable } from "@angular/core";
import { Observable, throwError, EMPTY, BehaviorSubject } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { FCTSDashBoard } from "src/environments/environment";
import { AppLoadConstService } from "src/app/app-load-const.service";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private CSUrl: string = CSConfig.CSUrl;
  private _globalConstants = this.appLoadConstService.getConstants();

  constructor(
    private httpServices: HttpClient,
    public appLoadConstService: AppLoadConstService
  ) {}

  // GeneralInboundReport(obj): Observable<DelegationsReportModel[]> {
  //   const params = new HttpParams()
  //     .set("recUserID", obj.delegator)
  //     .set("checkDeledator", obj.delegator ? "true" : "")
  //     .set("proxyUser", obj.proxy)
  //     .set("checkProxy", obj.proxy ? "true" : "")
  //     .set("startData", obj.startDate)
  //     .set("checkStartDate", obj.startDate ? "true" : "")
  //     .set("endDate", obj.endDate)
  //     .set("checkEndDate", obj.endDate ? "true" : "");
  //   return this.httpServices
  //     .get<DelegationsReportModel[]>(
  //       this.CSUrl +
  //         `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminDelegationsReport}?Format=webreport`,
  //       {
  //         headers: { OTCSTICKET: CSConfig.AuthToken },
  //         params: params,
  //       }
  //     )
  //     .pipe(
  //       map((data) => {
  //         return data;
  //       }),
  //       catchError((error) => {
  //         return throwError(error);
  //       })
  //     );
  // }
}
