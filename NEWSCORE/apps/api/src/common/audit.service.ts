import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async write(input: {actorId?: string; action: string; entityType: string; entityId?: string; ipAddress?: string; requestId?: string; traceId?: string; metadata?: unknown;}) {
    return this.prisma.auditLog.create({data: {
      actorId: input.actorId, action: input.action, entityType: input.entityType, entityId: input.entityId,
      ipAddress: input.ipAddress, requestId: input.requestId, traceId: input.traceId, metadata: input.metadata as any,
    }});
  }
}
