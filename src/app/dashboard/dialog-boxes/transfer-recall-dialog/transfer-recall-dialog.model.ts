import { Correspondence } from 'src/app/dashboard/services/correspondence.model';

export class RecallTransferInfo {
    correspondData: Correspondence;
    recallType: string;
    selectedIDs: string;
}

export class TransferRecallDialogData {
    AcceptedDate: string;
    AcknowledgedDate: string;
    AcknowledgedUserID: number;
    CompletedDate: string;
    DistCode: number;
    DistCodeVer: number;
    DistRole: number;
    DistSeq: number;
    DueDate: string;
    ID: number;
    Notes: string;
    NotesComplete: string | null;
    OpenDate: string;
    OpenUserID: number;
    PriorityID: number;
    Purpose: number;
    Purpose_AR: string;
    Purpose_EN: string;
    ShowChb?: boolean;
    ShowOpened?: boolean;
    Status: number;
    TransferDate: string;
    TransferType: number;
    TransferUserID: number;
    UserID: number;
    VolumeID: number;
    WasOpened: number;
    completeUserID: number;
    holdSecretaryID: number;
    isPowerUser: number;
    isReplay: number;
    onBehalfUserID: number;
    parentID: number;
    rDepartment_AR: string;
    rDepartment_EN: string;
    rName_AR: string;
    rName_EN: string;
    rRoleName_AR: string;
    rRoleName_EN: string;
    tStatus: string;
}
