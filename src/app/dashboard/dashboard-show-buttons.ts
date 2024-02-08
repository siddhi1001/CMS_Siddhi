import { Correspondence } from './services/correspondence.model';

interface DashboardCorrButtonsList {
    Archive: boolean;
    Complete: boolean;
    Copy: boolean;
    Delete: boolean;
    DownloadAttach: boolean;
    Info: boolean;
    MRRecall: boolean;
    Open: boolean;
    Preview: boolean;
    PrintBarcode: boolean;
    Recall: boolean;
    ReplyIntern: boolean;
    ReplyExtern: boolean;
    ReplyTrans: boolean;
    ReturnToAS: boolean;
    SaveCorr: boolean;
    WFHistory: boolean;
}

export class DashboardShowButtons implements DashboardCorrButtonsList {
    private _Archive: boolean;
    private _Complete: boolean;
    private _Copy: boolean;
    private _Delete: boolean;
    private _DownloadAttach: boolean;
    private _Info: boolean;
    private _MRRecall: boolean;
    private _Open: boolean;
    private _Preview: boolean;
    private _PrintBarcode: boolean;
    private _Recall: boolean;
    private _ReplyIntern: boolean;
    private _ReplyExtern: boolean;
    private _ReplyTrans: boolean;
    private _ReturnToAS: boolean;
    private _SaveCorr: boolean;
    private _WFHistory: boolean;
    private _ShowMore: boolean;

    // private _correspondData: Correspondence;
    // private _reportType: string;

    public get Archive(): boolean { return this._Archive; }
    public set Archive(value: boolean) { this._Archive = value; }

    public get Complete(): boolean { return this._Complete; }
    public set Complete(value: boolean) { this._Complete = value; }

    public get Copy(): boolean { return this._Copy; }
    public set Copy(value: boolean) { this._Copy = value; }

    public get Delete(): boolean { return this._Delete; }
    public set Delete(value: boolean) { this._Delete = value; }

    public get DownloadAttach(): boolean { return this._DownloadAttach; }
    public set DownloadAttach(value: boolean) { this._DownloadAttach = value; }

    public get Info(): boolean { return this._Info; }
    public set Info(value: boolean) { this._Info = value; }

    public get MRRecall(): boolean { return this._MRRecall; }
    public set MRRecall(value: boolean) { this._MRRecall = value; }

    public get Open(): boolean { return this._Open; }
    public set Open(value: boolean) { this._Open = value; }

    public get Preview(): boolean { return this._Preview; }
    public set Preview(value: boolean) { this._Preview = value; }

    public get PrintBarcode(): boolean { return this._PrintBarcode; }
    public set PrintBarcode(value: boolean) { this._PrintBarcode = value; }

    public get Recall(): boolean { return this._Recall; }
    public set Recall(value: boolean) { this._Recall = value; }

    public get ReplyIntern(): boolean { return this._ReplyIntern; }
    public set ReplyIntern(value: boolean) { this._ReplyIntern = value; }

    public get ReplyExtern(): boolean { return this._ReplyExtern; }
    public set ReplyExtern(value: boolean) { this._ReplyExtern = value; }

    public get ReplyTrans(): boolean { return this._ReplyTrans; }
    public set ReplyTrans(value: boolean) { this._ReplyTrans = value; }

    public get ReturnToAS(): boolean { return this._ReturnToAS; }
    public set ReturnToAS(value: boolean) { this._ReturnToAS = value; }

    public get SaveCorr(): boolean { return this._SaveCorr; }
    public set SaveCorr(value: boolean) { this._SaveCorr = value; }

    public get WFHistory(): boolean { return this._WFHistory; }
    public set WFHistory(value: boolean) { this._WFHistory = value; }

    public get ShowMore(): boolean { return this._ShowMore; }
    public set ShowMore(value: boolean) { this._ShowMore = value; }

