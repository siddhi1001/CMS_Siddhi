import { OrgNameAutoFillModel } from './CorrespondenenceDetails.model';
import { SenderDetailsData } from 'src/app/dashboard/services/correspondence-response.model';
export class CorrespondenceWFFormModel {
    CorrespondenceDate: string;			// CorrespondenceDate
    Confidential: string;			    // Confidential
    ConnectedID: string;				// connectedid
    ConnectedRefID: string;						// refID
    CorrespondenceID: string;			// CorrespondenceID
    CorrespondenceCode: string;			// CorrespondenceCode
    SenderDetails: OrgNameAutoFillModel | SenderDetailsData;
    RecipientDetails: OrgNameAutoFillModel;
    ExternalOrganization: string;	    // ExternalOrganization
    SenderDepartment: string;			// SenderDepartment
    SenderName: string;					// SenderName
    RecipientID: string;				// RecipientID
    RecipientUserID: string;			// RecipientUserID
    RecipientVersion: string;		    // RecipientVersion
    RecipientType: string;				// RecipientType
    RecipientDepartment: string;        // RecipientDepartment
    RecipientSection: string;		    // RecipientSection
    RecipientRole: string;				// RecipientRole
    RecipientName: string;				// RecipientName
    CCSet: any;						// CCSet
    UserCollSet: any;
    Disposition1: string;
    Disposition2: string;
    Disposition3: string;
    CoverID: string;	                 // CoverID
    ArabicSubject: string;		        // ArabicSubject
    EnglishSubject: string;		        // EnglishSubject
    CoverDate: string;		            // CoverDate
    DocumentNumber: string;	            // DocumentNumber
    Priority: string;					// Priority
    CorrespondenceType2: string;		// CorrespondenceType2
    IDNumber: string; 					// IDNumber
    BaseType: string;					// BaseType
    ProjectCode: string;				// ProjectCode
    BudgetNumber: string;			    // BudgetNumber
    CommitmentNumber: string;		    // CommitmentNumber
    TenderNumber: string;			    // TenderNumber
    CompanyRegistrationNumber: string;	// CompanyRegistrationNumber
    ContractNumber: string;			    // ContractNumber
    StaffNumber: string;				// StaffNumber
    CorrespondencePurpose: string;		// CorrespondencePurpose
    TemplateLanguage: string;
    FillingFilePlanPath: string;
    CorrespondenceFlowType: string;
    CorrespondenceYear: string;
    DocumentType: string;
    CorrespondenceDueDate: string;
    HeadOfSectionRequired: string;
    CorrespondencePhase: string;
    SkipDeptSecratory: string;
    SkipHOSSecratory: string;
    SigningAuthority: string;
    SigningAuthoritySecretary: string;
    HeadOfSection: string;
    HeadOfSectionSecretary: string;
    CorrespondenceStepDueDate: string;
    CorrespondenceSignatureDate: string;
    AcknowledgementDate: string;
    DispatchDate: string;
    ResponseDueDate: string;
    SenderID: string;
    SenderUserID: string;
    SenderVersion: string;
    SenderSection: string;
    SenderRole: string;
    FinalRecipientID: string;
    FinalRecipientUserID: string;
    FinalRecipientVersion: string;
    FinalRecipientType: string;
    FinalRecipientDepartment: string;
    FinalRecipientSection: string;
    FinalRecipientRole: string;
    RegisteredBy: string;
    DeliveryStatus: string;
    FilingPlanYear: string;
    PhysicalLocation: string;
    FilingPlanCabinet: string;
    FilingPlanRow: string;
    FilingPlanShelf: string;
    FilingPlanFile: string;
    FilingPlanPath: string;
    DispatchMethod: string;
    DispatchReference: string;
    CorrespondenceStatus: string;
    CorrespondenceArchive: string;
    MultipleSignatures: string;
    CorrespondenceNotificationFax: string;
    ExternalOrganizationFax: string;
    FinalRecipientName: string;
    FinalExternalOrganization: string;
    FinalSender: any;
}
