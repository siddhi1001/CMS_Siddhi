export interface ISimpleDataModel {
    ID: number;
    Name_EN: string;
    Name_AR: string;
}

export interface IPurposeModel { //TODO Change to IPurposeModel
    PhaseID: number;
    PurposeID: Number;
    Purpose_EN: string;
    Purpose_AR: string;
    Phase_EN?: string;
    Phase_AR?: string;
}

export interface IRejectReasons {
    RejectReasonID: Number;
    RejectReason_EN: string;
    RejectReason_AR: string;
    PhaseID: number;
    Phase_EN?: string;
    Phase_AR?: string;
}

export interface IPriorityModel {
    PriorityID: number;
    Priority_EN: string;
    Priority_AR: string;
    NumberOfDays: string;
}

export interface IMDFilingPlanModel {
    ID: string;
    Name_EN: string;
    Name_AR: string;
    IsFull: string;
}

export enum ActionType {
    edit = 'update',
    add = 'insert',
    delete = 'delete'
}

