import {ThemeProvider} from '@/components/theme-provider';
import {PublicHeader} from '@/components/shell';
import {isLocale,direction} from '@/i18n/config';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';

export default async function LocaleLayout({children,params}:{children:ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  return <div lang={locale} dir={direction(locale)}><ThemeProvider><PublicHeader locale={locale}/>{children}</ThemeProvider></div>;
}
