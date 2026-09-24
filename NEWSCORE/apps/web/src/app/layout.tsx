import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'NEWSCORE',description:'Complete Digital Newsroom Operating System',robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html suppressHydrationWarning><body>{children}</body></html>}
