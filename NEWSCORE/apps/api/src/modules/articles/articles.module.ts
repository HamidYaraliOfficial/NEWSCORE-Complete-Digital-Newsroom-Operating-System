import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
import { AuditService } from '../../common/audit.service';
import { WorkflowModule } from '../workflows/workflow.module';
@Module({imports:[WorkflowModule],controllers:[ArticlesController],providers:[ArticlesService,PrismaService,EventBusService,AuditService]})
export class ArticlesModule {}
