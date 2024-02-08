import { NgModule, ModuleWithProviders } from '@angular/core';
import { multiLanguageTranslatorPipe } from './multi-language-translator.pipe';
export interface multiLanguageTranslatorConfig {
  defaultLang?: string,
  storagePrefix?: string
}
@NgModule({
  declarations: [multiLanguageTranslatorPipe],
  exports: [multiLanguageTranslatorPipe
  ]
})
export class multiLanguageTranslatorModule {
  public static forRoot(config: multiLanguageTranslatorConfig): ModuleWithProviders {
    return {
      ngModule: multiLanguageTranslatorModule,
      providers: [{ 
        provide: 'config',  
        useValue: config 
      }]
    };
  }
}
