import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs));}
export function formatDate(value:string|Date,locale='fa',timezone?:string){return new Intl.DateTimeFormat(locale==='fa'?'fa-IR':locale==='zh'?'zh-CN':'en-US',{dateStyle:'medium',timeStyle:'short',timeZone:timezone}).format(new Date(value));}
export function relativeTime(value:string|Date,locale='fa'){const diff=(new Date(value).getTime()-Date.now())/1000;const abs=Math.abs(diff);const units=[[31536000,'year'],[2592000,'month'],[604800,'week'],[86400,'day'],[3600,'hour'],[60,'minute'],[1,'second']] as const;for(const[u,n]of units){if(abs>=u){const v=Math.round(diff/u);return new Intl.RelativeTimeFormat(locale==='fa'?'fa':locale==='zh'?'zh':'en',{numeric:'auto'}).format(v,n as Intl.RelativeTimeFormatUnit);}}return locale==='fa'?'اکنون':locale==='zh'?'刚刚':'now';}
export function toDirection(locale:string){return locale==='fa'?'rtl':'ltr';}
