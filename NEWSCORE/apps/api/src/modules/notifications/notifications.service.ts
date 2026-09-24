import { Injectable } from '@nestjs/common'; import { PrismaService } from '../../prisma.service';
@Injectable() export class NotificationsService {constructor(private readonly prisma:PrismaService){}
 list(userId:string){return this.prisma.notification.findMany({where:{userId},orderBy:{createdAt:'desc'},take:100});}
 unread(userId:string){return this.prisma.notification.count({where:{userId,readAt:null}});}
 async markRead(id:string,userId:string){return this.prisma.notification.updateMany({where:{id,userId},data:{readAt:new Date()}});}
 async create(userId:string,type:string,title:string,body:string,data?:any){return this.prisma.notification.create({data:{userId,type,title,body,data}});}
}
