import { CorrespondenenceDetailsModel } from '../../models/CorrespondenenceDetails.model';

interface SectionParam {
  Show: boolean;
  Modify: boolean;
}

interface FieldParam {
  Show: boolean;
  Modify: boolean;
  Required: boolean;
}

interface CorrSectionList {
  Sender: SectionParam;
  Recipient: SectionParam;
  Approvers: SectionParam;
  CC: SectionParam;
  Correspondence: SectionParam;
  Cover: SectionParam;
  Attachments: SectionParam;
  MiscelFolder: SectionParam;
  UserCollaboration: SectionParam;
  LinkedCorrespondence: SectionParam;
  Comments: SectionParam;
  Transfer: SectionParam;
  Distribution: SectionParam;
}

interface CorrItemsList {
  regDate: FieldParam;
  docsDate: FieldParam;
  confidential: FieldParam;
  priority: FieldParam;
  refNumber: FieldParam;
  personalName: FieldParam;
  idNumber: FieldParam;
  correspondenceType: FieldParam;
  baseType: FieldParam;
  arabicSubject: FieldParam;
  englishSubject: FieldParam;
  projectCode: FieldParam;
  budgetNumber: FieldParam;
  contractNumber: FieldParam;
  tenderNumber: FieldParam;
  corrNumber: FieldParam;
  fillinPlanPath: FieldParam;
  dispatchMethod: FieldParam;
  staffNumber: FieldParam;
}

export class ShowSections implements CorrSectionList {
  public Sender: SectionParam;
  public Recipient: SectionParam;
  public CC: SectionParam;
  public Approvers: SectionParam;
  public Correspondence: SectionParam;
  public Cover: SectionParam;
  public Attachments: SectionParam;
  public MiscelFolder: SectionParam;
  public UserCollaboration: SectionParam;
  public LinkedCorrespondence: SectionParam;
  public Comments: SectionParam;
  private _Transfer: SectionParam;
  private _Distribution: SectionParam;

  public get Distribution(): SectionParam { return this._Distribution; }
  public set Distribution(value: SectionParam) { this._Distribution = value; }

  public get Transfer(): SectionParam { return this._Transfer; }
  public set Transfer(value: SectionParam) { this._Transfer = value; }

  constructor() {
    this._setInitData();
  }

  private _setInitData() {
    this.Sender = { Show: true, Modify: false };
    this.Recipient = { Show: true, Modify: false };
    this.CC = { Show: true, Modify: false };
    this.Approvers = { Show: true, Modify: false };
    this.Correspondence = { Show: true, Modify: false };
    this.Cover = { Show: true, Modify: false };
    this.Attachments = { Show: true, Modify: false };
    this.MiscelFolder = { Show: true, Modify: false };
    this.UserCollaboration = { Show: true, Modify: false };
    this.LinkedCorrespondence = { Show: true, Modify: false };
    this.Comments = { Show: true, Modify: false };
    this.Transfer = { Show: true, Modify: false };
    this.Distribution = { Show: true, Modify: true };
  }


  public ShowCorrSection(correspondenceData: CorrespondenenceDetailsModel, CorrespondencType: string, taskID: string) {
    if ((correspondenceData.ID.toString() !== '0' && correspondenceData.holdSecretaryID.toString() !== '0' && (correspondenceData.Status.toString() === '0' || correspondenceData.Status.toString() === '1'))
      || (correspondenceData.ID.toString() === '0' && correspondenceData.isCC.toString() === '1' && correspondenceData.CCstatus !== 'Archived')
      || (correspondenceData.perform07.toString() === '1' && correspondenceData.CCstatus !== 'Archived')
    ) {
      this.Transfer.Modify = true;
    } else {
      this.Transfer.Modify = false;
    }
    if (correspondenceData.CorrespondenceFlowType === '1') {
      this.Approvers.Show = false;
      this.Approvers.Modify = false;
    }
    if (correspondenceData.CorrespondenceFlowType === '5') {
      this.Distribution.Show = false;
      this.Distribution.Modify = false;
    }
  }

  public ShowCorrSectionWF() {
    this._ShowSectionWFIncoming();
  }

  private _ShowSectionWFIncoming() {
    this.Transfer.Show = false;
    this.UserCollaboration.Show = false;
  }

}

export class ShowCorrItems implements CorrItemsList {
  public regDate: FieldParam;
  public docsDate: FieldParam;
  public confidential: FieldParam;
  public priority: FieldParam;
  public refNumber: FieldParam;
  public personalName: FieldParam;
  public idNumber: FieldParam;
  public correspondenceType: FieldParam;
  public baseType: FieldParam;
  public arabicSubject: FieldParam;
  public englishSubject: FieldParam;
  public projectCode: FieldParam;
  public budgetNumber: FieldParam;
  public contractNumber: FieldParam;
  public tenderNumber: FieldParam;
  public corrNumber: FieldParam;
  public fillinPlanPath: FieldParam;
  public dispatchMethod: FieldParam;
  public staffNumber: FieldParam;
  public obType: FieldParam;

  constructor() {
    this._setCorrItems();
  }

  private _setCorrItems() {
    this.regDate = { Show: true, Modify: false, Required: false };
    this.docsDate = { Show: true, Modify: true, Required: false };
    this.confidential = { Show: true, Modify: true, Required: false };
    this.priority = { Show: true, Modify: true, Required: false };
    this.refNumber = { Show: true, Modify: true, Required: true };
    this.personalName = { Show: true, Modify: true, Required: false };
    this.idNumber = { Show: true, Modify: true, Required: false };
    this.correspondenceType = { Show: true, Modify: true, Required: false };
    this.baseType = { Show: true, Modify: true, Required: false };
    this.arabicSubject = { Show: true, Modify: true, Required: false };
    this.englishSubject = { Show: true, Modify: true, Required: false };
    this.projectCode = { Show: true, Modify: true, Required: false };
    this.budgetNumber = { Show: true, Modify: true, Required: false };
    this.contractNumber = { Show: true, Modify: true, Required: false };
    this.tenderNumber = { Show: true, Modify: true, Required: false };
    this.corrNumber = { Show: true, Modify: false, Required: false };
    this.fillinPlanPath = { Show: true, Modify: true, Required: false };
    this.dispatchMethod = { Show: true, Modify: true, Required: false };
    this.staffNumber = { Show: true, Modify: true, Required: false };
    this.obType = { Show: true, Modify: true, Required: false };
  }
}

export class ShowWFButtons {
  btnComplete: boolean;
  btnDelete: boolean;
  btnNotifExtComp: boolean;
  btnPrnBarcode: boolean;
  btnPrnReceipt: boolean;
  btnSave: boolean;
  btnSendBack: boolean;
  btnSendFax: boolean;
  btnSendOn: boolean;
  btnToDashboard: boolean;
}
