import { CorrespondenenceDetailsModel } from '../../models/CorrespondenenceDetails.model';
import { AppLoadConstService } from 'src/app/app-load-const.service';


interface CorrButtonsList {
    corrArchive: boolean;
    corrComplete: boolean;
    corrTrReply: boolean;
    corrSave: boolean;
  }

  export class ShowButtons implements CorrButtonsList {
    private _globalConstants = this._appLoadConstService.getConstants();
    private _corrArchive: boolean;
    private _corrComplete: boolean;
    private _corrTrReply: boolean;
    private _corrSave: boolean;

    public get corrArchive(): boolean {
      return this._corrArchive;
    }
    public set corrArchive(value: boolean) {
      this._corrArchive = value;
    }

    public get corrTrReply(): boolean {
      return this._corrTrReply;
    }
    public set corrTrReply(value: boolean) {
      this._corrTrReply = value;
    }

    public get corrSave(): boolean {
      return this._corrSave;
    }
    public set corrSave(value: boolean) {
      this._corrSave = value;
    }

    public get corrComplete(): boolean {
      return this._corrComplete;
    }
    public set corrComplete(value: boolean) {
      this._corrComplete = value;
    }

    constructor(
      private _appLoadConstService: AppLoadConstService
    ) {
      this._setInitData();
    }

    private _setInitData() {
      this.corrArchive = false;
      this.corrComplete = false;
      this.corrTrReply = false;
      this.corrSave = false;
    }

    public showButton(correspondenceData: CorrespondenenceDetailsModel) {
     // console.log(correspondenceData);
     this._setInitData();
     if (correspondenceData.ID.toString() !== '0' ) {
         if (correspondenceData.holdSecretaryID.toString() === this._globalConstants.general.ProxyUserID.toString()) {
          // btnComplete, btnArchive, btnSave, btnReply
          correspondenceData.Status.toString() === '0' ? this.corrComplete = true : correspondenceData.Status.toString() === '1' ? this.corrArchive = true : this.corrComplete = false;
          correspondenceData.TransferType.toString() === '10' && correspondenceData.Status.toString() === '0' ? this.corrSave = true : this.corrSave = false;
          correspondenceData.Status.toString() === '0' ? this.corrTrReply = true : this.corrTrReply = false;
         }
      } else if (correspondenceData.isCC.toString() === '1' ) {
        // btnComplete, btnArchive
        correspondenceData.CCstatus === 'Archived' ?  this.corrArchive = false : this.corrArchive = true;
        correspondenceData.CCstatus == null ? this.corrComplete = true : this.corrComplete = false;
      } else {
        correspondenceData.perform07.toString() === '1' && correspondenceData.CCstatus !== 'Archived'
          ? this.corrArchive = true : this.corrArchive = false;
      }
      // console.log(this);
    }

  }
