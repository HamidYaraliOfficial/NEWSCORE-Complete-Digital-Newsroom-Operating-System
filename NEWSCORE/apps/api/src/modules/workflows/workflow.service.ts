import { BadRequestException, Injectable } from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { WORKFLOW_TRANSITIONS } from '../../../../packages/shared/src';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
import { AuditService } from '../../common/audit.service';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma:PrismaService,private readonly events:EventBusService,private readonly audit:AuditService){}
  async transition(articleId:string,to:ArticleStatus,actorId:string,reason?:string){
    const article=await this.prisma.article.findUnique({where:{id:articleId}}); if(!article) throw new BadRequestException('Article not found');
    const allowed=(WORKFLOW_TRANSITIONS as any)[article.status]||[]; if(!allowed.includes(to)) throw new BadRequestException(`Transition ${article.status} -> ${to} is not allowed`);
    const updated=await this.prisma.article.update({where:{id:articleId},data:{status:to}});
    const version=await this.prisma.articleRevision.count({where:{articleId}})+1;
    await this.prisma.articleRevision.create({data:{articleId,version,editorId:actorId,snapshot:updated as any,diff:{from:article.status,to},reason}});
    await this.audit.write({actorId,action:'article.transition',entityType:'Article',entityId:articleId,metadata:{from:article.status,to,reason}});
    this.events.emit(`article.${to.toLowerCase()}`,{articleId,from:article.status,to});
    return updated;
  }
}
