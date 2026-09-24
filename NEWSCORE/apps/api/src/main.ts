import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(){
  const app=await NestFactory.create(AppModule,{bufferLogs:true});
  app.setGlobalPrefix('api'); app.use(helmet({contentSecurityPolicy:false}));
  app.enableCors({origin:(process.env.WEB_URL||'http://localhost:3000').split(','),credentials:true});
  app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true,forbidNonWhitelisted:false}));
  const config=new DocumentBuilder().setTitle('NEWSCORE API').setDescription('Enterprise Digital Newsroom API').setVersion('1.0.0').addBearerAuth().build();
  SwaggerModule.setup('docs',app,SwaggerModule.createDocument(app,config));
  await app.listen(Number(process.env.PORT||4000));
}
bootstrap();
