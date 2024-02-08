import { Injectable } from '@angular/core';
import { Observable, throwError, EMPTY, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FCTSDashBoard } from 'src/environments/environment';
import {
  RolesData, UsersData, PaginationParameters, DepFilterData, OrgStructure, UserRolesModel,
  SpecRolesOrgStructure, SpecRolesEmployees, CommonRoleModel
} from '../administration.model';
import { UnitDefinitionModel, EntityRelationModel } from '../models/orgmd.model';
import { AppLoadConstService } from 'src/app/app-load-const.service';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  private CSUrl: string = CSConfig.CSUrl;
  private _globalConstants = this.appLoadConstService.getConstants();

  public mainPageStr = new BehaviorSubject(new Array());
  mainPageStrArr = this.mainPageStr.asObservable();

  public breadcrumbList = new BehaviorSubject([]);
  currentBreadcrumbList = this.breadcrumbList.asObservable();

  private secExp = new BehaviorSubject('');
  currentSecExp = this.secExp.asObservable();


  constructor(
    private httpServices: HttpClient,
    public appLoadConstService: AppLoadConstService
  ) { }

  changebreadcrumbList(br: any[]) {
    this.breadcrumbList.next(br);
  }

  changeSecExp(sec: string) {
    this.secExp.next(sec);
  }

  changeMPageStr(Arr: any) {
    this.mainPageStr.next(Arr);
  }

  getAdminPageStructure(): Observable<any> {
    const params = new HttpParams();
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.AdminPageStructure}?Format=webreport`,
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

  orgmdRoleAllUsers(searchParameters: any, startRow: number, endRow: number): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', startRow.toString())
      .set('EndRow', endRow.toString())
      .set('ItemID', searchParameters.itemID);
    if (searchParameters.action && searchParameters.action === 'search') {
      params = params.append('SearchStr', searchParameters.searchString);
      params = params.append('DepID', searchParameters.department);
      params = params.append(searchParameters.action, 'true');
    }
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDRoleAllUsers}?Format=webreport`,
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

  ecmdRoleAllUsers(searchParameters: any, startRow: number, endRow: number): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', startRow.toString())
      .set('EndRow', endRow.toString())
      .set('ItemID', searchParameters.itemID);
    if (searchParameters.action && searchParameters.action === 'search') {
      params = params.append('SearchStr', searchParameters.searchString);
      params = params.append('DepID', searchParameters.department);
      params = params.append(searchParameters.action, 'true');
    }
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ECMDRoleAllUsers}?Format=webreport`,
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

  orgmdOrgUnitUsers(itemID: string, actionParameters: any, pageParameters: PaginationParameters): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', pageParameters.startRow.toString())
      .set('EndRow', pageParameters.endRow.toString())
      .set('GRID', itemID)
      .set('rowCount', pageParameters.startRow === 1 ? 'true' : 'false');
    if (actionParameters.action) {
      params = params.append('FullSearchStr', actionParameters.fullSearchStr ? actionParameters.fullSearchStr : '');
      params = params.append('FirstName', actionParameters.name ? actionParameters.name : '');
      params = params.append('LastName', actionParameters.surname ? actionParameters.surname : '');
      params = params.append('Login', actionParameters.login ? actionParameters.login : '');
      params = params.append(actionParameters.action, 'true');
    }
    return this.httpServices.get<UsersData[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgUnitUsers}?Format=webreport`,
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

  orgmdOrgUnitUserActions(itemID: string, action: string, usersList: string[]): Observable<any> {
    let params = new HttpParams()
      .set('GRID', itemID)
      .set('UserIDs', usersList.toString())
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgUnitUsersActions}`,
      params, options);
  }

  orgmdOrgUnitAllUsers(searchParameters: any, startRow: number, endRow: number): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', startRow.toString())
      .set('EndRow', endRow.toString())
      .set('ItemID', searchParameters.itemID);
    if (searchParameters.action && searchParameters.action === 'search') {
      params = params.append('SearchStr', searchParameters.searchString);
      params = params.append('DepID', searchParameters.department);
      params = params.append(searchParameters.action, 'true');
    }
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgUnitAllUsers}?Format=webreport`,
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

  getDepartmentsList(searchText: string): Observable<DepFilterData[]> {
    if (searchText && searchText.length >= 3) {
      const params = new HttpParams()
        .set('NameVal', '%' + searchText + '%');
      return this.httpServices.get<any>(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.DepartmentsList}?Format=webreport`,
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

  orgChartData(): Observable<any> {   // make a model
    let params = new HttpParams()
      .set('UNITS_SHORT', 'true');
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChart}?Format=webreport`,
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

  orgChartEmplDetail(OUID): Observable<any> {   // make a model
    let params = new HttpParams()
      .set('EMP_SHORT', 'true')
      .set('ObjectIDList', OUID);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChartUsers}?Format=webreport`,
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

  orgChartSearch(searchStr: string): Observable<any> {   // make a model
    let params = new HttpParams()
      .set('ALL_DATASEARCH_SHORT', 'true')
      .set('SearchUsers', searchStr);
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChartSearch}?Format=webreport`,
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

  orgUnitsActions(): Observable<UnitDefinitionModel[]> {
    let params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<UnitDefinitionModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDUnitDefinition}?Format=webreport`,
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

  entityRelationsActions(): Observable<EntityRelationModel[]> {
    const params = new HttpParams()
      .set('select', 'true');
    return this.httpServices.get<EntityRelationModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDStrEntityRelations}?Format=webreport`,
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

  saveOrgUnit(action: string, element: OrgStructure) {
    let params = new HttpParams()
      .set('OUID', element.OUID ? element.OUID.toString() : '')
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('ParentID', element.Parent ? element.Parent.toString() : '')
      .set('Code', element.Code ? element.Code : '')
      .set('recName', element.Name_EN ? element.Name_EN : '')
      .set('ShortName', element.ShortName_EN ? element.ShortName_EN : '')
      .set('recDescription', element.Description_EN ? element.Description_EN : '')
      .set('recNameArabic', element.Name_AR ? element.Name_AR : '')
      .set('ShortNameArabic', element.ShortName_AR ? element.ShortName_AR : '')
      .set('recDescriptionArabic', element.Description_AR ? element.Description_AR : '')
      .set('linkType', element.LTID ? element.LTID.toString() : '')
      .set('ouType', element.OUTID ? element.OUTID.toString() : '')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDEditOrganizationalChart}`,
      params, options);
  }


  canChange(tableName, objectID, field1, field2, field3, field4, csvIDS): Observable<any> {
    let params = new HttpParams()
      .set('ObjectID', objectID)
      .set('FIELD1', field1)
      .set('FIELD2', field2)
      .set('FIELD3', field3)
      .set('FIELD4', field4)
      .set('csvIDS', csvIDS)
      .set(tableName, 'true');
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

  orgChartRolesAutoCmpl(searchText: string, OUIDArr: number[]): Observable<UserRolesModel[]> {
    if (searchText && searchText.length >= 3) {
      let params = new HttpParams()
        .set('ObjectIDList', OUIDArr.toString())
        .set('SearchStr', searchText)
        .set('UnitRoles', 'true');
      return this.httpServices.get<UserRolesModel[]>(
        this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChartRolesAutocmpl}?Format=webreport`,
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

  getUserRoles(EID: number): Observable<UserRolesModel[]> {
    const params = new HttpParams()
      .set('ObjectID', EID.toString())
      .set('EmployeeRoles', 'true');
    return this.httpServices.get<UserRolesModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChartUserRoles}?Format=webreport`,
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



  saveUserDetails(userDetails, rolesArr: number[]): Observable<any> {
    let params = new HttpParams()
      .set('EID', userDetails.EID)
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('PersonalEmail', userDetails.PersonalEmail)
      .set('PersonalEmail2', userDetails.PersonalEmail2)
      .set('PersonalEmail3', userDetails.PersonalEmail3)
      .set('PersonalEmail4', userDetails.PersonalEmail4)
      .set('PersonalEmail5', userDetails.PersonalEmail5)
      .set('Name_AR', userDetails.EName_AR)
      .set('LastName_AR', userDetails.LastName_AR)
      .set('MiddleName_AR', userDetails.MiddleName_AR)
      .set('FirstName_AR', userDetails.FirstName_AR)
      .set('Title_AR', userDetails.Title_AR)
      .set('Coev_Code', userDetails.Code)
      .set('MainRoleID', userDetails.Role.RID ? userDetails.Role.RID : '')
      .set('EmpRoleIDS', rolesArr.toString())
      .set('updateEmployee', 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDEditOrganizationalChart}`,
      params, options);
  }

  getOrgChartRoles(srchParams: any, itemID: string, pageParameters: PaginationParameters): Observable<UserRolesModel[]> {
    let params = new HttpParams()
      .set('StartRow', pageParameters.startRow.toString())
      .set('EndRow', pageParameters.endRow.toString())
      .set('ObjectID', itemID)
      .set('SearchStr', srchParams.fullSerch ? srchParams.fullSerch : '')
      .set('roleName', srchParams.name ? srchParams.name : '')
      .set('roleDescription', srchParams.description ? srchParams.description : '')
      .set('UnitRoles', 'true')
      .set('rowCount', pageParameters.startRow === 1 ? 'true' : 'false');
    if (srchParams.action) {
      params = params.append(srchParams.action, 'true');
    }

    return this.httpServices.get<UserRolesModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChartRoles}?Format=webreport`,
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

  orgChartRoleAction(action: string, itemID: string, roleDetails?: UserRolesModel) {
    let params = new HttpParams()
      .set('ObjectID', itemID)
      .set('RID', roleDetails.RID ? roleDetails.RID.toString() : '')
      .set('CreatorID', this._globalConstants.general.UserID)
      .set('roleName', roleDetails.Name_EN ? roleDetails.Name_EN : '')
      .set('roleNameArabic', roleDetails.Name_AR ? roleDetails.Name_AR : '')
      .set('roleShortName', roleDetails.ShortName_EN ? roleDetails.ShortName_EN : '')
      .set('roleShortNameArabic', roleDetails.ShortName_AR ? roleDetails.ShortName_AR : '')
      .set('roleDescription', roleDetails.Description_EN ? roleDetails.Description_EN : '')
      .set('roleDescriptionArabic', roleDetails.Description_AR ? roleDetails.Description_AR : '')
      .set(action, 'true')
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDOrgChartRoles}`,
      params, options);

  }

  getSpecificRoleUnits(roleCode: string): Observable<SpecRolesOrgStructure[]> {
    let params = new HttpParams()
      .set('recRoleCode', roleCode)
      .set('UNITS', 'true');
    return this.httpServices.get<SpecRolesOrgStructure[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSSpecificRole}?Format=webreport`,
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

  getSpecificRoleChartUsers(roleCode: string, OUID: number): Observable<any> {
    let params = new HttpParams()
      .set('recRoleCode', roleCode)
      .set('OUID', OUID.toString())
      .set('USERS', 'true');
    return this.httpServices.get<UserRolesModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSSpecificRoleTreeUsers}?Format=webreport`,
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

  searchSpecificRoleChartUsers(roleCode: string, searchStr: string): Observable<SpecRolesEmployees[]> {
    let params = new HttpParams()
      .set('recRoleCode', roleCode)
      .set('SearchStr', searchStr)
      .set('SEARCH_USERS', 'true');
    return this.httpServices.get<SpecRolesEmployees[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSSpecificRoleTreeUsers}?Format=webreport`,
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

  getSpecificRolesCurrentUsers(OUID: string, roleCode: string, actionParameters: any, pagParams: PaginationParameters) {
    let params = new HttpParams()
      .set('StartRow', pagParams.startRow.toString())
      .set('EndRow', pagParams.endRow.toString())
      .set('recRoleCode', roleCode)
      .set('GRID', OUID)
      /* .set('groupmembers', 'true') */
      .set('rowCount', pagParams.startRow === 1 ? 'true' : 'false');
    if (actionParameters.action) {
      params = params.append('FullSearchStr', actionParameters.fullSearchStr ? actionParameters.fullSearchStr : '');
      params = params.append('FirstName', actionParameters.name ? actionParameters.name : '');
      params = params.append('LastName', actionParameters.surname ? actionParameters.surname : '');
      params = params.append('Login', actionParameters.login ? actionParameters.login : '');
      params = params.append('DepID', actionParameters.department);
      params = params.append(actionParameters.action, 'true');
    }

    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSSpecificRoleUsers}?Format=webreport`,
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

  fctsRolesUserActions(GRID: string, action: string, usersList: string[]): Observable<any> {
    let params = new HttpParams()
      .set('Operation', action)
      .set('UserIDs', usersList.toString())
      .set('GRID', GRID)
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSRolesOperations}`,
      params, options);
  }

  getSpecificRolesAllUsers(searchParameters, inputData, startRow: number, endRow: number): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', startRow.toString())
      .set('EndRow', endRow.toString())
      .set('GRID', this._globalConstants.FCTS_Dashboard.FCTS_SU)
      .set('recRoleCode', inputData.roleCode)
      .set('OUID', inputData.OUID);
    if (searchParameters.search) {
      params = params.append('SearchStr', searchParameters.searchString);
      params = params.append('DepID', searchParameters.department);
      params = params.append('search', 'true');
    }
    return this.httpServices.get<UsersData[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSSpecificRoleAllUsers}?Format=webreport`,
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

  specificRolesCreateGroups(orgUnitIDs: number[], action: string, roleCode: string): Observable<any> {
    let params = new HttpParams()
      .set('Operation', action)
      .set('RoleCode', roleCode)
      .set('ORGMDOrgUnitIDs', orgUnitIDs.toString())
      .set('format', 'webreport');
    const options = {
      headers: new HttpHeaders()
        .set('OTCSTICKET', CSConfig.AuthToken)
    };
    return this.httpServices.post(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSRolesOperations}`,
      params, options);
  }

  getCommonRoles(): Observable<CommonRoleModel[]> {
    const params = new HttpParams();
    return this.httpServices.get<CommonRoleModel[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSCommonRoles}?Format=webreport`,
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

  getCommonRoleCurrentUsers(GRID: string, actionParameters: any, pagParams: PaginationParameters) {
    let params = new HttpParams()
      .set('StartRow', pagParams.startRow.toString())
      .set('EndRow', pagParams.endRow.toString())
      .set('GRID', GRID)
      .set('rowCount', pagParams.startRow === 1 ? 'true' : 'false');
    if (actionParameters.action) {
      params = params.append('FullSearchStr', actionParameters.fullSearchStr ? actionParameters.fullSearchStr : '');
      params = params.append('FirstName', actionParameters.name ? actionParameters.name : '');
      params = params.append('LastName', actionParameters.surname ? actionParameters.surname : '');
      params = params.append('Login', actionParameters.login ? actionParameters.login : '');
      params = params.append('DepID', actionParameters.department);
      params = params.append(actionParameters.action, 'true');
    }

    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSCommonRolesUsers}?Format=webreport`,
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

  getCommonRolesAllUsers(searchParameters, inputData, startRow: number, endRow: number): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', startRow.toString())
      .set('EndRow', endRow.toString())
      .set('GRID', this._globalConstants.FCTS_Dashboard.FCTS_SU)
      .set('ItemID', inputData.itemID)
      .set('StandartUsers', inputData.itemName === 'SU' ? 'false' : 'true');
    if (searchParameters.search) {
      params = params.append('SearchStr', searchParameters.searchString);
      params = params.append('DepID', searchParameters.department);
      params = params.append('search', 'true');
    }
    return this.httpServices.get<UsersData[]>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.FCTSCommonRoleAllUsers}?Format=webreport`,
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

  orgmdTeamAllUsers(searchParameters: any, startRow: number, endRow: number): Observable<UsersData[]> {
    let params = new HttpParams()
      .set('StartRow', startRow.toString())
      .set('EndRow', endRow.toString())
      .set('ItemID', searchParameters.itemID);
    if (searchParameters.action && searchParameters.action === 'search') {
      params = params.append('SearchStr', searchParameters.searchString);
      params = params.append('DepID', searchParameters.department);
      params = params.append(searchParameters.action, 'true');
    }
    return this.httpServices.get<any>(
      this.CSUrl + `${FCTSDashBoard.WRApiV1}${FCTSDashBoard.ORGMDTeamAllUsers}?Format=webreport`,
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



}
