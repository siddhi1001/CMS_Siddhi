export class organizationalChartModel {
  Name: string;
  OUID: number;
  Parent: number;
  Name_AR: string;
  LTID: number;
  OUTID: number;
  Code: number;
  employees_status: string;
  expand?: boolean;
  wanted?: boolean;
  children?: organizationalChartModel[];
  static OUID: any;
}

export class organizationalChartEmployeeModel {
  OUID: number;
  EID: number;
  Coev_Code: string;
  EName: string;
  Coev_LastName: string;
  Coev_Firstname: string;
  EName_AR: string;
  Coev_LastName_AR: string;
  Coev_FirstName_AR: string;
  RoleName: string;
  RoleName_AR: string;
  KuafID: number;
  wanted?: boolean;
}

export class ECMDChartModel {
  NODEID: number;
  CPID: number;
  Version: number;
  Name: string;
  Name_AR: string;
  ParentID: number;
  pNODEID: number;
  isActive: number;
  isCPID: number;
  CounterParts: number;
  PersonalNameReq?: number;
  isLoading?: boolean;
  children?: any[];
  static NODEID: any;
}

export class ECMDChartDepartmentModel {
  DEPID: number;
  Version: number;
  CurrentVer: number;
  CreationDate: string;
  CreatorID: number;
  Name: string;
  Short_Name: string;
  Comments: string;
  SyncDate: string;
  Name_AR: string;
  Short_Name_AR: string;
  Comments_AR: string;
  ParentID: number;
  isActive: number;
  Phone: string;
  Fax: string;
  Email: string;
  CPID: number;
  Deleted: number;
  isDep: number;
  children?: ECMDChartDepartmentModel[];
  static DEPID: any;
}
