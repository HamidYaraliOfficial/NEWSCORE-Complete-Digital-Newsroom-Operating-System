import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
import { AuditService } from '../../common/audit.service';
@Injectable()
export class BreakingService {
  constructor(private readonly prisma:PrismaService,private readonly bus:EventBusService,private readonly audit:AuditService){}
  list(){return this.prisma.breakingNews.findMany({orderBy:{createdAt:'desc'},take:50});}
  async create(dto:any,actorId:string){const b=await this.prisma.breakingNews.create({data:{headline:dto.headline,summary:dto.summary,severity:dto.severity||'HIGH',sourceId:dto.sourceId,status:'ACTIVE',timeline:[{at:new Date().toISOString(),type:'created',actorId}]}});await this.audit.write({actorId,action:'breaking.create',entityType:'BreakingNews',entityId:b.id});this.bus.emit('breaking.created',b);return b;}
  async update(id:string,dto:any,actorId:string){const old=await this.prisma.breakingNews.findUnique({where:{id}});if(!old)throw new NotFoundException();const timeline=Array.isArray(old.timeline)?[...(old.timeline as any[]),{at:new Date().toISOString(),type:'update',actorId,patch:dto}]:[{at:new Date().toISOString(),type:'update',actorId,patch:dto}];const b=await this.prisma.breakingNews.update({where:{id},data:{headline:dto.headline??old.headline,summary:dto.summary??old.summary,severity:dto.severity??old.severity,status:dto.status??old.status,timeline:timeline as any}});this.bus.emit('breaking.updated',b);return b;}
}
