import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('이미 존재하는 이메일입니다');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed },
    });

    return { message: '회원가입 성공', userId: user.id };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as string,
    };
    const token = this.jwtService.sign(payload);

    return { access_token: token, role: user.role as string };
  }
}
