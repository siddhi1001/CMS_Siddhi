export class CorrResponse {
  actualRows: string;
  filteredRows: string;
  myRows: any;
  sourceID: string;
  totalRows: string;
  totalSourceRows: string;
}


export class CorrespondenceFormData {
  action: string;
  values: any;
}

export class SenderDetailsData {
  DepartmentName_AR: string;
  DepartmentName_EN: string;
  ExternalOrganization: number;
  Fax: string;
  Name_AR: string;
  Name_EN: string;
  OrganizationName_AR: string;
  OrganizationName_EN: string;
  PersonalNameReq: number;
  Role_AR: string;
  Role_EN: string;
  SenderDepartment: string;
  SenderID: number;
  SenderName: string;
  SenderRole: string;
  SenderSection: string;
  SenderUserID: number;
  SenderVersion: string;
  SectionName_EN: string;
  SectionName_AR: string;
  SenderNativeDepartment: number;
  DepartmentNativeName_AR: string;
  DepartmentNativeName_EN: string;
  TeamID?: number;
}

export class RecipientDetailsData {
  DepartmentName_AR: string;
  DepartmentName_EN: string;
  Level: string;
  Name_AR: string;
  Name_EN: string;
  OrganizationName_AR: string;
  OrganizationName_EN: string;
  RecipientDepartment: number;
  RecipientID: number;
  RecipientRole: number;
  RecipientSection: number;
  RecipientType: string;
  RecipientUserID: number;
  RecipientVersion: number;
  Role_AR: string;
  Role_EN: string;
  SectionName_AR: string;
  SectionName_EN: string;
}

export interface CommentsNode {
  CommentText: string;
  CreationDate: string;
  CreatorID: string;
  CreatorName_AR: string;
  CreatorName_EN: string;
  Deleted: string;
  ID: string;
  Private: string;
  ReferenceID: string;
  ReferenceType: string;
  ReplyAvailable: string;
  ReplyTo: string;
  Version: string;
  shortComment: string;
  subComments?: CommentsNode[];
}
