import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { AdministrationComponent } from "./administration.component";
import { OrgmdRolesComponent } from "./orgmd/orgmd-roles/orgmd-roles.component";
import { EditOrganizationalChartComponent } from "./orgmd/edit-organizational-chart/edit-organizational-chart.component";
import { ORGMDMainComponent } from "./orgmd/edit-org-chart-main/edit-org-chart-main.component";
import { MainPageComponent } from "./main-page/main-page.component";
import { OrgmdRoleUsersComponent } from "./orgmd/orgmd-roles/orgmd-role-users/orgmd-role-users.component";
import { OrgChartUsersComponent } from "./orgmd/edit-organizational-chart/org-chart-users/org-chart-users.component";
import { EditOrgChartRolesComponent } from "./orgmd/edit-organizational-chart/edit-org-chart-roles/edit-org-chart-roles.component";
import { FctsSpecificRolesComponent } from "./fcts-roles-setup/fcts-specific-roles/fcts-specific-roles.component";
import { FctsRolesSetupMainComponent } from "./fcts-roles-setup/fcts-roles-setup-main/fcts-roles-setup-main.component";
import { FctsSpecificRolesUsersComponent } from "./fcts-roles-setup/fcts-specific-roles/fcts-specific-roles-users/fcts-specific-roles-users.component";
import { FctsCommonRolesComponent } from "./fcts-roles-setup/fcts-common-roles/fcts-common-roles.component";
import { FctsCommonRoleUsersComponent } from "./fcts-roles-setup/fcts-common-roles/fcts-common-roles-users/fcts-common-roles-users.component";
import { EcmdMainComponent } from "./ecmd/ecmd-main/ecmd-main.component";
import { EcmdRecordsManagementComponent } from "./ecmd/ecmd-records-management/ecmd-records-management.component";
import { OrgmdTeamManagementComponent } from "./orgmd/orgmd-team-management/orgmd-team-management.component";
import { OrgmdTeamUsersComponent } from "./orgmd/orgmd-team-management/orgmd-team-users/orgmd-team-users.component";
import { CreateDelegationComponent } from "./delegation-management/create-delegation/create-delegation.component";
import { CurrentDelegationsComponent } from "./delegation-management/current-delegations/current-delegations.component";
import { DelegationsReportComponent } from "./delegation-management/delegations-report/delegations-report.component";
import { UnitDefinitionComponent } from "./orgmd/unit-definition/unit-definition.component";
import { EntityRelationsComponent } from "./orgmd/entity-relations/entity-relations.component";
import { EcmdRolesComponent } from "./ecmd/ecmd-roles/ecmd-roles.component";
import { EcmdRoleUsersComponent } from "./ecmd/ecmd-roles/ecmd-role-users/ecmd-role-users.component";
import { PurposesComponent } from "./metadata/purposes/purposes.component";
import { PriorityComponent } from "./metadata/priority/priority.component";
import { FilingPlanComponent } from "./metadata/filing-plan/filing-plan.component";
import { MdSimpleViewComponent } from "./metadata/md-simple-view/md-simple-view.component";
import { YearReceiverComponent } from "./metadata/year-receiver/year-receiver.component";
import { RejectReasonsComponent } from "./metadata/reject-reasons/reject-reasons.component";
import { ArchiveReportMainComponent } from "./archivereports/archive-reports-main.component";
import { GeneralInboundCorrReport } from "./archivereports/general-inbound-corr-report/general-inbound-corr-report.component";

