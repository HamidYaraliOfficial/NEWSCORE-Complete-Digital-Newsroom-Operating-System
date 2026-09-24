import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SearchService {
  private readonly client=new Client({node:process.env.SEARCH_URL||'http://localhost:9200'});
  constructor(private readonly prisma:PrismaService){}
  async search(params:{q:string;language?:string;section?:string;from?:string;to?:string;limit?:number}){
    const started=Date.now(); const limit=Math.min(params.limit||20,100);
    try{
      const must:any[]=[{multi_match:{query:params.q||'*',fields:['title^5','subtitle^2','summary^2','lead','text'],type:'best_fields',fuzziness:'AUTO'}}];
      const filter:any[]=[]; if(params.language)filter.push({term:{language:params.language}}); if(params.section)filter.push({term:{sectionId:params.section}}); if(params.from||params.to)filter.push({range:{publishedAt:{...(params.from?{gte:params.from}:{}),...(params.to?{lte:params.to}:{})}}});
      const r=await this.client.search({index:process.env.SEARCH_INDEX||'newscore_articles',size:limit,query:{bool:{must,filter}},sort:[{'publishedAt':'desc'},{_score:'desc'}]});
      return {source:'opensearch',latencyMs:Date.now()-started,results:(r.hits.hits as any[]).map(h=>h._source)};
    }catch{
      const data=await this.prisma.article.findMany({where:{status:'PUBLISHED',...(params.language?{language:params.language}:{}),...(params.section?{sectionId:params.section}:{ }),OR:[{title:{contains:params.q,mode:'insensitive'}},{summary:{contains:params.q,mode:'insensitive'}},{lead:{contains:params.q,mode:'insensitive'}}]},orderBy:{publishedAt:'desc'},take:limit});
      return {source:'database-fallback',latencyMs:Date.now()-started,results:data};
    }
  }
  async reindex(article:any){
    await this.client.index({index:process.env.SEARCH_INDEX||'newscore_articles',id:article.id,document:{id:article.id,title:article.title,subtitle:article.subtitle,summary:article.summary,lead:article.lead,language:article.language,sectionId:article.sectionId,publishedAt:article.publishedAt,slug:article.slug,text:JSON.stringify(article.body)}});
  }
}
