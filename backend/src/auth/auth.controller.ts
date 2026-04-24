import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.login(dto.email, dto.password);

    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: false, // 개발환경 HTTP라서 false, 배포 시 true
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: '/',
    });

    return { role: data.role }; // access_token은 쿠키로 전달하므로 body에서 제거
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { message: 'logged out' };
  }
}
