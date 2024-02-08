import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    runGuardsAndResolvers: 'always'
  },
  { path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes , {onSameUrlNavigation: 'reload'}
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
