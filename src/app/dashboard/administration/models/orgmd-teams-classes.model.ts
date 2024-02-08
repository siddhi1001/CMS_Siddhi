
import { OrgStructureModel, ORGMDTeamsModel } from 'src/app/dashboard/administration/models/orgmd.model';

export class ORGMDTeamChartNode implements OrgStructureModel {
    public Type: string;
    public OUID: number;
    public Parent: number;
    public Name_EN: string;
    public Name_AR: string;
    public ShortName_AR: string;
    public ShortName_EN: string;
    public Description_AR: string;
    public Description_EN: string;
    public ParentName_EN: string;
    public ParentName_AR: string;
    public OUTID: number;
    public LTID: number;
    public Code: string;
    public expand: boolean;
    public wanted: boolean;
    public children: any[];
    constructor(obj: OrgStructureModel) {
        this.Type = 'node';
        this.OUID = obj.OUID;
        this.Parent = obj.Parent;
        this.Name_EN = obj.Name_EN;
        this.Name_AR = obj.Name_AR;
        this.ShortName_AR = obj.ShortName_AR;
        this.ShortName_EN = obj.ShortName_EN;
        this.Description_AR = obj.Description_AR;
        this.Description_EN = obj.Description_EN;
        this.OUTID = obj.OUTID;
        this.LTID = obj.LTID;
        this.Code = obj.Code;
        this.expand = obj.expand;
        this.wanted = obj.wanted;
        this.children = obj.children;
    }
    public get getID(): number {
        return this.OUID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.OUID;
    }

    public get getParentID(): string | number {
        return this.Parent > 0 ? this.Type + '_' + this.Parent : this.Parent;
    }

    public get getIcon(): string {
        return 'assets/images/icons/folder_002.svg';
    }
}

export class ORGMDTeamChartTeam implements ORGMDTeamsModel {
    public Type: string;
    public TID: number;
    public KuafID: number;
    public ParentID: number;
    public Name_EN: string;
    public Name_AR: string;
    public ShortName_EN: string;
    public ShortName_AR: string;
    public Description_EN: string;
    public Description_AR: string;
    public ProjectID: number;
    public ProjectName: string;
    public Email: string;
    public TeamPurpose_EN: string;
    public TeamPurpose_AR: string;
    public TeamPurposeShort_EN: string;
    public TeamPurposeShort_AR: string;
    public ParentName_EN: string;
    public ParentName_AR: string;
    public wanted: boolean;
    public isLoading: boolean;
    constructor(obj: ORGMDTeamsModel) {
        this.Type = 'team';
        this.TID = obj.TID;
        this.KuafID = obj.KuafID;
        this.ParentID = obj.ParentID;
        this.Name_EN = obj.Name_EN;
        this.Name_AR = obj.Name_AR;
        this.ShortName_EN = obj.ShortName_EN;
        this.ShortName_AR = obj.ShortName_AR;
        this.Description_EN = obj.Description_EN;
        this.Description_AR = obj.Description_AR;
        this.ProjectID = obj.ProjectID;
        this.Email = obj.Email;
        this.TeamPurpose_EN = obj.TeamPurpose_EN;
        this.TeamPurpose_AR = obj.TeamPurpose_AR;
        this.TeamPurposeShort_EN = obj.TeamPurposeShort_EN;
        this.TeamPurposeShort_AR = obj.TeamPurposeShort_AR;
        this.wanted = obj.wanted;
    }
    public get getID(): number {
        return this.TID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.TID;
    }

    public get getParentID(): string | number {
        return 'node_' + this.ParentID;
    }

    public get getIcon(): string {
        return 'assets/images/icons/group_001.svg';
    }
}
