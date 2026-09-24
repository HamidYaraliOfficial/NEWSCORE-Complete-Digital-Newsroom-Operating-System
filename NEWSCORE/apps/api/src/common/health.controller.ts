import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Redis from 'ioredis';
import { Client } from '@opensearch-project/opensearch';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async health() {
    const services: Record<string, string> = {};
    try { await this.prisma.$queryRaw`SELECT 1`; services.database='up'; } catch { services.database='down'; }
    try { const r=new Redis(process.env.REDIS_URL||'redis://localhost:6379'); await r.ping(); await r.quit(); services.redis='up'; } catch { services.redis='down'; }
    try { const s=new Client({node:process.env.SEARCH_URL||'http://localhost:9200'}); await s.ping(); services.search='up'; } catch { services.search='down'; }
    return {status:Object.values(services).every(v=>v==='up')?'ok':'degraded', timestamp:new Date().toISOString(), services};
  }
  @Get('ready') ready() { return {ready:true}; }
}
