import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { ExternalComponent } from "./external/external.component";
import { NewInboundComponent } from "./external/new-inbound/new-inbound.component";
import { InProgressComponent } from "./external/in-progress-inbounds/in-progress.component";
import { AchievedInboundsComponent } from "./external/achieved-inbounds/achieved-inbounds.component";
import { ExternalDashboardComponent } from "./external/external-dashboard/external-dashboard.component";
import { NewOutboundComponent } from "./external/new-outbound/new-outbound.component";
import { InProgressOutboundComponent } from "./external/in-progress-outbound/in-progress-outbound.component";
import { AchievedOutboundComponent } from "./external/achieved-outbound/achieved-outbound.component";
import { CorrespondenceDetailComponent } from "./external/correspondence-detail/correspondence-detail.component";
import { InternalComponent } from "./internal/internal.component";
import { InternalDashboardComponent } from "./internal/internal-dashboard/internal-dashboard.component";
import { NewIntInboundComponent } from "./internal/new-intinbound/new-intinbound.component";
import { InprogressIntComponent } from "./internal/in-progress-intinbounds/in-progress-intinbounds.component";
import { AchievedIntInboundComponent } from "./internal/achieved-intinbounds/achieved-intinbounds.component";
import { NewIntOutboundComponent } from "./internal/new-intoutbound/new-intoutbound.component";
import { InprogressIntOutboundComponent } from "./internal/in-progress-intioutbounds/in-progress-intioutbounds.component";
import { AchievedIntOutboundComponent } from "./internal/achieved-intoutbounds/achieved-intoutbounds.component";
import { CreateCorrespondenceComponent } from "./create-correspondence/create-correspondence.component";
import { ExternalIncoming } from "./create-correspondence/external-incoming/external-incoming.component";

import { MailroomsComponent } from './mailroom/mailroom.component';
import { MailroomDasnboardComponent } from './mailroom/mailroom-dasnboard/mailroom-dasnboard.component';
import { MrArchievedOutboundsComponent } from './mailroom/mr-archieved-outbounds/mr-archieved-outbounds.component';
import { MrArchievedInboundsComponent } from './mailroom/mr-archieved-inbounds/mr-archieved-inbounds.component';
import { MrNewInboundsComponent } from './mailroom/mr-new-inbounds/mr-new-inbounds.component';
import { MrNewOutboundsComponent } from './mailroom/mr-new-outbounds/mr-new-outbounds.component';
import { MrAcknowledgedInboundsComponent } from './mailroom/mr-acknowledged-inbounds/mr-acknowledged-inbounds.component';
import { MrDispatchedInboundsComponent } from './mailroom/mr-dispatched-inbounds/mr-dispatched-inbounds.component';
import { MrDispatchedOutboundsComponent } from './mailroom/mr-dispatched-outbounds/mr-dispatched-outbounds.component';
import { MrAcknowledgedOutboundsComponent } from './mailroom/mr-acknowledged-outbounds/mr-acknowledged-outbounds.component';
import { CorrespondenceFormStepComponent } from './external/correspondence-form-step/correspondence-form-step.component';
import { ExternalOutgoing } from './create-correspondence/external-outgoing/external-outgoing.component';
import { InternalOutgoing } from './create-correspondence/internal-outgoing/internal-outgoing.component';
import { CorrespondenceFormStepExtOutComponent } from './external/correspondence-form-step-extout/correspondence-form-step-extout.component';
import { CorrespondenceFormStepIntOutComponent } from './internal/correspondence-form-step-intout/correspondence-form-step-intout.component';
import { IsadminGuard } from 'src/app/dashboard/administration/isadmin.guard';

