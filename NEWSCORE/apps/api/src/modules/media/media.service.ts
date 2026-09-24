import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MediaService {
  private readonly s3=new S3Client({region:process.env.S3_REGION||'us-east-1',endpoint:process.env.S3_ENDPOINT,forcePathStyle:Boolean(process.env.S3_ENDPOINT),credentials:{accessKeyId:process.env.S3_ACCESS_KEY||'',secretAccessKey:process.env.S3_SECRET_KEY||''}});
  constructor(private readonly prisma:PrismaService){}
  async presign(dto:any,ownerId?:string){
    const allowed=/^(image|video|audio|application|text)\//.test(dto.mimeType||'');
    const max=Number(dto.maxSize||250*1024*1024); if(!allowed||Number(dto.size)>max) throw new BadRequestException('Unsupported media or size');
    const ext=(dto.filename.split('.').pop()||'bin').replace(/[^a-z0-9]/gi,'').toLowerCase(); const key=`raw/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${ext}`;
    await this.prisma.mediaAsset.create({data:{type:dto.type||'DOCUMENT',key,filename:dto.filename,mimeType:dto.mimeType,size:Number(dto.size),metadata:{ownerId},processingState:'UPLOADING'}});
    const uploadUrl=await getSignedUrl(this.s3,new PutObjectCommand({Bucket:process.env.S3_BUCKET||'newscore-media',Key:key,ContentType:dto.mimeType}),{expiresIn:900});
    return {key,uploadUrl,expiresIn:900};
  }
  list(){return this.prisma.mediaAsset.findMany({orderBy:{createdAt:'desc'},take:100});}
}
