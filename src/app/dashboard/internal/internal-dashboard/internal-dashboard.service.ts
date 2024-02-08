import { Injectable } from "@angular/core";
import { DashboardModel } from "../../dashboard.model";
import { HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FCTSDashBoard } from "../../../../environments/environment";

@Injectable({
  providedIn: "root" // <- ADD THIS
})
export class ExternalDashboardService {
  CSUrl: String = CSConfig.CSUrl;
  constructor(private httpServices: HttpClient) {}
  public dashboard: Observable<any[]>;

  getExternalInbNew(): Observable<DashboardModel[]> {
    this.dashboard = this.httpServices.get<any[]>(
      this.CSUrl +
        `${FCTSDashBoard.WRApiV1}${
          FCTSDashBoard.ExternalInbNew
        }?Format=webreport`,
      {
        headers: { OTCSTICKET: CSConfig.AuthToken }
      }
    );

    return this.dashboard;
  }

  getUserData(): Observable<any[]> {
    return this.httpServices.get<any[]>("../../assets/Data/userdata.json");
    // return this.httpServices.get<any[]>()
    // return this.httpServices.get<any[]>(this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.getUserData}?Format=webreport`, {
    //     headers: { 'OTCSTICKET': CSConfig.AuthToken }
    // });
  }
}
