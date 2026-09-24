import { Worker } from 'bullmq'; import IORedis from 'ioredis'; import { PrismaClient } from '@prisma/client';
const connection=new IORedis(process.env.REDIS_URL||'redis://localhost:6379',{maxRetriesPerRequest:null}); const prisma=new PrismaClient();
const worker=new Worker('newscore-newsroom',async job=>{
 if(job.name==='publish-scheduled'){const a=await prisma.article.findUnique({where:{id:String((job.data as any).articleId)}});if(a?.status==='SCHEDULED' && a.publishedAt && a.publishedAt<=new Date()) await prisma.article.update({where:{id:a.id},data:{status:'PUBLISHED',publishedAt:new Date()}});}
 if(job.name==='analytics-rollup'){await prisma.analyticsEvent.count({where:{occurredAt:{gte:new Date(Date.now()-3600000)}}});}
 if(job.name==='search-reindex'){}
 return true;
},{connection,concurrency:10});
worker.on('completed',j=>console.log(`completed ${j.id}`)); worker.on('failed',(j,e)=>console.error(`failed ${j?.id}`,e));
process.on('SIGTERM',async()=>{await worker.close();await prisma.$disconnect();await connection.quit();});
