import { Module } from '@nestjs/common'; import { LiveController } from './live.controller'; import { LiveService } from './live.service'; import { PrismaService } from '../../prisma.service'; import { EventBusService } from '../../common/event-bus.service';
@Module({controllers:[LiveController],providers:[LiveService,PrismaService,EventBusService]}) export class LiveModule{}
