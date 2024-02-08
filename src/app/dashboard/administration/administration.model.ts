export interface RolesData {
    Description_AR: string;
    Description_EN: string;
    Grid: string;
    ID: string;
    Name_AR: string;
    Name_EN: string;
}

export interface DepFilterData {
    Name_AR: string;
    Name_EN: string;
    OUID: string;
}

export interface UsersData {
    DepartmentID: string;
    DepartmentName_AR: string;
    DepartmentName_EN: string;
    EID: string;
    FirstName_AR: string;
    FirstName_EN: string;
    ID: string;
    LastName_AR: string;
    LastName_EN: string;
    Login: string;
    RowNum?: string;
    totalRowCount?: number;
    Email?: string;
}

export interface PaginationParameters {
    perPage: number;
    startRow: number;
    endRow: number;
    page: number;
}

export interface BreadCrumbsModel {
    name: string;
    path: string;
    section: string;
}

export interface СontentModel {
    description: NameModel;
    level: number;
    name: NameModel;
    route?: string;
    children?: СontentModel[];
}

export interface NameModel {
    en: string;
    ar: string;
}

export enum DialogDirection {
    rtl = 'rtl',
    ltr = 'ltr'
}

export interface OrgStructure {
    OUID: number;
    Parent: number;
    Name_EN: string;
    Name_AR: string;
    ShortName_AR: string;
    ShortName_EN: string;
    Description_AR: string;
    Description_EN: string;
    OUTID: number;
    LTID: number;
    Code: string;
    ParentName?: string;
    ParentName_EN?: string;
    ParentName_AR?: string;
    Type_EN?: string;
    Type_AR?: string;
    LinkType_EN?: string;
    LinkType_AR?: string;
    expand?: boolean;
    isLoading?: boolean;
    wanted?: boolean;
    children?: OrgStructure[];
}

export interface OrgChartEmployeeModel {
    OUID: number;
    Parent: number;
    EID: number;
    Login: string;
    LastName_EN: string;
    MiddleName_EN: string;
    FirstName_EN: string;
    LastName_AR: string;
    MiddleName_AR: string;
    FirstName_AR: string;
    Code: string;
    EName_AR: string;
    KuafID: string;
    Title_EN?: string;
    Title_AR?: string;
    MailAddress?: string;
    PersonalEmail?: string;
    PersonalEmail2?: string;
    PersonalEmail3?: string;
    PersonalEmail4?: string;
    PersonalEmail5?: string;
    LTID?: number;
    OUTID?: number;
    RoleID?: string;
    RoleName_AR?: string;
    RoleName_EN?: string;
    ParentName_EN?: string;
    ParentName_AR?: string;
    wanted?: boolean;
}

export interface UserRolesModel {
    Name_AR: string;
    Name_EN: string;
    RID: number;
    ShortName_EN?: string;
    ShortName_AR?: string;
    Description_EN?: string;
    Description_AR?: string;
    Main?: number;
    RowNum?: number;
    totalRowCount?: number;
}

export interface SpecRolesOrgStructure {
    CSGroup: string;
    Code: string;
    GroupName: string;
    LTID: string;
    Name_AR: string;
    Name_EN: string;
    OUID: number;
    OUTID: string;
    Parent: number;
    expand?: boolean;
    isLoading?: boolean;
    children?: SpecRolesOrgStructure[];
}

export interface SpecRolesEmployees {
    OUID: number;
    EID: number;
    FirstName_EN: string;
    FirstName_AR: string;
    LastName_EN: string;
    LastName_AR: string;
    RoleName: string;
    RoleName_AR: string;
    Code: string;
    EName: string;
    EName_AR: string;
}

export interface CommonRoleModel {
    GRID: number;
    Description_AR: string;
    Description_EN: string;
    Name_AR: string;
    Name_EN: string;
}

export class ActionParamsModel {
    action: string;
    fullSearchStr: string;
    name: string;
    surname: string;
    login: string;
    department: string;
} 
