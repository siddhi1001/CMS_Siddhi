import { IMDFilingPlanModel } from '../../models/metadata.model';

export enum ViewType {
  Year = 'year',
  Location = 'location',
  Cabinet = 'cabinet',
  Row = 'row',
  Shelf = 'shelf',
  File = 'file'
}

export interface IDropdownOptionData {
  name: ViewType;
  label: string;
  control: string;
  getListMethod: string;
  getDataMethod: string;
  attributesToReset: ViewType[];
  selectList: IMDFilingPlanModel[];
}

export class DialogParams {
  parent: string;
  name: string;
  name_ar: string;
  editHeader: string;
  addHeader: string;
  setMethod: string;
  templateName: string;
}

export class DropdownOptionData implements IDropdownOptionData {
  name: ViewType;
  label: string;
  control: string;
  getListMethod: string;
  getDataMethod: string;
  attributesToReset: ViewType[];
  selectList: IMDFilingPlanModel[];

  constructor(private ddType: ViewType) {
    this.init();
  }

  private init() {
    switch (this.ddType) {
      case ViewType.Year:
        this.name = ViewType.Year;
        this.label = 'Select Year';
        this.control = 'Year';
        this.getListMethod = 'getYearList';
        this.getDataMethod = 'getLocation';
        this.attributesToReset = [ViewType.Location, ViewType.Cabinet, ViewType.Row, ViewType.Shelf];
        break;
      case ViewType.Location:
        this.name = ViewType.Location;
        this.label = 'Select Physical Location';
        this.control = 'Location';
        this.getListMethod = 'getLocationList';
        this.getDataMethod = 'getCabinet';
        this.attributesToReset = [ViewType.Cabinet, ViewType.Row, ViewType.Shelf];
        break;
      case ViewType.Cabinet:
        this.name = ViewType.Cabinet;
        this.label = 'Select Cabinet';
        this.control = 'Cabinet';
        this.getListMethod = 'getCabinetList';
        this.getDataMethod = 'getRow';
        this.attributesToReset = [ViewType.Row, ViewType.Shelf];
        break;
      case ViewType.Row:
        this.name = ViewType.Row;
        this.label = 'Select Row';
        this.control = 'Row';
        this.getListMethod = 'getRowList';
        this.getDataMethod = 'getShelf';
        this.attributesToReset = [ViewType.Shelf];
        break;
      case ViewType.Shelf:
        this.name = ViewType.Shelf;
        this.label = 'Select Shelf';
        this.control = 'Shelf';
        this.getListMethod = 'getShelfList';
        this.getDataMethod = 'getFile';
        this.attributesToReset = [];
        break;
      default:
    }
  }
}

export class FilingPlanView {
  dropDownData: IDropdownOptionData[];
  dialogParams = new DialogParams();
  deleteCheckTemplate: string;

  constructor(private dataType: string) {
    this.init();
  }

  private init() {
    switch (this.dataType) {
      case ViewType.Location:
        this.dialogParams.parent = 'year';
        this.dialogParams.name = 'physical_location';
        this.dialogParams.name_ar = 'physical_location_ar';
        this.dialogParams.setMethod = 'setLocation';
        this.dialogParams.editHeader = 'edit_physical_location';
        this.dialogParams.addHeader = 'add_physical_location';
        this.dialogParams.templateName = 'PhysicalLocation';
        this.deleteCheckTemplate = 'DelPhysicalLocation';
        this.dropDownData = [
          new DropdownOptionData(ViewType.Year),
        ];
        break;
      case ViewType.Cabinet:
        this.dialogParams.parent = 'physical_location';
        this.dialogParams.name = 'cabinet';
        this.dialogParams.name_ar = 'cabinet_ar';
        this.dialogParams.setMethod = 'setCabinet';
        this.dialogParams.editHeader = 'edit_cabinet';
        this.dialogParams.addHeader = 'add_cabinet';
        this.dialogParams.templateName = 'Cabinet';
        this.deleteCheckTemplate = 'DelCabinet';
        this.dropDownData = [
          new DropdownOptionData(ViewType.Year),
          new DropdownOptionData(ViewType.Location),
        ];
        break;
      case ViewType.Row:
        this.dialogParams.parent = 'cabinet';
        this.dialogParams.name = 'row';
        this.dialogParams.name_ar = 'row_ar';
        this.dialogParams.setMethod = 'setRow';
        this.dialogParams.editHeader = 'edit_row';
        this.dialogParams.addHeader = 'add_row';
        this.dialogParams.templateName = 'Row';
        this.deleteCheckTemplate = 'DelRow';
        this.dropDownData = [
          new DropdownOptionData(ViewType.Year),
          new DropdownOptionData(ViewType.Location),
          new DropdownOptionData(ViewType.Cabinet),
        ];
        break;
      case ViewType.Shelf:
        this.dialogParams.parent = 'row';
        this.dialogParams.name = 'shelf';
        this.dialogParams.name_ar = 'shelf_ar';
        this.dialogParams.setMethod = 'setShelf';
        this.dialogParams.editHeader = 'edit_shelf';
        this.dialogParams.addHeader = 'add_shelf';
        this.dialogParams.templateName = 'Shelf';
        this.deleteCheckTemplate = 'DelShelf';
        this.dropDownData = [
          new DropdownOptionData(ViewType.Year),
          new DropdownOptionData(ViewType.Location),
          new DropdownOptionData(ViewType.Cabinet),
          new DropdownOptionData(ViewType.Row)
        ];
        break;
      case ViewType.File:
        this.dialogParams.parent = 'shelf';
        this.dialogParams.name = 'file';
        this.dialogParams.name_ar = 'file_ar';
        this.dialogParams.setMethod = 'setFile';
        this.dialogParams.editHeader = 'edit_file';
        this.dialogParams.addHeader = 'add_file';
        this.dialogParams.templateName = 'File';
        this.dropDownData = [
          new DropdownOptionData(ViewType.Year),
          new DropdownOptionData(ViewType.Location),
          new DropdownOptionData(ViewType.Cabinet),
          new DropdownOptionData(ViewType.Row),
          new DropdownOptionData(ViewType.Shelf)
        ];
        break;
      default:
    }
  }
}