    constructor(correspondenceData: Correspondence, reportType: string) {
        // this._correspondData = correspondenceData;
        // this._reportType = reportType;
        this._showButton(correspondenceData, reportType);
    }

    private _setInitData() {
        this.Archive = false;
        this.Complete = false;
        this.Copy = false;
        this.Delete = false;
        /*   this.DownloadAttach = false; */
        this.MRRecall = false;
        this.PrintBarcode = false;
        this.Recall = false;
        this.ReplyIntern = false;
        this.ReplyExtern = false;
        this.ReplyTrans = false;
        this.ReturnToAS = false;
        this.SaveCorr = false;

        this.DownloadAttach = true;
        this.Info = true;
        this.Open = true;
        this.Preview = true;
        this.WFHistory = true;
        this.ShowMore = true;
    }

    /* reportType possible values
        ExtFullSearch
                ExtInbNew, ExtInbAck, ExtInbArc
                ExtOutWIP, ExtOutSig, ExtInbArc
        IntFullSearch
                IntInbNew, IntInbAck, IntInbArc
                IntOutWIP, IntOutSig, IntOutArc

    for mailroom (future)
            MRExtInbWIP, MRExtInbDis, MRExtInbAckn, MRExtInbArc
            MRExtOutWIP, MRExtOutDis, MRExtOutAck,  MRExtOutArc
    */
    private _showButton(correspondData: Correspondence, reportType: string) {
        this._setInitData();
        const allowsArch = ['ExtInbAck', 'ExtOutSig', 'IntInbAck', 'IntOutSig', 'MRExtInbAckn', 'MRExtOutAck'];
        const allowsCompl = ['ExtInbNew', 'IntInbNew'];
        const allowCopy = ['IntInbAck', 'IntInbArc', 'IntOutSig', 'IntOutArc', 'ExtOutSig', 'ExtInbArc'];
        const allowMRRecall = ['ExtFullSearch', 'MRExtInbAckn'];
        const allowsRecall = ['ExtInbAck', 'ExtOutWIP', 'IntInbAck', 'IntOutWIP'];
        const allowReplayInt = ['IntFullSearch', 'IntInbNew', 'IntInbAck', 'IntInbArc'];
        const allowReplayExt = ['ExtFullSearch', 'ExtInbNew', 'ExtInbAck', 'ExtInbArc'];
        const fullSearch = ['ExtFullSearch', 'IntFullSearch'];
        // Print Barcode
        if (correspondData.CorrespondenceCode !== '') {
            this.PrintBarcode = true;
        }
        // Reply Internal
        if (allowReplayInt.indexOf(reportType) > -1) {
            this.ReplyIntern = true;
        }

        // Reply External
        if (allowReplayExt.indexOf(reportType) > -1) {
            this.ReplyExtern = true;
        }

        // Copy
        if (allowCopy.indexOf(reportType) > -1) {
            this.Copy = true;
        }
        // Archive
        if (allowsArch.indexOf(reportType) > -1) {
            this.Archive = true;
        }
        // Recall
        if (allowsRecall.indexOf(reportType) > -1) {
            this.Recall = true;
        } else if (fullSearch.indexOf(reportType) > -1 && correspondData.SubWorkTask_TaskID.toString() !== '0') {
            this.Recall = true;
        }
        // MR Recall
        if (allowMRRecall.indexOf(reportType) > -1
            && correspondData.CorrespondenceFlowType === '1'
            && ['32', '0', '?', ''].indexOf(correspondData.SubWorkTask_TaskID.toString()) > -1
        ) { this.MRRecall = true; }
        // Complete
        // Reply Transfer
        if (allowsCompl.indexOf(reportType) > -1) {
            this.Complete = true;
            if (correspondData.transID.toString() !== '0') {
                this.ReplyTrans = true;
            }
        }
        // Return to AS
        if (reportType === 'ExtInbAck' && correspondData.performer07.toString() === '1') {
            this.ReturnToAS = true;
        }

        return this;
    }

}
