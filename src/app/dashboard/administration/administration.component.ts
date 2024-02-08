import { Component, OnInit } from '@angular/core';
import { AdministrationService } from 'src/app/dashboard/administration/services/administration.service';
import { ErrorHandlerFctsService } from 'src/app/dashboard/services/error-handler-fcts.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {
  structureJson: any;
  breadcrumbList: Array<any> = [];
  routeObj = new Object();
  navigateEvent: Subscription;
  paragraphArr = [2, 3];

  constructor(
    public _router: Router
    , private _administration: AdministrationService
    , private _errorHandlerFctsService: ErrorHandlerFctsService) { }

  ngOnInit() {
    this.getAdminPageStructure();
  }

  ngOnDestroy() {
    this.navigateEvent.unsubscribe();
  }

  getAdminPageStructure(): void {
    this._administration.getAdminPageStructure().subscribe(
      response => {
        this.structureJson = response;
        this._administration.changeMPageStr(this.structureJson);
        this.listenRouting();
        if (this.breadcrumbList.length === 0) {
          this.biuldBreadCrumbs(this._router.url);
        }
      },
      responseError => {
        this._errorHandlerFctsService.handleError(responseError).subscribe();
      }
    );
  }

  listenRouting() {
    this.navigateEvent = this._router.events.subscribe((router: any) => {
      const routerUrl = router.urlAfterRedirects;
      if (routerUrl && typeof routerUrl === 'string') {
        this.biuldBreadCrumbs(routerUrl);
      }
    });
  }

  biuldBreadCrumbs(routerUrl: string) {
    let routerList: Array<any>, target: any;
    target = this.structureJson;
    this.breadcrumbList.length = 0;
    routerList = routerUrl.slice(1).split('/');
    routerList.forEach((router, index) => {
      let name: string;
      let path: string;
      let routeObj = new Object();
      if (router === 'dashboard') {
        name = '';
      } else if (router === 'administration') {
        name = 'Administration';
      } else {
        routeObj = this.recursionSearch(target, router);
        name = routeObj && routeObj.hasOwnProperty('name') ? routeObj['name'].en : '';
        if (routeObj && this.paragraphArr.indexOf(routeObj['level']) > -1) {
          const parent = this.getLevelStructure(target, router);
          this.fillBreadcrumbList(parent.name.en, '', parent.route, index);
        }
      }
      path = router;
      this.fillBreadcrumbList(name, path, '', index);
    });
    this._administration.changebreadcrumbList(this.breadcrumbList);
  }

  fillBreadcrumbList(name: string, path: string, section: string, index: number): void {
    this.breadcrumbList.push({
      name: name,
      path: (index === 0) ? path : `${this.breadcrumbList[index - 1].path}/${path}`,
      section: section
    });
  }

  recursionSearch(obj, searchStr) {
    let result;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].route === searchStr) {
        return obj[i];
      } else {
        if (obj[i].hasOwnProperty('children') && obj[i].children.length > 0) {
          result = this.recursionSearch(obj[i].children, searchStr);
          if (result) {
            return result;
          }
        }
      }
    }
    return result;
  }

  getLevelStructure(obj: any, searchString: string) {
    const filteredData = this.filterData(obj, function (item) {
      let result = false;
      if (Object.keys(item).length > 0) {
        if (item.route === searchString) {
          result = true;
        }
      }
      return result;
    });
    return filteredData[0];
  }

  filterData(data: any, predicate) {
    return !!!data ? null : data.reduce((list, entry) => {
      let clone = null;
      if (predicate(entry)) {
        clone = Object.assign({}, entry);
        clone.wanted = true;
      } else if (entry.children != null) {
        let children = this.filterData(entry.children, predicate);
        if (children.length > 0) {
          clone = Object.assign({}, entry, { children: children });
        }
      }
      clone ? clone.expand = true : null;
      clone && list.push(clone);
      return list;
    }, []);
  }
}
