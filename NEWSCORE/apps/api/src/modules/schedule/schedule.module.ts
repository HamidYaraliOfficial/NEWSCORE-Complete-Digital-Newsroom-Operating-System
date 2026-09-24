import { Module } from '@nestjs/common'; import { ScheduleController } from './schedule.controller'; import { ScheduleService } from './schedule.service'; import { PrismaService } from '../../prisma.service'; import { TimeService } from '../../common/time.service';
@Module({controllers:[ScheduleController],providers:[ScheduleService,PrismaService,TimeService]}) export class ScheduleModule{}
