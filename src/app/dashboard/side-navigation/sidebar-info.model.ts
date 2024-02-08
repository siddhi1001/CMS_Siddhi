export class SidebarUsersInfo {
    LoggedUser: UserInfo;
    ProxyUsers: UserInfo;
}

export class UserInfo {
    ID: number;
    EID: number;
    Login: string;
    Name_En: string;
    FirstName_En: string;
    LastName_En: string;
    Name_Ar: string;
    FirstName_Ar: string;
    LastName_Ar: string;
    PhotoID: number;
    RoleName_En: string;
    RoleName_Ar: string;
    LoggedUser:string;
    ProxyUsers:string;

}

export class UserGroups {
    GroupID: string;
    GroupLevel: string;
    GroupName: string;
    GroupType: string;
}

export class DelegationRequest {
    delegation_start_date: string;
    delegation_end_date: string;
    active_delegatee: string;
    delegatees: string;
    creatorID: string;
    userID: string;
    activate: string;
  }

export class DelegationReportRequest {
    recUserID: string;
    proxyUser: string;
    startDate: string;
    endDate: string;
}



