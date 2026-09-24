import { Injectable } from '@nestjs/common'; import { PrismaService } from '../../prisma.service';
@Injectable() export class AnalyticsService {constructor(private readonly prisma:PrismaService){}
 async track(dto:any){return this.prisma.analyticsEvent.create({data:{name:dto.name,articleId:dto.articleId||null,userId:dto.userId||null,sessionId:dto.sessionId||null,properties:dto.properties,occurredAt:dto.occurredAt?new Date(dto.occurredAt):new Date()}});}
 async dashboard(){const since=new Date(Date.now()-24*3600000);const [views,articles,searches]=await Promise.all([this.prisma.analyticsEvent.count({where:{name:'article_view',occurredAt:{gte:since}}}),this.prisma.article.count({where:{status:'PUBLISHED',publishedAt:{gte:since}}}),this.prisma.searchEvent.count({where:{createdAt:{gte:since}}})]);return {since:since.toISOString(),views,articlesPublished24h:articles,searches};}
}
