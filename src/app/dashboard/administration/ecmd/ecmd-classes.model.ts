export interface CountriesModel {
    CountryID: number;
    Name_EN: string;
    Name_AR: string;
}

export interface StatesModel {
    SPID: number;
    Name_EN: string;
    Name_AR: string;
}

export class ECMDNodeModel {
    Type: string;
    NODEID: number;
    Name_EN: string;
    Name_AR: string;
    ShortName_EN: string;
    ShortName_AR: string;
    ParentID: number;
    isActive: number;
    CounterParts: number;
}

export class ECMDCounterpartModel {
    Type: string;
    CPID: number;
    Name_EN: string;
    Name_AR: string;
    ShortName_EN: string;
    ShortName_AR: string;
    NODEID: number;
    isActive: number;
    CounterParts: number;
    VatCode: string;
    Address: string;
    Address_AR: string;
    City: string;
    City_AR: string;
    PostalCode: string;
    CountryID: number;
    SPID: number;
    Phone: string;
    Fax: string;
    Email: string;
}

export class ECMDChartDepartmentModel {
    Type: string;
    DEPID: number;
    Name_EN: string;
    ShortName_EN: string;
    Name_AR: string;
    ShortName_AR: string;
    ParentID: number;
    isActive: number;
    CPID: number;
    Deleted: number;
}

export class ECMDContactModel {
    CID: number;
    CPID: number;
    DEPID: number;
    Email: string;
    Fax: string;
    FirstName_AR: string;
    FirstName_EN: string;
    LastName_AR: string;
    LastName_EN: string;
    Phone1: string;
    Phone2: string;
    Type: string;
    isActive: number;
}

export interface NodeListModel {
    NODEID: number;
    Name_EN: string;
    Name_AR: string;
}

export interface ItemOrgStructure {
    ID: number;
    Type: string;
    Name_EN: string;
    Name_AR: string;
}

export class ECDMChartNode implements ECMDNodeModel {
    public Type: string;
    public NODEID: number;
    public Name_EN: string;
    public Name_AR: string;
    public ShortName_EN: string;
    public ShortName_AR: string;
    public ParentID: number;
    public isActive: number;
    public CounterParts: number;
    public children?: ECDMChartNode[];
    public isLoading: boolean;
    public parentName_EN: string;
    public parentName_AR: string;
    constructor(obj: ECMDNodeModel) {
        this.Type = 'node';
        this.NODEID = obj.NODEID;
        this.Name_EN = obj.Name_EN;
        this.Name_AR = obj.Name_AR;
        this.ShortName_EN = obj.ShortName_EN;
        this.ShortName_AR = obj.ShortName_AR;
        this.ParentID = obj.ParentID;
        this.isActive = obj.isActive;
        this.CounterParts = obj.CounterParts;
        this.children = [];
    }

    public get getID(): number {
        return this.NODEID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.NODEID;
    }

    public get getParentID(): string | number {
        return this.ParentID ? this.Type + '_' + this.ParentID : -1;
    }

    public get getIcon(): string {
        return 'assets/images/icons/folder_002.svg';
    }
}

export class ECDMChartCounterpart implements ECMDCounterpartModel {
    public Type: string;
    public CPID: number;
    public Name_EN: string;
    public Name_AR: string;
    public ShortName_EN: string;
    public ShortName_AR: string;
    public NODEID: number;
    public isActive: number;
    public CounterParts: number;
    public children?: ECDMChartCounterpart[];
    public isLoading: boolean;
    public VatCode: string;
    public Address: string;
    public Address_AR: string;
    public City: string;
    public City_AR: string;
    public PostalCode: string;
    public CountryID: number;
    public SPID: number;
    public Phone: string;
    public Fax: string;
    public Email: string;
    public parentName_EN: string;
    public parentName_AR: string;
    public Country_EN: string;
    public Country_AR: string;
    public State_EN: string;
    public State_AR: string;
    constructor(obj: ECMDCounterpartModel) {
        this.Type = 'ctrp';
        this.NODEID = obj.NODEID;
        this.CPID = obj.CPID;
        this.Name_EN = obj.Name_EN;
        this.Name_AR = obj.Name_AR;
        this.ShortName_EN = obj.ShortName_EN;
        this.ShortName_AR = obj.ShortName_AR;
        this.isActive = obj.isActive;
        this.CounterParts = obj.CounterParts;
        this.VatCode = obj.VatCode;
        this.Address = obj.Address;
        this.Address_AR = obj.Address_AR;
        this.City = obj.City;
        this.City_AR = obj.City_AR;
        this.PostalCode = obj.PostalCode;
        this.CountryID = obj.CountryID;
        this.SPID = obj.SPID;
        this.Phone = obj.Phone;
        this.Fax = obj.Fax;
        this.Email = obj.Email;
        this.children = [];
    }

