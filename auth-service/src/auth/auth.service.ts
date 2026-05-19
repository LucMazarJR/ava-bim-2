import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async validate(loginDto: LoginDto) {
    let user: UserDto;

    try {
      const response = await firstValueFrom(
        this.httpService.get<UserDto>(
          `${process.env.USER_SERVICE_URL}/user/email/${loginDto.email}`,
        ),
      );

      user = response.data;
    } catch {
      throw new UnauthorizedException();
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException();
    else {
      const payload = { sub: user.email, username: user.name };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }
  }
}
