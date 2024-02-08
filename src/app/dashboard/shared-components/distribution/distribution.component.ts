import { Component, OnInit, Input, HostListener, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CorrespondenceDetailsService } from 'src/app/dashboard/services/correspondence-details.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ResizedEvent } from 'angular-resize-event';
import { FCTSDashBoard } from 'src/environments/environment';
import { CorrespondenenceDetailsModel, TableStructureParameters } from 'src/app/dashboard/models/CorrespondenenceDetails.model';
import { DistributionDataParameters } from 'src/app/dashboard/models/distribution.model';


@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class DistributionComponent implements OnInit {
  basehref: String = FCTSDashBoard.BaseHref;
  @Input() taskID: string;
  @Input() correspondenceData: CorrespondenenceDetailsModel;
  @Output() showDistributionChart = new EventEmitter<any>();
  distributionData: DistributionDataParameters[];
  distTableStructureDetails: TableStructureParameters[];
  tableWidth: number;

  distDisplayedColumns: string[];
  distDisplayedDetails: string[];

  firstLoadSpinner = true;

  @ViewChild('tableContainer') container: ElementRef;

  distTableStructure: TableStructureParameters[] = [
    { 'columnDef': 'Icon', 'columnName': '', 'priority': 1 },
    { 'columnDef': 'From', 'columnName': 'From', 'priority': 1 },
    { 'columnDef': 'To', 'columnName': 'To', 'priority': 1 },
    { 'columnDef': 'Role', 'columnName': 'DM Role', 'priority': 5 },
    { 'columnDef': 'Seq', 'columnName': 'Seq', 'priority': 2 },
    { 'columnDef': 'Priority', 'columnName': 'Priority', 'priority': 2 },
    { 'columnDef': 'TransferDate', 'columnName': 'Transfer Date', 'priority': 6 },
    { 'columnDef': 'DueDate', 'columnName': 'Due Date', 'priority': 4 },
    { 'columnDef': 'Purpose', 'columnName': 'Purpose', 'priority': 7 },
    { 'columnDef': 'Notes', 'columnName': 'Notes', 'priority': 7 },
    { 'columnDef': 'NotesComplete', 'columnName': 'Notes completion', 'priority': 7 }
  ];

  constructor(
    private correspondenceDetailsService: CorrespondenceDetailsService,
    private errorHandlerFctsService: ErrorHandlerFctsService,
  ) { }

  ngOnInit() {
    this.tableWidth = this.container.nativeElement.clientWidth;
    this.displayColumnsForm(this.tableWidth);
  }

  showAddButton() {
    if (Number(this.taskID) > 0) {
      return true;
    } else if (Number(this.correspondenceData.holdSecretaryID) > 0
      && Number(this.correspondenceData.parentID) === 0
      && Number(this.correspondenceData.DistCode) === 0) {
      return true;
    } else {
      return false;
    }
  }

  distributionChart() {
    this.showDistributionChart.next();
  }

  onResized(event: ResizedEvent) {
    this.tableWidth = event.newWidth;
    this.displayColumnsForm(event.newWidth);
  }

  getDistributionData(existenceСheck: boolean) {
    if (!this.distributionData || !existenceСheck) {
      this.correspondenceDetailsService.getDistributionData(this.correspondenceData.VolumeID).subscribe(
        response => {
          this.distributionData = response;
          this.firstLoadSpinner = false;
        },
        responseError => {
          this.errorHandlerFctsService.handleError(responseError).subscribe();
          this.firstLoadSpinner = false;
        }
      );
    }
  }

  displayColumnsForm(width: number): void {
    const priority = this.correspondenceDetailsService.definePriorityToShow(width);
    this.distDisplayedColumns = [];
    this.distDisplayedDetails = [];
    this.distTableStructure.forEach(element => {
      element.priority > priority ? this.distDisplayedDetails.push(element.columnDef) : this.distDisplayedColumns.push(element.columnDef);
    });
    this.distTableStructureDetails = this.distTableStructure.filter((element) => {
      return this.distDisplayedDetails.indexOf(element.columnDef) !== -1;
    });
  }
}