const dashboardRoutes: Routes = [
  {
    path: "",
    component: DashboardComponent,
    children: [
      {
        path: "",
        children: [
          {
            path: "internal",
            component: InternalComponent,
            children: [
              {
                path: "",
                children: [
                  {
                    path: "new-intinbounds",
                    component: NewIntInboundComponent,
                  },
                  {
                    path: "inProgress-intinbounds",
                    component: InprogressIntComponent,
                  },
                  {
                    path: "archieved-intinbounds",
                    component: AchievedIntInboundComponent,
                  },
                  {
                    path: "new-intoutbounds",
                    component: NewIntOutboundComponent,
                  },
                  {
                    path: "inProgress-intoutbounds",
                    component: InprogressIntOutboundComponent,
                  },
                  {
                    path: "archieved-intoutbounds",
                    component: AchievedIntOutboundComponent,
                  },
                  {
                    path: "correspondence-detail",
                    component: CorrespondenceDetailComponent,
                  },
                  {
                    path: "correspondence-form-step-intout",
                    component: CorrespondenceFormStepIntOutComponent,
                  }, // Done
                  { path: "", component: InternalDashboardComponent },
                ],
              },
            ],
          },
          {
            path: "create",
            component: CreateCorrespondenceComponent,
            children: [
              {
                path: "",
                children: [
                  {
                    path: "new-external-incoming",
                    component: ExternalIncoming,
                  },
                  {
                    path: "new-external-outgoing",
                    component: ExternalOutgoing,
                  },
                  {
                    path: "new-internal-outgoing",
                    component: InternalOutgoing,
                  },
                ],
              },
            ],
          },
          {
            path: "external",
            component: ExternalComponent,
            children: [
              {
                path: "",
                children: [
                  { path: "new-inbounds", component: NewInboundComponent },
                  {
                    path: "inProgress-inbounds",
                    component: InProgressComponent,
                  },
                  {
                    path: "archieved-inbounds",
                    component: AchievedInboundsComponent,
                  },
                  { path: "new-outbounds", component: NewOutboundComponent },
                  {
                    path: "inProgress-outbounds",
                    component: InProgressOutboundComponent,
                  },
                  {
                    path: "archieved-outbounds",
                    component: AchievedOutboundComponent,
                  },
                  {
                    path: "correspondence-detail",
                    component: CorrespondenceDetailComponent,
                  },
                  {
                    path: "correspondence-form-step-inc",
                    component: CorrespondenceFormStepComponent,
                  },
                  {
                    path: "correspondence-form-step-out",
                    component: CorrespondenceFormStepExtOutComponent,
                  },
                  { path: "", component: ExternalDashboardComponent },
                ],
              },
            ],
          },
          {
            path: "mailroom",
            component: MailroomsComponent,
            children: [
              {
                path: "",
                children: [
                  {
                    path: "mr-new-inbounds",
                    component: MrNewInboundsComponent,
                  },
                  {
                    path: "mr-dispatched-inbounds",
                    component: MrDispatchedInboundsComponent,
                  },
                  {
                    path: "mr-acknowledged-inbounds",
                    component: MrAcknowledgedInboundsComponent,
                  },
                  {
                    path: "mr-archieved-inbounds",
                    component: MrArchievedInboundsComponent,
                  },
                  {
                    path: "mr-new-outbounds",
                    component: MrNewOutboundsComponent,
                  },
                  {
                    path: "mr-dispatched-outbounds",
                    component: MrDispatchedOutboundsComponent,
                  },
                  {
                    path: "mr-acknowledged-outbounds",
                    component: MrAcknowledgedOutboundsComponent,
                  },
                  {
                    path: "mr-archieved-outbounds",
                    component: MrArchievedOutboundsComponent,
                  },
                  {
                    path: "correspondence-detail",
                    component: CorrespondenceDetailComponent,
                  },
                  {
                    path: "correspondence-form-step-inc",
                    component: CorrespondenceFormStepComponent,
                  },
                  {
                    path: "correspondence-form-step-out",
                    component: CorrespondenceFormStepExtOutComponent,
                  },
                  { path: "", component: MailroomDasnboardComponent },
                ],
              },
            ],
          },
          {
            path: 'administration',
            loadChildren: './administration/administration.module#AdministrationModule',
            /* canActivate: [IsadminGuard] */
            canLoad: [IsadminGuard]
          },
          { path: '', redirectTo: '/dashboard/external', pathMatch: 'full' },

          { path: '**', redirectTo: '/dashboard/external', component: ExternalComponent },


          {
            path: "**",
            redirectTo: "/dashboard/external",
            component: ExternalComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(dashboardRoutes),
    // , RouterModule.forRoot(dashboardRoutes, {onSameUrlNavigation: 'reload'})
  ],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
