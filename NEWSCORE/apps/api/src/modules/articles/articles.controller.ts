import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
@Controller('articles')
export class ArticlesController {
  constructor(private readonly service:ArticlesService){}
  @Get() list(@Query() q:any){return this.service.list({q:q.q,section:q.section,language:q.language,status:q.status,limit:Number(q.limit||20)});}
  @Get('slug/:slug') get(@Param('slug') slug:string){return this.service.getBySlug(slug);}
  @Post() @UseGuards(AuthGuard) create(@Body() dto:any,@CurrentUser() user:any){return this.service.create(dto,user.sub);}
  @Patch(':id') @UseGuards(AuthGuard) update(@Param('id') id:string,@Body() dto:any,@CurrentUser() user:any){return this.service.update(id,dto,user.sub);}
  @Post(':id/submit') @UseGuards(AuthGuard) submit(@Param('id') id:string,@CurrentUser() user:any){return this.service.submit(id,user.sub);}
  @Post(':id/approve') @UseGuards(AuthGuard) approve(@Param('id') id:string,@CurrentUser() user:any){return this.service.approve(id,user.sub);}
  @Post(':id/publish') @UseGuards(AuthGuard) publish(@Param('id') id:string,@CurrentUser() user:any){return this.service.publish(id,user.sub);}
}
