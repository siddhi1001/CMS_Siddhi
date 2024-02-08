export enum ViewType {
    baseType = 'base_type',
    corrType = 'correspondence_type',
    docType = 'document_type',
    dispatchMethod = 'dispatch_method'
}

interface ISimpleViewConf {
    getMethod: string;
    setMethod: string;
    checkTemplate: string;
    name: string;
    name_ar: string;
    editHeader: string;
    addHeader: string;
}

export class SimpleViewConfig implements ISimpleViewConf {
    getMethod: string;
    setMethod: string;
    checkTemplate: string;
    name: string;
    name_ar: string;
    editHeader: string;
    addHeader: string;

    constructor(private dataType: string) {
        this.init();
    }

    private init() {
        switch (this.dataType) {
            case ViewType.baseType:
                this.getMethod = 'getBaseTypes';
                this.setMethod = 'saveBaseType';
                this.checkTemplate = 'BaseType';
                this.name = 'base_type';
                this.name_ar = 'base_type_ar';
                this.editHeader = 'edit_base_type';
                this.addHeader = 'add_base_type';
                break;
            case ViewType.corrType:
                this.getMethod = 'getCorrTypes';
                this.setMethod = 'saveCorrType';
                this.checkTemplate = 'CorrespondenceType';
                this.name = 'correspondence_type';
                this.name_ar = 'correspondence_type_ar';
                this.editHeader = 'edit_correspondence_type';
                this.addHeader = 'add_correspondence_type';
                break;
            case ViewType.docType:
                this.getMethod = 'getDocumentTypes';
                this.setMethod = 'saveDocumentType';
                this.checkTemplate = 'DocumentType';
                this.name = 'document_type';
                this.name_ar = 'document_type_ar';
                this.editHeader = 'edit_document_type';
                this.addHeader = 'add_document_type';
                break;
            case ViewType.dispatchMethod:
                this.getMethod = 'getDispatchMethods';
                this.setMethod = 'saveDispatchMethod';
                this.checkTemplate = 'DispatchMethod';
                this.name = 'dispatch_method';
                this.name_ar = 'dispatch_method_ar';
                this.editHeader = 'edit_dispatch_method';
                this.addHeader = 'add_dispatch_method';
                break;
            default:
        }
    }
}
