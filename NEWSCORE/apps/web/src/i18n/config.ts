import {Locale} from './dictionaries';
export const locales:Locale[]=['fa','en','zh'];
export function isLocale(v:string):v is Locale{return locales.includes(v as Locale);}
export function direction(locale:Locale){return locale==='fa'?'rtl':'ltr';}
