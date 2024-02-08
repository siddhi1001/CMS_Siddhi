import { Pipe, PipeTransform } from '@angular/core';
import { multiLanguageTranslator } from './multi-language-translator.service';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';

@Pipe({ name: 'translator', pure: false })
export class multiLanguageTranslatorPipe implements PipeTransform {
  constructor(private translator: multiLanguageTranslator) { }
  transform(value: any, ar?: any) {
    if (!value) return;
    if (ar !== undefined) {
      return Object.keys({ ar })[0] === this.translator.lang ? ar : value;
    }
    return this.translator.get(value);
  }
}