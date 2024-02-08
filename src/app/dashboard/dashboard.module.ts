import { NgModule } from '@angular/core';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { MatNativeDateModule, MatTabsModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ChartsModule } from 'ng2-charts';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SideNavigationComponent } from './side-navigation/side-navigation.component';
import { NewInboundComponent } from './external/new-inbound/new-inbound.component';
import { ExternalComponent } from './external/external.component';
import { InternalComponent } from './internal/internal.component';
import { MatSortModule } from '@angular/material/sort';
import { ExternalDashboardComponent } from './external/external-dashboard/external-dashboard.component';
import { MailDetailView } from './base-classes/base-dashboard-full/base-dashboard-full.component';
import { InProgressComponent } from './external/in-progress-inbounds/in-progress.component';
import { AchievedInboundsComponent } from './external/achieved-inbounds/achieved-inbounds.component';
import { NewOutboundComponent } from './external/new-outbound/new-outbound.component';
import { InProgressOutboundComponent } from './external/in-progress-outbound/in-progress-outbound.component';
import { AchievedOutboundComponent } from './external/achieved-outbound/achieved-outbound.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxFileDropModule } from 'ngx-file-drop';
import { Dashboardfilterattribute } from 'src/app/dashboard/pipes/dashbaordfilterattribute.pipe';
import { CorrespondenceDetailComponent } from './external/correspondence-detail/correspondence-detail.component';
import { SearchfilterComponent } from './searchfilter/searchfilter.component';
import { TransferDialogBox } from './external/correspondence-detail/correspondence-transfer-dialog/correspondence-transfer-dialog.component';
import { WorkflowHistoryDialogBox } from './workflow-history/workflow-history.component';
import { InternalDashboardComponent } from './internal/internal-dashboard/internal-dashboard.component';
import { NewIntInboundComponent } from './internal/new-intinbound/new-intinbound.component';
import { InprogressIntComponent } from './internal/in-progress-intinbounds/in-progress-intinbounds.component';
import { AchievedIntInboundComponent } from './internal/achieved-intinbounds/achieved-intinbounds.component';
import { NewIntOutboundComponent } from './internal/new-intoutbound/new-intoutbound.component';
import { InprogressIntOutboundComponent } from './internal/in-progress-intioutbounds/in-progress-intioutbounds.component';
import { AchievedIntOutboundComponent } from './internal/achieved-intoutbounds/achieved-intoutbounds.component';
import { ConfirmationDialogComponent } from './dialog-boxes/confirmation-dialog/confirmation-dialog.component';

import { CreateCorrespondenceComponent } from './create-correspondence/create-correspondence.component';
import { ExternalIncoming } from './create-correspondence/external-incoming/external-incoming.component';
import { MessageDialogComponent } from './dialog-boxes/message-dialog/message-dialog.component';
import { CompleteDialogComponent } from './dialog-boxes/complete-dialog/complete-dialog.component';
import { TransferRecallDialogComponent } from './dialog-boxes/transfer-recall-dialog/transfer-recall-dialog.component';
import { ErrorHandlerFctsService } from './services/error-handler-fcts.service';
import { TransferReplyDialogComponent } from './dialog-boxes/transfer-reply-dialog/transfer-reply-dialog.component';
import { SafePipe } from './pipes/safe.pipe';

import { BaseDashboardFullComponent } from './base-classes/base-dashboard-full/base-dashboard-full.component';
import { BaseDashboardComponent } from './base-classes/base-dashboard/base-dashboard.component';
import { BaseDashboardActiveComponent } from './base-classes/base-dashboard-active/base-dashboard-active.component';
import { DocumentViewerComponent } from './external/documentviewer/documentviewer.component';
import { MailroomsComponent } from './mailroom/mailroom.component';
import { MailroomDasnboardComponent } from './mailroom/mailroom-dasnboard/mailroom-dasnboard.component';
import { MrArchievedInboundsComponent } from './mailroom/mr-archieved-inbounds/mr-archieved-inbounds.component';
import { MrArchievedOutboundsComponent } from './mailroom/mr-archieved-outbounds/mr-archieved-outbounds.component';
import { MrNewInboundsComponent } from './mailroom/mr-new-inbounds/mr-new-inbounds.component';
import { MrDispatchedInboundsComponent } from './mailroom/mr-dispatched-inbounds/mr-dispatched-inbounds.component';
import { MrAcknowledgedInboundsComponent } from './mailroom/mr-acknowledged-inbounds/mr-acknowledged-inbounds.component';
import { MrNewOutboundsComponent } from './mailroom/mr-new-outbounds/mr-new-outbounds.component';
import { MrDispatchedOutboundsComponent } from './mailroom/mr-dispatched-outbounds/mr-dispatched-outbounds.component';
import { MrAcknowledgedOutboundsComponent } from './mailroom/mr-acknowledged-outbounds/mr-acknowledged-outbounds.component';
import { TransferReturntoasDialogComponent } from './dialog-boxes/transfer-returntoas-dialog/transfer-returntoas-dialog.component';
import { CorrespondenceFormStepComponent } from './external/correspondence-form-step/correspondence-form-step.component';

