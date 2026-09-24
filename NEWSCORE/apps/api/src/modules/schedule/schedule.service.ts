import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TimeService } from '../../common/time.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma:PrismaService,private readonly time:TimeService){}
  async getAvailability(userId:string,timezone?:string){
    const user=await this.prisma.user.findUniqueOrThrow({where:{id:userId}});
    const rules=await this.prisma.availabilityRule.findMany({where:{userId},orderBy:{day:'asc'}});
    const normalized=rules.length?rules:[0,1,2,3,4].map(day=>({day,open:'09:00',close:'17:00',enabled:true}));
    return this.time.availability(new Date(),timezone||user.timezone,normalized);
  }
  async setRules(userId:string,rules:any[],timezone?:string){
    if(rules.some(r=>r.day<0||r.day>6||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(r.open)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(r.close))) throw new BadRequestException('Invalid schedule rule');
    await this.prisma.$transaction([this.prisma.availabilityRule.deleteMany({where:{userId}}),this.prisma.availabilityRule.createMany({data:rules.map(r=>({userId,day:Number(r.day),open:r.open,close:r.close,enabled:r.enabled!==false}))}),...(timezone?[this.prisma.user.update({where:{id:userId},data:{timezone}})]:[])] as any);
    return this.getAvailability(userId,timezone);
  }
  publicationQueue(){return this.prisma.article.findMany({where:{status:'SCHEDULED'},include:{schedules:true,section:true},orderBy:{publishedAt:'asc'},take:100});}
}
