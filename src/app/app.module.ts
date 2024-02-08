import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { MatButtonModule, MatCheckboxModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatMenuModule } from "@angular/material/menu";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MalihuScrollbarModule } from "ngx-malihu-scrollbar";
import { DraftnamePipe } from "../app/dashboard/pipes/draftname.pipe";
import { ReactiveFormsModule } from '@angular/forms';
import { AppLoadConstService } from './app-load-const.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { multiLanguageTranslatorModule } from '../assets/translator/index';
import { AngularResizedEventModule } from 'angular-resize-event';
export function initApp(appInitService: AppLoadConstService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}
@NgModule({
  declarations: [AppComponent, DraftnamePipe],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MalihuScrollbarModule.forRoot(),
    ReactiveFormsModule, NgScrollbarModule,
    MatTooltipModule,
    AngularResizedEventModule,
    multiLanguageTranslatorModule.forRoot({
      defaultLang: 'en',
      storagePrefix: 'current-language'
    })],
  exports: [MatButtonModule, MatCheckboxModule],
  providers: [
    AppLoadConstService, {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppLoadConstService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
  // schemas:[ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
