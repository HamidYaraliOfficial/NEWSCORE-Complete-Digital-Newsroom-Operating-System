import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{return ['fa','en','zh'].map(locale=>({url:`http://localhost:3000/${locale}`,lastModified:new Date()}));}
