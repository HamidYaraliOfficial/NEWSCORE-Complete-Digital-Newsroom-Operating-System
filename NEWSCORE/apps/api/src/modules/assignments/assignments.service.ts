import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';
import { EventBusService } from '../../common/event-bus.service';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma:PrismaService,private readonly audit:AuditService,private readonly events:EventBusService){}
  async list(user?:any){const where=user?.roles?.includes('Reporter')?{assigneeId:user.sub}:{};return this.prisma.assignment.findMany({where,include:{assignee:true,creator:true,desk:true,section:true},orderBy:{deadline:'asc'}});}
  async create(dto:any,actorId:string){if(!dto.title||!dto.assigneeId||!dto.deadline) throw new BadRequestException('title, assigneeId and deadline are required');const a=await this.prisma.assignment.create({data:{title:dto.title,description:dto.description,deskId:dto.deskId,sectionId:dto.sectionId,assigneeId:dto.assigneeId,creatorId:actorId,deadline:new Date(dto.deadline),expectedPublishAt:dto.expectedPublishAt?new Date(dto.expectedPublishAt):null,priority:dto.priority||'NORMAL',locationId:dto.locationId,requiredMedia:dto.requiredMedia,sourceSuggestions:dto.sourceSuggestions}});await this.activity(a.id,actorId,'assignment.created',dto);this.events.emit('assignment.created',{assignmentId:a.id,assigneeId:a.assigneeId});await this.audit.write({actorId,action:'assignment.create',entityType:'Assignment',entityId:a.id});return a;}
  async move(id:string,status:any,actorId:string){const exists=await this.prisma.assignment.findUnique({where:{id}});if(!exists)throw new NotFoundException();const updated=await this.prisma.assignment.update({where:{id},data:{status}});await this.activity(id,actorId,'assignment.status',{from:exists.status,to:status});await this.audit.write({actorId,action:'assignment.status',entityType:'Assignment',entityId:id,metadata:{from:exists.status,to:status}});return updated;}
  private activity(assignmentId:string,actorId:string,type:string,data:any){return this.prisma.activity.create({data:{assignmentId,actorId,type,data}});}
}
