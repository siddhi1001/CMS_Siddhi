import { Injectable } from '@angular/core';
import { CanActivate, Router, Route } from '@angular/router';
import { AppLoadConstService } from 'src/app/app-load-const.service';


@Injectable({
  providedIn: 'root'
})
export class IsadminGuard implements CanActivate {
  constructor(private _appLoadConstService: AppLoadConstService,
    private _router: Router) { }

  canActivate(): boolean {
    const globalConstants = this._appLoadConstService.getConstants();
    if (globalConstants.FCTS_Dashboard.AdminGroup) {
      return true;
    } else {
      this._router.navigate(['/dashboard/external']);
      return false;
    }
  }

  canLoad(route: Route): boolean {
    const globalConstants = this._appLoadConstService.getConstants();
    if (globalConstants.FCTS_Dashboard.AdminGroup) {
      return true;
    } else {
      this._router.navigate(['/dashboard/external']);
      return false;
    }
  }
}
