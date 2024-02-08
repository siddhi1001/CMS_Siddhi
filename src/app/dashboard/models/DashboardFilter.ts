export class DashboardFilter {
  constructor(public ID: number, public Name: string, public Name_AR: string) { }
}

export interface DashboardFilterResponse {
  myRows: DashboardFilter[];
}

export interface TransferAttributes {
  Priority: any;
  Purpose: any;
}
