import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
import { AuditService } from '../../common/audit.service';
@Module({providers:[WorkflowService,PrismaService,EventBusService,AuditService],exports:[WorkflowService]})
export class WorkflowModule {}