    public get getID(): number {
        return this.CPID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.CPID;
    }

    public get getParentID(): string | number {
        return this.NODEID ? 'node_' + this.NODEID : -1;
    }

    public get getIcon(): string {
        return 'assets/images/icons/counterparts.svg';
    }
}

export class ECDMChartDepartment implements ECMDChartDepartmentModel {
    public Type: string;
    public DEPID: number;
    public Name_EN: string;
    public ShortName_EN: string;
    public Name_AR: string;
    public ShortName_AR: string;
    public ParentID: number;
    public isActive: number;
    public CPID: number;
    public Deleted: number;
    public children?: any[];
    public parentName_EN: string;
    public parentName_AR: string;
    constructor(obj: ECMDChartDepartmentModel) {
        this.Type = 'dep';
        this.DEPID = obj.DEPID;
        this.Name_EN = obj.Name_EN;
        this.ShortName_EN = obj.ShortName_EN;
        this.Name_AR = obj.Name_AR;
        this.ShortName_AR = obj.ShortName_AR;
        this.ParentID = obj.ParentID;
        this.isActive = obj.isActive;
        this.CPID = obj.CPID;
        this.Deleted = obj.Deleted;
        this.children = [];
    }

    public get getID(): number {
        return this.DEPID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.DEPID;
    }

    public get getParentID(): string | number {
        return this.ParentID ? 'dep_' + this.ParentID : 'ctrp_' + this.CPID;
    }

    public get getParent(): string | number {
        return this.ParentID ? this.ParentID : this.CPID;
    }

    public get getIcon(): string {
        return 'assets/images/icons/counterpart_department.svg';
    }
}

export class ECDMChartContact implements ECMDContactModel {
    public CID: number;
    public CPID: number;
    public DEPID: number;
    public Email: string;
    public Fax: string;
    public FirstName_AR: string;
    public FirstName_EN: string;
    public LastName_AR: string;
    public LastName_EN: string;
    public Phone1: string;
    public Phone2: string;
    public Type: string;
    public isActive: number;
    public children?: any[];
    public parentName_EN: string;
    public parentName_AR: string;
    constructor(obj: ECMDContactModel) {
        this.Type = 'contact';
        this.CID = obj.CID;
        this.CPID = obj.CPID;
        this.DEPID = obj.DEPID;
        this.Email = obj.Email;
        this.Fax = obj.Fax;
        this.FirstName_AR = obj.FirstName_AR;
        this.FirstName_EN = obj.FirstName_EN;
        this.LastName_AR = obj.LastName_AR;
        this.LastName_EN = obj.LastName_EN;
        this.Phone1 = obj.Phone1;
        this.Phone2 = obj.Phone2;
        this.isActive = obj.isActive;
        this.children = [];
    }
    public get getID(): number {
        return this.CID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.CID;
    }

    public get getParentID(): string | number {
        return this.DEPID ? 'dep_' + this.DEPID : 'ctrp_' + this.CPID;
    }

    public get getParent(): string | number {
        return this.DEPID ? this.DEPID : this.CPID;
    }

    public get getIcon(): string {
        return 'assets/images/icons/user_002.svg';
    }
}

export class ECDMChartPagination {
    public Type: string;
    public ParentType: string;
    public NODEID: number;
    public Name_EN: string;
    public Name_AR: string;
    public isActive: number;
    public startRow: number;
    public endRow: number;
    public loadStep: number;
    public children?: ECDMChartNode[];
    public isLoading: boolean;
    constructor(obj: ECMDNodeModel, startRow: number, loadStep: number) {
        this.Type = 'pagination';
        this.ParentType = obj.Type;
        this.NODEID = obj.NODEID;
        this.Name_EN = startRow + '-' + (startRow + loadStep - 1);
        this.Name_AR = startRow + '-' + (startRow + loadStep - 1);
        this.isActive = 1;
        this.children = [];
        this.startRow = startRow;
        this.endRow = startRow + loadStep;
        this.loadStep = loadStep;
    }

    public get getID(): number {
        return this.NODEID;
    }

    public get getCode(): string {
        return this.Type + '_' + this.NODEID + '_' + this.startRow;
    }

    public get getParentID(): string | number {
        return this.ParentType + '_' + this.NODEID;
    }

    public get getIcon(): string {
        return 'assets/images/icons/folder_002.svg';
    }
}
