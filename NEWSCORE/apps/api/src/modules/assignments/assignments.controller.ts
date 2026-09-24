import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
@Controller('assignments') @UseGuards(AuthGuard)
export class AssignmentsController {
  constructor(private readonly service:AssignmentsService){}
  @Get() list(@CurrentUser() user:any){return this.service.list(user);}
  @Post() create(@Body() dto:any,@CurrentUser() user:any){return this.service.create(dto,user.sub);}
  @Patch(':id/status') move(@Param('id') id:string,@Body() dto:any,@CurrentUser() user:any){return this.service.move(id,dto.status,user.sub);}
}