const routes: Routes = [
  {
    path: "",
    component: AdministrationComponent,
    children: [
      {
        path: "",
        component: MainPageComponent,
      },
      {
        path: "orgmd-roles",
        component: ORGMDMainComponent,
        children: [
          { path: "", component: OrgmdRolesComponent },
          { path: "role-users", component: OrgmdRoleUsersComponent },
        ],
      },
      {
        path: "orgmd-team-management",
        component: ORGMDMainComponent,
        children: [
          { path: "", component: OrgmdTeamManagementComponent },
          { path: "users", component: OrgmdTeamUsersComponent },
        ],
      },
      {
        path: "orgmd-team-management",
        component: ORGMDMainComponent,
        children: [
          { path: "", component: OrgmdTeamManagementComponent },
          { path: "users", component: OrgmdTeamUsersComponent },
        ],
      },
      {
        path: "unit-definition",
        component: UnitDefinitionComponent,
      },
      {
        path: "entity-relations",
        component: EntityRelationsComponent,
      },
      {
        path: "edit-org-chart",
        component: ORGMDMainComponent,
        children: [
          { path: "", component: EditOrganizationalChartComponent },
          { path: "users", component: OrgChartUsersComponent },
          { path: "unit-roles", component: EditOrgChartRolesComponent },
        ],
      },
      {
        path: "ecmd-roles",
        component: EcmdMainComponent,
        children: [
          { path: "", component: EcmdRolesComponent },
          { path: "users", component: EcmdRoleUsersComponent },
        ],
      },
      {
        path: "ecmd-records-management",
        component: EcmdMainComponent,
        children: [{ path: "", component: EcmdRecordsManagementComponent }],
      },
      {
        path: "fcts-common-roles",
        component: FctsRolesSetupMainComponent,
        children: [
          { path: "", component: FctsCommonRolesComponent },
          { path: "users", component: FctsCommonRoleUsersComponent },
        ],
      },
      {
        path: "fcts-confidential-receiver",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "CR" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "fcts-search-authority",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "SRA" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "fcts-structure-receiver",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "SR" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "fcts-signing-authority",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "SGA" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "fcts-dep-secretary",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "DS" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "fcts-hed-of-section",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "HS" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "fcts-hos-secretary",
        component: FctsRolesSetupMainComponent,
        children: [
          {
            path: "",
            component: FctsSpecificRolesComponent,
            data: { roleCode: "HSS" },
          },
          { path: "users", component: FctsSpecificRolesUsersComponent },
        ],
      },
      {
        path: "base-types",
        component: MdSimpleViewComponent,
        data: { dataType: "base_type" },
      },
      {
        path: "correspondence-types",
        component: MdSimpleViewComponent,
        data: { dataType: "correspondence_type" },
      },
      {
        path: "document-types",
        component: MdSimpleViewComponent,
        data: { dataType: "document_type" },
      },
      {
        path: "purpose",
        component: PurposesComponent,
      },
      {
        path: "priority",
        component: PriorityComponent,
      },
      {
        path: "dispatch-methods",
        component: MdSimpleViewComponent,
        data: { dataType: "dispatch_method" },
      },
      {
        path: "reject-reasons",
        component: RejectReasonsComponent,
        data: { dataType: "dispatch_method" },
      },
      {
        path: "year-receiver",
        component: YearReceiverComponent,
      },
      {
        path: "physical-location",
        component: FilingPlanComponent,
        data: { dataType: "location" },
      },
      {
        path: "cabinet",
        component: FilingPlanComponent,
        data: { dataType: "cabinet" },
      },
      {
        path: "row",
        component: FilingPlanComponent,
        data: { dataType: "row" },
      },
      {
        path: "shelf-receiver",
        component: FilingPlanComponent,
        data: { dataType: "shelf" },
      },
      {
        path: "file",
        component: FilingPlanComponent,
        data: { dataType: "file" },
      },
      {
        path: "new-delegation",
        component: CreateDelegationComponent,
      },
      {
        path: "current-delegations",
        component: CurrentDelegationsComponent,
      },
      {
        path: "delegations-report",
        component: DelegationsReportComponent,
      },
      {
        path: "archive-corr-report",
        component: ArchiveReportMainComponent,
      },
      {
        path: "general-inbound-corr-report",
        component: GeneralInboundCorrReport,
        children: [{ path: "", component: GeneralInboundCorrReport }],
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
