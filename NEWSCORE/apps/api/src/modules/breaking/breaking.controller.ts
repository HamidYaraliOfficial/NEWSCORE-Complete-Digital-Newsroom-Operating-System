import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BreakingService } from './breaking.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
@Controller('breaking')
export class BreakingController {constructor(private readonly service:BreakingService){}
 @Get() list(){return this.service.list();}
 @Post() @UseGuards(AuthGuard) create(@Body() dto:any,@CurrentUser() user:any){return this.service.create(dto,user.sub);}
 @Patch(':id') @UseGuards(AuthGuard) update(@Param('id') id:string,@Body() dto:any,@CurrentUser() user:any){return this.service.update(id,dto,user.sub);}
}
