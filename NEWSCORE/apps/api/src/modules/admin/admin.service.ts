import { Injectable } from '@nestjs/common'; import { PrismaService } from '../../prisma.service';
@Injectable() export class AdminService {constructor(private readonly prisma:PrismaService){}
 async overview(){const [users,articles,assignments,breaking,live,media,audit]=await Promise.all([this.prisma.user.count(),this.prisma.article.count(),this.prisma.assignment.count(),this.prisma.breakingNews.count({where:{status:'ACTIVE'}}),this.prisma.liveBlog.count({where:{status:'LIVE'}}),this.prisma.mediaAsset.count(),this.prisma.auditLog.count()]);return {users,articles,assignments,breaking,live,media,audit};}
 users(){return this.prisma.user.findMany({include:{roles:{include:{role:true}}},orderBy:{createdAt:'desc'},take:200});}
 roles(){return this.prisma.role.findMany({include:{permissions:{include:{permission:true}}},orderBy:{name:'asc'}});}
 flags(){return this.prisma.featureFlag.findMany({orderBy:{key:'asc'}});}
 async setFlag(key:string,enabled:boolean){return this.prisma.featureFlag.upsert({where:{key},update:{enabled,version:{increment:1}},create:{key,enabled}});}
 audits(){return this.prisma.auditLog.findMany({orderBy:{createdAt:'desc'},take:200});}
}
