import { Injectable, Inject } from '@angular/core';
declare const require;

@Injectable({
  providedIn: 'root'
})

export class multiLanguageTranslator {
  private prefix = 'current-language';
  private languagesList = ["en", "ar"];
  private languagesObject;

  private html = document.getElementsByTagName('html')[0];
  private body = document.getElementsByTagName('body')[0];
  public lang;
  public translatorDir: string;
  public translatorClass: string;

  constructor(@Inject('config') private config) {
    if (this.config.storagePrefix) this.prefix = `${this.config.storagePrefix}-lang`;
    this.lang = localStorage.getItem(this.prefix) || this.config.defaultLang || 'en';
    this.setLanguage(this.lang);
  }
  setLanguage(value) {
    this.lang = value;
    localStorage.setItem(this.prefix, value);
    // ${value}
    this.languagesObject = require(`./i18n/${this.lang}.json`);
    this.translatorDir = this.languagesList.indexOf(value) !== 0 ? 'rtl' : 'ltr';
    this.translatorClass = this.languagesList.indexOf(value) !== 0 ? 'rtl_bdy' : 'ltr_bdy';
    this.html.setAttribute('dir', this.translatorDir );
    this.body.setAttribute('class', this.translatorClass );
    this.html.setAttribute('lang', this.lang);
    // console.log(this.languagesObject , 'test', this.lang,this.translatorDir,this.translatorClass);
    // const mapped = Object.keys(this.languagesObject).map(key => ({type: key, value: this.languagesObject[key]}));
    // console.log(mapped);
  }
  get(key) {
    try { return this.languagesObject[key]; } catch (error) { 
      
    }
  }
}
