import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministrationService } from '../services/administration.service';
import { BreadCrumbsModel } from '../administration.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  public breadcrumbs: BreadCrumbsModel[];
  breadcrumbsSubscription: Subscription;

  constructor(
    private router: Router,
    public _administrationService: AdministrationService) { }

  ngOnInit() {
    this.breadcrumbsSubscription = this._administrationService.currentBreadcrumbList.subscribe(breadcrumbList => this.breadcrumbs = breadcrumbList);
  }

  ngOnDestroy() {
    this.breadcrumbsSubscription.unsubscribe();
  }

  navigateTo(element: BreadCrumbsModel) {
    if (element.path) {
      this._administrationService.changeSecExp(element.section);
      this.router.navigate([element.path]);
    }
  }

}
