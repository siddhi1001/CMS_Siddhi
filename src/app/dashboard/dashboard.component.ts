import { Component, OnInit } from '@angular/core';
import {FCTSDashBoard} from '../../environments/environment';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  basehref:String=FCTSDashBoard.BaseHref;
  mainMenuAction:boolean = true;
  constructor() { }

  ngOnInit() {
  }
  mainMenuActionButton() {
    this.mainMenuAction = !this.mainMenuAction; 
  }
}
