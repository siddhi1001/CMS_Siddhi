export interface DistributionDetailsParameters {
    Comments: string;
    DepartmentName_AR: string;
    DepartmentName_EN: string;
    DistCode: string;
    DistCodeName_AR: string;
    DistCodeName_EN: string;
    DistCodeVer: string;
    DistRole: string;
    DistribRole_AR: string;
    DistribRole_EN: string;
    DueDays: string;
    FCTS_ID: string;
    FlowSeq: string;
    InitStatus: string;
    Name_AR: string;
    Name_EN: string;
    PriorityCode: string;
    PurposeCode: string;
    Role_AR: string;
    Role_EN: string;
    SeqOrder: string;
    Type: string;
    trUserID: string;
}

export class DistributionSaveObj {
    Comments: string;
    DistCode: string;
    DistCodeVer: string;
    DistRole: string;
    DueDate: string;
    DueDays: number;
    FlowSeq: number;
    InitStatus: string;
    Priority: number;
    Purpose: number;
    To: string;
    TransDate: string;
    constructor() { }
}

export interface DistributionChatrData {
    LTID: string;
    Name: string;
    Name_AR: string;
    OUID: string;
    OUTID: string;
    Parent: string;
    children?: DistributionChatrData[];
    expand?: boolean;
}

export interface DistributionChartEmployeeModel {
    Coev_FirstName_AR: string;
    Coev_Firstname: string;
    Coev_LastName: string;
    Coev_LastName_AR: string;
    KuafID: string;
    ParentID: string;
}

export interface DistributionDataParameters {
    CompletedDate: string;
    CorrespondenceIcon: Icon;
    DistRole: string;
    DistSeq: string;
    DueDate: string;
    ID: string;
    Notes: string;
    NotesComplete: string;
    PriorityID: string;
    Priority_AR: string;
    Priority_EN: string;
    Purpose: string;
    Purpose_AR: string;
    Purpose_EN: string;
    Status: string;
    TransferDate: string;
    TransferUserID: string;
    UserID: string;
    VolumeID: string;
    distRole_AR: string;
    distRole_EN: string;
    rName_AR: string;
    rName_EN: string;
    rRoleName_AR: string;
    rRoleName_EN: string;
    sName_AR: string;
    sName_EN: string;
    sRoleName_AR: string;
    sRoleName_EN: string;
}

export interface Icon {
    title: string;
    icon: string;
}