import { NgxPrintModule } from 'ngx-print';
import { NgxBarcodeModule } from 'ngx-barcode';
import { NotificationComponent } from './dialog-boxes/notification/notification.component';
import { NotificationService } from './services/notification.service';
import { PreventDoubleSubmitModule } from 'ngx-prevent-double-submission';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { BaseCorrespondenceComponent } from './base-classes/base-correspondence-csactions/base-correspondence.component';
import { ExternalOutgoing } from './create-correspondence/external-outgoing/external-outgoing.component';
import { InternalOutgoing } from './create-correspondence/internal-outgoing/internal-outgoing.component';
import { DatePipe } from '@angular/common';
import { CorrespondenceFormStepExtOutComponent } from './external/correspondence-form-step-extout/correspondence-form-step-extout.component';
import { CorrespondenceFormStepIntOutComponent } from './internal/correspondence-form-step-intout/correspondence-form-step-intout.component';
import { SendBackDialogComponent } from './dialog-boxes/send-back-dialog/send-back-dialog.component';

import { CommentDialogComponent } from './comments/comment-dialog/comment-dialog.component';
import { CommentsTreeComponent } from './comments/comments-tree/comments-tree.component';
import { CommentSectionComponent } from './comments/comment-section/comment-section.component';
/* import { multiLanguageTranslatorModule, multiLanguageTranslatorPipe } from 'src/assets/translator/index'; */
import { BaseDashboardArchiveComponent } from './base-classes/base-dashboard-archive/base-dashboard-archive.component';
import { UserInfoComponent } from './side-navigation/user-info/user-info.component';
import { ProxyInfoComponent } from './side-navigation/proxy-info/proxy-info.component';
import { CurrentUserPhotoComponent } from './side-navigation/current-user-photo/current-user-photo.component';
import { PerformerInfoDialogComponent } from './dialog-boxes/performer-info-dialog/performer-info-dialog.component';

import { ProfileComponent } from './side-navigation/profile/profile.component';
import { NewDelegationComponent } from './side-navigation/new-delegation/new-delegation.component';
import { CurrentDelegationsComponent } from './side-navigation/current-delegations/current-delegations.component';
import { DelegationReportComponent } from './side-navigation/delegation-report/delegation-report.component';
import { LinkedCorrDialogComponent } from './dialog-boxes/linked-corr-dialog/linked-corr-dialog.component';
import { FilesSelectComponent } from './shared-components/files-select/files-select.component';
import { LinkedCorrespondencesComponent } from './shared-components/linked-correspondences/linked-correspondences.component';
import { FullSearchComponent } from './shared-components/full-search/full-search.component';
import { DownloadAttachtmentsDialogComponent } from './dialog-boxes/download-attachtments-dialog/download-attachtments-dialog.component'
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MultipleApproveComponent } from './shared-components/multiple-approve/multiple-approve.component';
import { AddApproverDialogComponent } from './dialog-boxes/add-approver-dialog/add-approver-dialog.component';
import { DistributionComponent } from './shared-components/distribution/distribution.component';
import { AngularResizedEventModule } from 'angular-resize-event';
import { DistributionChartComponent } from './shared-components/distribution-chart/distribution-chart.component';
import { DistributionDialogComponent } from './dialog-boxes/distribution-dialog/distribution-dialog.component';
import { SelectTeamDialogComponent } from './dialog-boxes/select-team-dialog/select-team-dialog.component';
import { SharedImportsModule } from './shared-imports.module';

