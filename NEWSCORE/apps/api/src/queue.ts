import { Queue } from 'bullmq'; import IORedis from 'ioredis';
const connection=new IORedis(process.env.REDIS_URL||'redis://localhost:6379',{maxRetriesPerRequest:null});
export const newsroomQueue=new Queue('newscore-newsroom',{connection});
export async function enqueue(type:string,payload:unknown,delay=0){return newsroomQueue.add(type,payload,{delay,attempts:5,backoff:{type:'exponential',delay:1000},removeOnComplete:1000,removeOnFail:5000});}
