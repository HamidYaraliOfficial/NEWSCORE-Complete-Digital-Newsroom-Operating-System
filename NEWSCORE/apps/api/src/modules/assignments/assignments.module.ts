import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../common/audit.service';
import { EventBusService } from '../../common/event-bus.service';
@Module({controllers:[AssignmentsController],providers:[AssignmentsService,PrismaService,AuditService,EventBusService],exports:[AssignmentsService]}) export class AssignmentsModule{}
