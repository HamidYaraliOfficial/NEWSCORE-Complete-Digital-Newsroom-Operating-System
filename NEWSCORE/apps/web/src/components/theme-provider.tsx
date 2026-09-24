'use client';
import {ThemeProvider as NextThemesProvider,useTheme} from 'next-themes';
import {PropsWithChildren,useEffect} from 'react';
import {Button} from './ui';
export function ThemeProvider({children}:PropsWithChildren){return <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>{children}</NextThemesProvider>}
export function ThemeControls({labels}:{labels:{system:string;light:string;dark:string;red:string;blue:string}}){const {theme,setTheme}=useTheme();useEffect(()=>{if(theme==='red'||theme==='blue')document.documentElement.dataset.theme=theme;else delete document.documentElement.dataset.theme},[theme]);return <div className="flex flex-wrap gap-1">{Object.entries(labels).map(([key,label])=><Button key={key} variant={theme===key?'default':'ghost'} className="px-2.5 py-1.5 text-xs" onClick={()=>setTheme(key)}>{label}</Button>)}</div>}
