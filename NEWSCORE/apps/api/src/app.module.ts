import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { BreakingModule } from './modules/breaking/breaking.module';
import { LiveModule } from './modules/live/live.module';
import { MediaModule } from './modules/media/media.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { WorkflowModule } from './modules/workflows/workflow.module';
import { PrismaService } from './prisma.service'; import { EventBusService } from './common/event-bus.service'; import { AuditService } from './common/audit.service'; import { HealthController } from './common/health.controller'; import { RealtimeController } from './realtime.gateway';
@Module({imports:[ConfigModule.forRoot({isGlobal:true}),JwtModule.register({}),AuthModule,ArticlesModule,AssignmentsModule,BreakingModule,LiveModule,MediaModule,SearchModule,NotificationsModule,ScheduleModule,AnalyticsModule,AdminModule,WorkflowModule],controllers:[HealthController,RealtimeController],providers:[PrismaService,EventBusService,AuditService]})
export class AppModule {}
