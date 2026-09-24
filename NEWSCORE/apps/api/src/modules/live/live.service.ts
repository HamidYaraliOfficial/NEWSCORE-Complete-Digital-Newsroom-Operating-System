import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
@Injectable()
export class LiveService {
  constructor(private readonly prisma:PrismaService,private readonly bus:EventBusService){}
  list(){return this.prisma.liveBlog.findMany({include:{updates:{orderBy:{createdAt:'desc'},take:30,include:{author:true}}},orderBy:{updatedAt:'desc'}});}
  get(slug:string){return this.prisma.liveBlog.findUnique({where:{slug},include:{updates:{orderBy:{createdAt:'desc'},include:{author:true}}}});}
  async create(dto:any){return this.prisma.liveBlog.create({data:{title:dto.title,slug:dto.slug,status:'LIVE',autoRefreshSeconds:dto.autoRefreshSeconds||10}});}
  async addUpdate(slug:string,dto:any,authorId:string){const blog=await this.prisma.liveBlog.findUnique({where:{slug}});if(!blog)throw new NotFoundException();const u=await this.prisma.liveBlogUpdate.create({data:{liveBlogId:blog.id,authorId,text:dto.text,data:dto.data,publishedAt:dto.publish===false?null:new Date(),pinned:Boolean(dto.pinned),highlight:Boolean(dto.highlight)}});await this.prisma.liveBlog.update({where:{id:blog.id},data:{updatedAt:new Date()}});this.bus.emit('liveblog.updated',{liveBlogId:blog.id,update:u});return u;}
}
