import { Module } from '@nestjs/common';
import { BreakingController } from './breaking.controller';
import { BreakingService } from './breaking.service';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
import { AuditService } from '../../common/audit.service';
@Module({controllers:[BreakingController],providers:[BreakingService,PrismaService,EventBusService,AuditService]}) export class BreakingModule{}
