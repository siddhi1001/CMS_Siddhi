export interface OrgStructureModel {
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
    children?: OrgStructureModel[];
}

export interface ORGMDTeamsModel {
    TID: number;
    KuafID: number;
    ParentID: number;
    Name_EN: string;
    Name_AR: string;
    ShortName_EN: string;
    ShortName_AR: string;
    Description_EN: string;
    Description_AR: string;
    ProjectID: number;
    Email: string;
    TeamPurpose_EN: string;
    TeamPurpose_AR: string;
    TeamPurposeShort_EN: string;
    TeamPurposeShort_AR: string;
    wanted?: boolean;
}

export interface ORGMDTeamProjects {
    ID: number;
    Name: string;
}

export class UnitDefinitionModel {
    Description_AR: string;
    Description_EN: string;
    Name_AR: string;
    Name_EN: string;
    OUTID: number;
}

export class EntityRelationModel {
    Description_AR: string;
    Description_EN: string;
    LTID: number;
    Name_AR: string;
    Name_EN: string;
}