@NgModule({
  imports: [
    DashboardRoutingModule,
    MalihuScrollbarModule.forRoot(),
    ChartsModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatSortModule,
    HttpClientModule,
    MatTabsModule,
    NgxFileDropModule,
    NgxPrintModule,
    NgxBarcodeModule,
    PreventDoubleSubmitModule,
    NgScrollbarModule,
    MatProgressBarModule,
    AngularResizedEventModule,
    SharedImportsModule,
  ],
  declarations: [
    DashboardComponent,
    SideNavigationComponent,
    NewInboundComponent,
    NewIntInboundComponent,
    ExternalComponent,
    InternalComponent,
    ExternalDashboardComponent,
    InternalDashboardComponent,
    MailDetailView,
    InProgressComponent,
    InprogressIntComponent,
    AchievedInboundsComponent,
    AchievedIntInboundComponent,
    AchievedIntOutboundComponent,
    NewOutboundComponent,
    NewIntOutboundComponent,
    InProgressOutboundComponent,
    InprogressIntOutboundComponent,
    AchievedOutboundComponent,
    SafePipe,
    Dashboardfilterattribute,
    CorrespondenceDetailComponent,
    SearchfilterComponent,
    TransferDialogBox,
    WorkflowHistoryDialogBox,
    CreateCorrespondenceComponent,
    ConfirmationDialogComponent,
    MessageDialogComponent,
    CompleteDialogComponent,
    TransferRecallDialogComponent,
    TransferReplyDialogComponent,
    ExternalIncoming,
    BaseDashboardFullComponent,
    BaseDashboardComponent,
    BaseDashboardActiveComponent,
    BaseDashboardArchiveComponent,
    DocumentViewerComponent,
    MailroomsComponent,
    MailroomDasnboardComponent,
    MrArchievedInboundsComponent,
    MrArchievedOutboundsComponent,
    MrNewInboundsComponent,
    MrDispatchedInboundsComponent,
    MrAcknowledgedInboundsComponent,
    MrNewOutboundsComponent,
    MrDispatchedOutboundsComponent,
    MrAcknowledgedOutboundsComponent,
    TransferReturntoasDialogComponent,
    CorrespondenceFormStepComponent,
    NotificationComponent,
    BaseCorrespondenceComponent,
    ExternalOutgoing,
    CorrespondenceFormStepComponent,
    CorrespondenceFormStepExtOutComponent,
    SendBackDialogComponent,
    CommentDialogComponent,
    CommentsTreeComponent,
    CommentSectionComponent,
    InternalOutgoing,
    CorrespondenceFormStepIntOutComponent,
    UserInfoComponent,
    ProxyInfoComponent,
    CurrentUserPhotoComponent,
    PerformerInfoDialogComponent,
    CurrentUserPhotoComponent,
    ProfileComponent,
    NewDelegationComponent,
    CurrentDelegationsComponent,
    DelegationReportComponent,
    LinkedCorrDialogComponent,
    FilesSelectComponent,
    LinkedCorrespondencesComponent,
    FullSearchComponent,
    DownloadAttachtmentsDialogComponent,
    MultipleApproveComponent,
    AddApproverDialogComponent,
    DistributionComponent,
    DistributionChartComponent,
    DistributionDialogComponent,
    SelectTeamDialogComponent
  ],
  entryComponents: [
    MailDetailView,
    WorkflowHistoryDialogBox,
    TransferDialogBox,
    ConfirmationDialogComponent,
    MessageDialogComponent,
    CompleteDialogComponent,
    TransferRecallDialogComponent,
    TransferReplyDialogComponent,
    TransferReturntoasDialogComponent,
    SendBackDialogComponent,
    CommentDialogComponent,
    PerformerInfoDialogComponent,
    CommentDialogComponent,
    ProfileComponent,
    NewDelegationComponent,
    CurrentDelegationsComponent,
    DelegationReportComponent,
    LinkedCorrDialogComponent,
    DownloadAttachtmentsDialogComponent,
    AddApproverDialogComponent,
    DistributionDialogComponent,
    SelectTeamDialogComponent
  ],
  providers: [ErrorHandlerFctsService, NotificationService, DatePipe]
})
export class DashboardModule { }

