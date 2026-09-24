import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/auth.guard';

class LoginDto { @IsEmail() email!:string; @IsString() @MinLength(8) password!:string; }
class RegisterDto extends LoginDto { @IsString() @MinLength(2) displayName!:string; @IsString() locale='fa'; }
class RefreshDto { @IsString() refreshToken!:string; }
@Controller('auth')
export class AuthController {
  constructor(private readonly auth:AuthService){}
  @Post('register') register(@Body() dto:RegisterDto){ return this.auth.register(dto.email,dto.password,dto.displayName,dto.locale); }
  @Post('login') login(@Body() dto:LoginDto){ return this.auth.login(dto.email,dto.password); }
  @Post('refresh') refresh(@Body() dto:RefreshDto){ return this.auth.refresh(dto.refreshToken); }
  @Post('logout-everywhere') @UseGuards(AuthGuard) logout(@Req() req:any){ return this.auth.revoke(req.user.sub); }
}
