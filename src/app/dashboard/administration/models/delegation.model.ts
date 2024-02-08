export interface UsersAutocompleteModel {
    KuafID: number;
    Name_EN: string;
    Name_AR: string;
}

export class DelegationRequest {
    delegation_start_date: string;
    delegation_end_date: string;
    active_delegatee: string;
    delegatees: string;
    userID: string;
    activate: string;
}

export interface MultipleDelegatorsModel {
    DelegatedUser: number;
    ProxyName_AR: string;
    ProxyName_EN: string;
    activeUser: string;
    hasActiveUser: string;
}

export interface CurrentDelegationModel {
    CountUsers: string;
    DelegationID: number;
    EndDate: string;
    ID: number;
    ISActive: string;
    ProxyName_AR: string;
    ProxyName_EN: string;
    ProxyUser: number;
    StartDate: string;
    TemporaryCSGroup: number;
    UserID: number;
    UserName_AR: string;
    UserName_EN: string;
    MultipleDelegators: MultipleDelegatorsModel[];
}

export interface DelegationsReportModel {
    DelegatedUser: string;
    DelegatorID: string;
    EndDate: string;
    ID: string;
    ProxyName_AR: string;
    ProxyName_EN: string;
    TemporaryCSGroup: string;
    UserFinishDate: string;
    UserName_AR: string;
    UserName_EN: string;
    UserStartDate: string;
    UserStatus: string;
}

export class OrgNameAutoFillModelSimpleUser {
    Val_En: string;
    Val_Ar: string;
    NameID: number;
    NameLogin: string;
    Name_En: string;
    Name_Ar: string;
    Type: number;
    RecipientUserID: number;
    RecipientVersion: number;
    _SOURCEROWNUM: number;
    _ORIGROWNUM: number;
  }

  export class DelegationReportRequest {
    recUserID: string;
    proxyUser: string;
    startDate: string;
    endDate: string;
}