import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as argon2 from 'argon2';
import { randomUUID, createHash } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  private hash(value:string) { return createHash('sha256').update(value).digest('hex'); }
  async register(email:string,password:string,displayName:string,locale='fa') {
    const existing=await this.prisma.user.findUnique({where:{email}}); if(existing) throw new BadRequestException('Email already exists');
    const user=await this.prisma.user.create({data:{email,passwordHash:await argon2.hash(password),displayName,locale}});
    return this.issue(user.id,user.email,user.displayName,locale);
  }
  async login(email:string,password:string) {
    const user=await this.prisma.user.findUnique({where:{email},include:{roles:{include:{role:true}}}});
    if(!user || user.status!=='ACTIVE' || !(await argon2.verify(user.passwordHash,password))) throw new UnauthorizedException('Invalid credentials');
    return this.issue(user.id,user.email,user.displayName,user.locale,user.roles.map(x=>x.role.name));
  }
  private async issue(id:string,email:string,displayName:string,locale:string,roles:string[]=[]){
    const jti=randomUUID();
    const accessToken=this.jwt.sign({sub:id,email,displayName,locale,roles,jti},{secret:process.env.JWT_SECRET,expiresIn:'2h'});
    const refreshToken=this.jwt.sign({sub:id,jti},{secret:process.env.JWT_REFRESH_SECRET,expiresIn:'30d'});
    await this.prisma.session.create({data:{userId:id,tokenHash:this.hash(refreshToken),expiresAt:new Date(Date.now()+30*86400000),device:'browser'}});
    return {accessToken,refreshToken,user:{id,email,displayName,locale,roles}};
  }
  async refresh(refreshToken:string){
    try {
      const p=this.jwt.verify(refreshToken,{secret:process.env.JWT_REFRESH_SECRET}) as {sub:string};
      const session=await this.prisma.session.findUnique({where:{tokenHash:this.hash(refreshToken)}});
      if(!session || session.revokedAt || session.expiresAt<new Date()) throw new UnauthorizedException();
      const user=await this.prisma.user.findUniqueOrThrow({where:{id:p.sub},include:{roles:{include:{role:true}}}});
      return this.issue(user.id,user.email,user.displayName,user.locale,user.roles.map(x=>x.role.name));
    } catch { throw new UnauthorizedException('Invalid refresh token'); }
  }
  async revoke(userId:string){ await this.prisma.session.updateMany({where:{userId,revokedAt:null},data:{revokedAt:new Date()}}); return {revoked:true}; }
}
